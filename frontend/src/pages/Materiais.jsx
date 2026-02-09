import { useState, useEffect, useCallback } from "react";
import { useAuth, useTheme, API } from "@/App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Search, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

const unidadeOptions = ["unidade", "kg", "m", "m2", "m3", "litro", "saco", "palete"];

export default function Materiais() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  
  const [materiais, setMateriais] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movDialogOpen, setMovDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    unidade: "unidade",
    stock_atual: 0,
    stock_minimo: 0,
    ativo: true
  });
  const [movData, setMovData] = useState({
    tipo_movimento: "Saida",
    quantidade: 0,
    obra_id: "",
    responsavel: "",
    observacoes: ""
  });

  useEffect(() => {
  fetchData();
}, [fetchData]);

  const fetchData = useCallback(async () => {
    try {
      const [matRes, obrasRes] = await Promise.all([
        axios.get(`${API}/materiais`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/obras`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMateriais(matRes.data);
      setObras(obrasRes.data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await axios.put(`${API}/materiais/${selectedItem.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Material atualizado");
      } else {
        await axios.post(`${API}/materiais`, formData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Material criado");
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao guardar");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/materiais/${selectedItem.id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Material eliminado");
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      toast.error("Erro ao eliminar");
    }
  };

  const handleMovimento = async () => {
    try {
      await axios.post(`${API}/movimentos/stock`, {
        material_id: selectedItem.id,
        ...movData,
        obra_id: movData.obra_id || null,
        quantidade: parseFloat(movData.quantidade)
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`${movData.tipo_movimento === "Entrada" ? "Entrada" : "Saída"} registada`);
      setMovDialogOpen(false);
      setMovData({ tipo_movimento: "Saida", quantidade: 0, obra_id: "", responsavel: "", observacoes: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao registar movimento");
    }
  };

  const openEditDialog = (item, e) => {
    e?.stopPropagation();
    setSelectedItem(item);
    setFormData({
      codigo: item.codigo,
      descricao: item.descricao,
      unidade: item.unidade || "unidade",
      stock_atual: item.stock_atual || 0,
      stock_minimo: item.stock_minimo || 0,
      ativo: item.ativo ?? true
    });
    setDialogOpen(true);
  };

  const openMovDialog = (item, tipo, e) => {
    e?.stopPropagation();
    setSelectedItem(item);
    setMovData({ tipo_movimento: tipo, quantidade: 0, obra_id: "", responsavel: "", observacoes: "" });
    setMovDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({ codigo: "", descricao: "", unidade: "unidade", stock_atual: 0, stock_minimo: 0, ativo: true });
  };

  const filtered = materiais.filter(m => 
    m.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className={`flex items-center justify-center h-64 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>A carregar...</div>;

  return (
    <div data-testid="materiais-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package className="h-7 w-7 text-orange-500" />
            Materiais
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Gestão de materiais e stock</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" data-testid="add-material-btn">
          <Plus className="h-4 w-4 mr-2" /> Novo Material
        </Button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
        <Input placeholder="Pesquisar por código ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`pl-10 ${isDark ? 'bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500' : 'bg-white border-gray-300 placeholder:text-gray-400'}`} />
      </div>

      {filtered.length === 0 ? (
        <div className={`text-center py-12 rounded-lg border ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
          <Package className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-neutral-600' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-neutral-400' : 'text-gray-500'}>{searchTerm ? "Nenhum resultado" : "Nenhum material registado"}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className={`hidden md:block overflow-x-auto rounded-lg border ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
            <table className="w-full" data-testid="materiais-table">
              <thead>
                <tr className={`border-b ${isDark ? 'border-neutral-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Código</th>
                  <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Descrição</th>
                  <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Unidade</th>
                  <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Stock Atual</th>
                  <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Stock Mínimo</th>
                  <th className={`text-right py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const lowStock = item.stock_atual <= item.stock_minimo && item.stock_minimo > 0;
                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b cursor-pointer transition-colors ${isDark ? 'border-neutral-700/50 hover:bg-neutral-700/30' : 'border-gray-100 hover:bg-gray-50'}`}
                      onClick={() => navigate(`/materiais/${item.id}`)}
                      data-testid={`material-row-${item.id}`}
                    >
                      <td className="py-3 px-4 font-mono text-orange-500">{item.codigo}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.descricao}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{item.unidade}</td>
                      <td className={`py-3 px-4 ${lowStock ? "text-red-500 font-medium" : isDark ? 'text-white' : 'text-gray-900'}`}>
                        {lowStock && <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />}
                        {item.stock_atual}
                      </td>
                      <td className={`py-3 px-4 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{item.stock_minimo}</td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={(e) => openMovDialog(item, "Entrada", e)} className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" title="Entrada">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => openMovDialog(item, "Saida", e)} className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10" title="Saída">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => openEditDialog(item, e)} className={isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setDeleteDialogOpen(true); }} className="text-red-500 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((item) => {
              const lowStock = item.stock_atual <= item.stock_minimo && item.stock_minimo > 0;
              return (
                <div 
                  key={item.id}
                  className={`p-4 rounded-lg border cursor-pointer ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}
                  onClick={() => navigate(`/materiais/${item.id}`)}
                  data-testid={`material-card-${item.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-mono text-sm text-orange-500">{item.codigo}</span>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.descricao}</h3>
                    </div>
                    {lowStock && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-500 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Baixo
                      </span>
                    )}
                  </div>
                  <div className={`text-sm mb-3 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                    Stock: <span className={lowStock ? 'text-red-500 font-medium' : isDark ? 'text-white' : 'text-gray-900'}>{item.stock_atual}</span> / {item.stock_minimo} {item.unidade}
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" onClick={(e) => openMovDialog(item, "Entrada", e)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs flex-1">
                      <ArrowDown className="h-3 w-3 mr-1" /> Entrada
                    </Button>
                    <Button size="sm" onClick={(e) => openMovDialog(item, "Saida", e)} className="bg-amber-500 hover:bg-amber-600 text-black text-xs flex-1">
                      <ArrowUp className="h-3 w-3 mr-1" /> Saída
                    </Button>
                    <Button size="sm" variant="outline" onClick={(e) => openEditDialog(item, e)} className={`text-xs ${isDark ? 'border-neutral-600' : 'border-gray-300'}`}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={`sm:max-w-lg max-h-[90vh] overflow-y-auto ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-gray-200'}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>{selectedItem ? "Editar Material" : "Novo Material"}</DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Preencha os dados do material</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Código *</Label>
                <Input value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} required className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300'} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Descrição *</Label>
                <Input value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} required className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300'} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Unidade</Label>
                <Select value={formData.unidade} onValueChange={(v) => setFormData({...formData, unidade: v})}>
                  <SelectTrigger className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300'}><SelectValue /></SelectTrigger>
                  <SelectContent className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
                    {unidadeOptions.map(u => <SelectItem key={u} value={u} className={isDark ? 'text-white hover:bg-neutral-700' : ''}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Stock Atual</Label>
                <Input type="number" step="0.01" value={formData.stock_atual} onChange={(e) => setFormData({...formData, stock_atual: parseFloat(e.target.value) || 0})} className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300'} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Stock Mínimo</Label>
                <Input type="number" step="0.01" value={formData.stock_minimo} onChange={(e) => setFormData({...formData, stock_minimo: parseFloat(e.target.value) || 0})} className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300'} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.ativo} onCheckedChange={(v) => setFormData({...formData, ativo: v})} />
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Ativo</Label>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className={`w-full sm:w-auto ${isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : 'border-gray-300'}`}>Cancelar</Button>
              <Button type="submit" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-black font-semibold">{selectedItem ? "Guardar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Movimento Dialog */}
      <Dialog open={movDialogOpen} onOpenChange={setMovDialogOpen}>
        <DialogContent className={`sm:max-w-md ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-gray-200'}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>
              {movData.tipo_movimento === "Entrada" ? "Registar Entrada" : "Registar Saída"}
            </DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
              {selectedItem?.descricao}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Quantidade *</Label>
              <Input type="number" step="0.01" min="0" value={movData.quantidade} onChange={(e) => setMovData({...movData, quantidade: e.target.value})} className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300'} />
            </div>
            {movData.tipo_movimento === "Saida" && (
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Obra</Label>
                <Select value={movData.obra_id || "none"} onValueChange={(v) => setMovData({...movData, obra_id: v === "none" ? "" : v})}>
                  <SelectTrigger className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300'}><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
                    <SelectItem value="none" className={isDark ? 'text-white hover:bg-neutral-700' : ''}>Nenhuma</SelectItem>
                    {obras.filter(o => o.estado === "Ativa").map(o => <SelectItem key={o.id} value={o.id} className={isDark ? 'text-white hover:bg-neutral-700' : ''}>{o.codigo} - {o.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Responsável</Label>
              <Input value={movData.responsavel} onChange={(e) => setMovData({...movData, responsavel: e.target.value})} className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300'} />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Observações</Label>
              <Textarea value={movData.observacoes} onChange={(e) => setMovData({...movData, observacoes: e.target.value})} rows={2} className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300'} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => setMovDialogOpen(false)} className={`w-full sm:w-auto ${isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : 'border-gray-300'}`}>Cancelar</Button>
            <Button onClick={handleMovimento} disabled={!movData.quantidade || movData.quantidade <= 0} className={`w-full sm:w-auto font-semibold ${movData.tipo_movimento === "Entrada" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-amber-500 hover:bg-amber-600 text-black"}`}>
              {movData.tipo_movimento === "Entrada" ? <><ArrowDown className="h-4 w-4 mr-2" /> Entrada</> : <><ArrowUp className="h-4 w-4 mr-2" /> Saída</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-gray-200'}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Eliminar Material</AlertDialogTitle>
            <AlertDialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Tem a certeza que deseja eliminar "{selectedItem?.descricao}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className={`w-full sm:w-auto ${isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : 'border-gray-300'}`}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
