from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from openpyxl import Workbook

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'warehouse-construction-secret-key-2024')
JWT_ALGORITHM = 'HS256'

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== AUTH MODELS ====================
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ==================== EQUIPAMENTO MODEL ====================
class EquipamentoCreate(BaseModel):
    codigo: str
    descricao: str
    marca: str = ""
    modelo: str = ""
    data_aquisicao: Optional[str] = None
    ativo: bool = True
    categoria: str = ""
    numero_serie: str = ""
    responsavel: str = ""
    estado_conservacao: str = "Bom"  # Bom, Razoável, Mau
    foto: str = ""
    local_id: Optional[str] = None

class Equipamento(EquipamentoCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tipo: str = "Equipamento"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== VIATURA MODEL ====================
class ViaturaCreate(BaseModel):
    matricula: str
    marca: str = ""
    modelo: str = ""
    combustivel: str = "Gasoleo"  # Gasoleo, Gasolina, Eletrico, Hibrido
    ativa: bool = True
    foto: str = ""
    data_vistoria: Optional[str] = None
    data_seguro: Optional[str] = None
    documento_unico: str = ""
    apolice_seguro: str = ""
    observacoes: str = ""
    local_id: Optional[str] = None

class Viatura(ViaturaCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== MATERIAL MODEL ====================
class MaterialCreate(BaseModel):
    codigo: str
    descricao: str
    unidade: str = "unidade"  # unidade, kg, m, m2, m3, litro, saco, palete
    stock_atual: float = 0
    stock_minimo: float = 0
    ativo: bool = True
    local_id: Optional[str] = None

class Material(MaterialCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== LOCAL MODEL ====================
class LocalCreate(BaseModel):
    codigo: str
    nome: str
    tipo: str = "ARM"  # ARM (Armazém), OFI (Oficina), OBR (Obra), OBS (Obsoleto)
    obra_id: Optional[str] = None
    ativo: bool = True

class Local(LocalCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== OBRA MODEL ====================
class ObraCreate(BaseModel):
    codigo: str
    nome: str
    endereco: str = ""
    cliente: str = ""
    estado: str = "Ativa"  # Ativa, Concluida, Pausada

class Obra(ObraCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== MOVIMENTO ATIVO MODEL ====================
class MovimentoAtivoCreate(BaseModel):
    ativo_id: str
    tipo_ativo: str  # equipamento
    tipo_movimento: str  # Saida, Devolucao
    origem_id: Optional[str] = None
    destino_id: Optional[str] = None
    responsavel: str = ""
    observacoes: str = ""

class MovimentoAtivo(MovimentoAtivoCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    data_hora: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== MOVIMENTO STOCK MODEL ====================
class MovimentoStockCreate(BaseModel):
    material_id: str
    tipo_movimento: str  # Entrada, Saida
    quantidade: float
    obra_id: Optional[str] = None
    fornecedor: str = ""
    documento: str = ""
    responsavel: str = ""
    observacoes: str = ""

class MovimentoStock(MovimentoStockCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    data_hora: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== MOVIMENTO VIATURA MODEL ====================
class MovimentoViaturaCreate(BaseModel):
    viatura_id: str
    obra_id: Optional[str] = None
    condutor: str = ""
    km_inicial: float = 0
    km_final: float = 0
    data: str = ""
    observacoes: str = ""

class MovimentoViatura(MovimentoViaturaCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== AUTH FUNCTIONS ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, name=data.name, email=data.email)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user["id"], name=user["name"], email=user["email"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return UserResponse(id=user["id"], name=user["name"], email=user["email"])

# ==================== EQUIPAMENTO ROUTES ====================
@api_router.get("/equipamentos", response_model=List[Equipamento])
async def get_equipamentos(user=Depends(get_current_user)):
    items = await db.equipamentos.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/equipamentos", response_model=Equipamento)
async def create_equipamento(data: EquipamentoCreate, user=Depends(get_current_user)):
    # Check if codigo already exists
    existing = await db.equipamentos.find_one({"codigo": data.codigo}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Código já existe")
    
    equipamento = Equipamento(**data.model_dump())
    doc = equipamento.model_dump()
    await db.equipamentos.insert_one(doc)
    return equipamento

@api_router.put("/equipamentos/{equipamento_id}", response_model=Equipamento)
async def update_equipamento(equipamento_id: str, data: EquipamentoCreate, user=Depends(get_current_user)):
    existing = await db.equipamentos.find_one({"id": equipamento_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    update_data = data.model_dump()
    await db.equipamentos.update_one({"id": equipamento_id}, {"$set": update_data})
    updated = await db.equipamentos.find_one({"id": equipamento_id}, {"_id": 0})
    return updated

@api_router.delete("/equipamentos/{equipamento_id}")
async def delete_equipamento(equipamento_id: str, user=Depends(get_current_user)):
    result = await db.equipamentos.delete_one({"id": equipamento_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return {"message": "Equipamento eliminado"}

# ==================== VIATURA ROUTES ====================
@api_router.get("/viaturas", response_model=List[Viatura])
async def get_viaturas(user=Depends(get_current_user)):
    items = await db.viaturas.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/viaturas", response_model=Viatura)
async def create_viatura(data: ViaturaCreate, user=Depends(get_current_user)):
    existing = await db.viaturas.find_one({"matricula": data.matricula}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Matrícula já existe")
    
    viatura = Viatura(**data.model_dump())
    doc = viatura.model_dump()
    await db.viaturas.insert_one(doc)
    return viatura

@api_router.put("/viaturas/{viatura_id}", response_model=Viatura)
async def update_viatura(viatura_id: str, data: ViaturaCreate, user=Depends(get_current_user)):
    existing = await db.viaturas.find_one({"id": viatura_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Viatura não encontrada")
    
    update_data = data.model_dump()
    await db.viaturas.update_one({"id": viatura_id}, {"$set": update_data})
    updated = await db.viaturas.find_one({"id": viatura_id}, {"_id": 0})
    return updated

@api_router.delete("/viaturas/{viatura_id}")
async def delete_viatura(viatura_id: str, user=Depends(get_current_user)):
    result = await db.viaturas.delete_one({"id": viatura_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Viatura não encontrada")
    return {"message": "Viatura eliminada"}

# ==================== MATERIAL ROUTES ====================
@api_router.get("/materiais", response_model=List[Material])
async def get_materiais(user=Depends(get_current_user)):
    items = await db.materiais.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/materiais", response_model=Material)
async def create_material(data: MaterialCreate, user=Depends(get_current_user)):
    existing = await db.materiais.find_one({"codigo": data.codigo}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Código já existe")
    
    material = Material(**data.model_dump())
    doc = material.model_dump()
    await db.materiais.insert_one(doc)
    return material

@api_router.put("/materiais/{material_id}", response_model=Material)
async def update_material(material_id: str, data: MaterialCreate, user=Depends(get_current_user)):
    existing = await db.materiais.find_one({"id": material_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    
    update_data = data.model_dump()
    await db.materiais.update_one({"id": material_id}, {"$set": update_data})
    updated = await db.materiais.find_one({"id": material_id}, {"_id": 0})
    return updated

@api_router.delete("/materiais/{material_id}")
async def delete_material(material_id: str, user=Depends(get_current_user)):
    result = await db.materiais.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    return {"message": "Material eliminado"}

# ==================== LOCAL ROUTES ====================
@api_router.get("/locais", response_model=List[Local])
async def get_locais(user=Depends(get_current_user)):
    items = await db.locais.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/locais", response_model=Local)
async def create_local(data: LocalCreate, user=Depends(get_current_user)):
    existing = await db.locais.find_one({"codigo": data.codigo}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Código já existe")
    
    local = Local(**data.model_dump())
    doc = local.model_dump()
    await db.locais.insert_one(doc)
    return local

@api_router.put("/locais/{local_id}", response_model=Local)
async def update_local(local_id: str, data: LocalCreate, user=Depends(get_current_user)):
    existing = await db.locais.find_one({"id": local_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Local não encontrado")
    
    update_data = data.model_dump()
    await db.locais.update_one({"id": local_id}, {"$set": update_data})
    updated = await db.locais.find_one({"id": local_id}, {"_id": 0})
    return updated

@api_router.delete("/locais/{local_id}")
async def delete_local(local_id: str, user=Depends(get_current_user)):
    result = await db.locais.delete_one({"id": local_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Local não encontrado")
    return {"message": "Local eliminado"}

# ==================== OBRA ROUTES ====================
@api_router.get("/obras", response_model=List[Obra])
async def get_obras(user=Depends(get_current_user)):
    items = await db.obras.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/obras", response_model=Obra)
async def create_obra(data: ObraCreate, user=Depends(get_current_user)):
    existing = await db.obras.find_one({"codigo": data.codigo}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Código já existe")
    
    obra = Obra(**data.model_dump())
    doc = obra.model_dump()
    await db.obras.insert_one(doc)
    return obra

@api_router.put("/obras/{obra_id}", response_model=Obra)
async def update_obra(obra_id: str, data: ObraCreate, user=Depends(get_current_user)):
    existing = await db.obras.find_one({"id": obra_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    
    update_data = data.model_dump()
    await db.obras.update_one({"id": obra_id}, {"$set": update_data})
    updated = await db.obras.find_one({"id": obra_id}, {"_id": 0})
    return updated

@api_router.delete("/obras/{obra_id}")
async def delete_obra(obra_id: str, user=Depends(get_current_user)):
    result = await db.obras.delete_one({"id": obra_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    # Remove local associations
    await db.locais.update_many({"obra_id": obra_id}, {"$set": {"obra_id": None}})
    return {"message": "Obra eliminada"}

@api_router.get("/obras/{obra_id}/recursos")
async def get_obra_recursos(obra_id: str, user=Depends(get_current_user)):
    obra = await db.obras.find_one({"id": obra_id}, {"_id": 0})
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    
    # Get locais associated with this obra
    locais = await db.locais.find({"obra_id": obra_id}, {"_id": 0}).to_list(1000)
    local_ids = [l["id"] for l in locais]
    
    equipamentos = await db.equipamentos.find({"local_id": {"$in": local_ids}}, {"_id": 0}).to_list(1000)
    viaturas = await db.viaturas.find({"local_id": {"$in": local_ids}}, {"_id": 0}).to_list(1000)
    materiais = await db.materiais.find({"local_id": {"$in": local_ids}}, {"_id": 0}).to_list(1000)
    
    return {
        "obra": obra,
        "locais": locais,
        "equipamentos": equipamentos,
        "viaturas": viaturas,
        "materiais": materiais
    }

# ==================== MOVIMENTO ATIVO ROUTES ====================
@api_router.get("/movimentos/ativos", response_model=List[MovimentoAtivo])
async def get_movimentos_ativos(user=Depends(get_current_user)):
    items = await db.movimentos_ativos.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/movimentos/ativos", response_model=MovimentoAtivo)
async def create_movimento_ativo(data: MovimentoAtivoCreate, user=Depends(get_current_user)):
    movimento = MovimentoAtivo(**data.model_dump())
    doc = movimento.model_dump()
    await db.movimentos_ativos.insert_one(doc)
    
    # Update equipamento local
    if data.destino_id:
        await db.equipamentos.update_one(
            {"id": data.ativo_id},
            {"$set": {"local_id": data.destino_id}}
        )
    
    return movimento

# ==================== MOVIMENTO STOCK ROUTES ====================
@api_router.get("/movimentos/stock", response_model=List[MovimentoStock])
async def get_movimentos_stock(user=Depends(get_current_user)):
    items = await db.movimentos_stock.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/movimentos/stock", response_model=MovimentoStock)
async def create_movimento_stock(data: MovimentoStockCreate, user=Depends(get_current_user)):
    movimento = MovimentoStock(**data.model_dump())
    doc = movimento.model_dump()
    await db.movimentos_stock.insert_one(doc)
    
    # Update material stock
    material = await db.materiais.find_one({"id": data.material_id}, {"_id": 0})
    if material:
        new_stock = material.get("stock_atual", 0)
        if data.tipo_movimento == "Entrada":
            new_stock += data.quantidade
        else:  # Saida
            new_stock -= data.quantidade
        
        await db.materiais.update_one(
            {"id": data.material_id},
            {"$set": {"stock_atual": new_stock}}
        )
    
    return movimento

# ==================== MOVIMENTO VIATURA ROUTES ====================
@api_router.get("/movimentos/viaturas", response_model=List[MovimentoViatura])
async def get_movimentos_viaturas(user=Depends(get_current_user)):
    items = await db.movimentos_viaturas.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/movimentos/viaturas", response_model=MovimentoViatura)
async def create_movimento_viatura(data: MovimentoViaturaCreate, user=Depends(get_current_user)):
    movimento = MovimentoViatura(**data.model_dump())
    doc = movimento.model_dump()
    await db.movimentos_viaturas.insert_one(doc)
    return movimento

# ==================== SUMMARY ROUTE ====================
@api_router.get("/summary")
async def get_summary(user=Depends(get_current_user)):
    equipamentos = await db.equipamentos.find({}, {"_id": 0}).to_list(1000)
    viaturas = await db.viaturas.find({}, {"_id": 0}).to_list(1000)
    materiais = await db.materiais.find({}, {"_id": 0}).to_list(1000)
    locais = await db.locais.find({}, {"_id": 0}).to_list(1000)
    obras = await db.obras.find({}, {"_id": 0}).to_list(1000)
    
    # Alerts
    alerts = []
    today = datetime.now(timezone.utc).date()
    
    # Vistoria alerts for viaturas
    for v in viaturas:
        if v.get("data_vistoria"):
            try:
                vistoria_date = datetime.fromisoformat(v["data_vistoria"].replace("Z", "+00:00")).date()
                days_until = (vistoria_date - today).days
                if days_until <= 30:
                    alerts.append({
                        "type": "vistoria",
                        "item": f"{v['marca']} {v['modelo']} ({v['matricula']})",
                        "message": f"Vistoria em {days_until} dias" if days_until >= 0 else "Vistoria expirada",
                        "urgent": days_until < 0
                    })
            except:
                pass
        
        if v.get("data_seguro"):
            try:
                seguro_date = datetime.fromisoformat(v["data_seguro"].replace("Z", "+00:00")).date()
                days_until = (seguro_date - today).days
                if days_until <= 30:
                    alerts.append({
                        "type": "seguro",
                        "item": f"{v['marca']} {v['modelo']} ({v['matricula']})",
                        "message": f"Seguro expira em {days_until} dias" if days_until >= 0 else "Seguro expirado",
                        "urgent": days_until < 0
                    })
            except:
                pass
    
    # Stock alerts
    for m in materiais:
        if m.get("stock_atual", 0) <= m.get("stock_minimo", 0) and m.get("stock_minimo", 0) > 0:
            alerts.append({
                "type": "stock",
                "item": f"{m['codigo']} - {m['descricao']}",
                "message": f"Stock baixo: {m.get('stock_atual', 0)} {m.get('unidade', 'un')} (mín: {m.get('stock_minimo', 0)})",
                "urgent": m.get("stock_atual", 0) == 0
            })
    
    return {
        "equipamentos": {
            "total": len(equipamentos),
            "ativos": len([e for e in equipamentos if e.get("ativo", True)]),
            "inativos": len([e for e in equipamentos if not e.get("ativo", True)])
        },
        "viaturas": {
            "total": len(viaturas),
            "ativas": len([v for v in viaturas if v.get("ativa", True)]),
            "inativas": len([v for v in viaturas if not v.get("ativa", True)])
        },
        "materiais": {
            "total": len(materiais),
            "stock_total": sum(m.get("stock_atual", 0) for m in materiais)
        },
        "locais": {
            "total": len(locais),
            "armazens": len([l for l in locais if l.get("tipo") == "ARM"]),
            "oficinas": len([l for l in locais if l.get("tipo") == "OFI"]),
            "obras": len([l for l in locais if l.get("tipo") == "OBR"])
        },
        "obras": {
            "total": len(obras),
            "ativas": len([o for o in obras if o.get("estado") == "Ativa"]),
            "concluidas": len([o for o in obras if o.get("estado") == "Concluida"]),
            "pausadas": len([o for o in obras if o.get("estado") == "Pausada"])
        },
        "alerts": alerts
    }

# ==================== EXPORT ROUTES ====================
@api_router.get("/export/pdf")
async def export_pdf(user=Depends(get_current_user)):
    equipamentos = await db.equipamentos.find({}, {"_id": 0}).to_list(1000)
    viaturas = await db.viaturas.find({}, {"_id": 0}).to_list(1000)
    materiais = await db.materiais.find({}, {"_id": 0}).to_list(1000)
    obras = await db.obras.find({}, {"_id": 0}).to_list(1000)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []
    
    elements.append(Paragraph("Relatório de Armazém - Construção Civil", styles['Title']))
    elements.append(Paragraph(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    summary_data = [
        ["Categoria", "Total", "Ativos", "Inativos"],
        ["Equipamentos", len(equipamentos), len([e for e in equipamentos if e.get("ativo")]), len([e for e in equipamentos if not e.get("ativo")])],
        ["Viaturas", len(viaturas), len([v for v in viaturas if v.get("ativa")]), len([v for v in viaturas if not v.get("ativa")])],
        ["Materiais", len(materiais), "-", "-"],
        ["Obras", len(obras), len([o for o in obras if o.get("estado") == "Ativa"]), len([o for o in obras if o.get("estado") != "Ativa"])]
    ]
    
    table = Table(summary_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=relatorio_armazem.pdf"}
    )

@api_router.get("/export/excel")
async def export_excel(user=Depends(get_current_user)):
    equipamentos = await db.equipamentos.find({}, {"_id": 0}).to_list(1000)
    viaturas = await db.viaturas.find({}, {"_id": 0}).to_list(1000)
    materiais = await db.materiais.find({}, {"_id": 0}).to_list(1000)
    locais = await db.locais.find({}, {"_id": 0}).to_list(1000)
    obras = await db.obras.find({}, {"_id": 0}).to_list(1000)
    
    wb = Workbook()
    
    # Equipamentos sheet
    ws = wb.active
    ws.title = "Equipamentos"
    ws.append(["Código", "Descrição", "Marca", "Modelo", "Categoria", "Nº Série", "Estado Conservação", "Responsável", "Ativo"])
    for e in equipamentos:
        ws.append([e.get("codigo", ""), e.get("descricao", ""), e.get("marca", ""), e.get("modelo", ""), 
                   e.get("categoria", ""), e.get("numero_serie", ""), e.get("estado_conservacao", ""),
                   e.get("responsavel", ""), "Sim" if e.get("ativo") else "Não"])
    
    # Viaturas sheet
    ws = wb.create_sheet("Viaturas")
    ws.append(["Matrícula", "Marca", "Modelo", "Combustível", "Data Vistoria", "Data Seguro", "Apólice", "Ativa", "Observações"])
    for v in viaturas:
        ws.append([v.get("matricula", ""), v.get("marca", ""), v.get("modelo", ""), v.get("combustivel", ""),
                   v.get("data_vistoria", ""), v.get("data_seguro", ""), v.get("apolice_seguro", ""),
                   "Sim" if v.get("ativa") else "Não", v.get("observacoes", "")])
    
    # Materiais sheet
    ws = wb.create_sheet("Materiais")
    ws.append(["Código", "Descrição", "Unidade", "Stock Atual", "Stock Mínimo", "Ativo"])
    for m in materiais:
        ws.append([m.get("codigo", ""), m.get("descricao", ""), m.get("unidade", ""),
                   m.get("stock_atual", 0), m.get("stock_minimo", 0), "Sim" if m.get("ativo") else "Não"])
    
    # Locais sheet
    ws = wb.create_sheet("Locais")
    ws.append(["Código", "Nome", "Tipo", "Ativo"])
    for l in locais:
        ws.append([l.get("codigo", ""), l.get("nome", ""), l.get("tipo", ""), "Sim" if l.get("ativo") else "Não"])
    
    # Obras sheet
    ws = wb.create_sheet("Obras")
    ws.append(["Código", "Nome", "Endereço", "Cliente", "Estado"])
    for o in obras:
        ws.append([o.get("codigo", ""), o.get("nome", ""), o.get("endereco", ""), o.get("cliente", ""), o.get("estado", "")])
    
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=relatorio_armazem.xlsx"}
    )

# ==================== ROOT ====================
@api_router.get("/")
async def root():
    return {"message": "Warehouse Management API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
