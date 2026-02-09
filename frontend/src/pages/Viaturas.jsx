import { useState, useEffect, useCallback } from "react";
import { useAuth, useTheme, API } from "@/App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Truck, Search, Calendar, Building2, ArrowRight, FileText, AlertTriangle, Bell } from "lucide-react";
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
import ImageUpload from "@/components/ImageUpload";
import PdfUpload from "@/components/PdfUpload";

const combustivelOptions = ["Gasoleo", "Gasolina", "Eletrico", "Hibrido"];

export default function Viaturas() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  
  const [viaturas, setViaturas] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingAlerts, setSendingAlerts] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [atribuirDialogOpen, setAtribuirDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    matricula: "",
    marca: "",
    modelo: "",
    combustivel: "Gasoleo",
    ativa: true,
    foto: "",
    data_vistoria: "",
    data_seguro: "",
    documento_unico: "",
    apolice_seguro: "",
    observacoes: "",
    obra_id: "",
    // Novos campos documentação
    dua_url: "",
    seguro_url: "",
    ipo_url: "",
    carta_verde_url: "",
    manual_url: "",
    // Novos campos manutenção
    em_manutencao: false,
    descricao_avaria: "",
    // Novos campos datas
    data_ipo: "",
    data_proxima_revisao: "",
    kms_atual: 0,
    kms_proxima_revisao: 0
  });
  const [atribuirData, setAtribuirData] = useState({
    obra_id: "",
    responsavel_levantou: ""
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    try {
      const [vRes, obrasRes] = await Promise.all([
        axios.get(`${API}/viaturas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/obras`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setViaturas(vRes.data);
      setObras(obrasRes.data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSendAlerts = async () => {
    setSendingAlerts(true);
    try {
      const response = await axios.post(`${API}/alerts/send`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao enviar alertas");
    } finally {
      setSendingAlerts(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, obra_id: formData.obra_id || null };
      if (selectedItem) {
        await axios.put(`${API}/viaturas/${selectedItem.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Viatura atualizada");
      } else {
        await axios.post(`${API}/viaturas`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Viatura criada");
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
      await axios.delete(`${API}/viaturas/${selectedItem.id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Viatura eliminada");
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      toast.error("Erro ao eliminar");
    }
  };

  const handleAtribuir = async () => {
    try {
      await axios.post(`${API}/movimentos/atribuir`, {
        recurso_id: selectedItem.id,
        tipo_recurso: "viatura",
        obra_id: atribuirData.obra_id,
        responsavel_levantou: atribuirData.responsavel_levantou
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Viatura atribuída à obra");
      setAtribuirDialogOpen(false);
      setAtribuirData({ obra_id: "", responsavel_levantou: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao atribuir");
    }
  };

  const handleDevolver = async (item) => {
    try {
      await axios.post(`${API}/movimentos/devolver`, {
        recurso_id: item.id,
        tipo_recurso: "viatura",
        responsavel_devolveu: ""
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Viatura devolvida ao armazém");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao devolver");
    }
  };

  const openEditDialog = (item, e) => {
    e?.stopPropagation();
    setSelectedItem(item);
    setFormData({
      matricula: item.matricula,
      marca: item.marca || "",
      modelo: item.modelo || "",
      combustivel: item.combustivel || "Gasoleo",
      ativa: item.ativa ?? true,
      foto: item.foto || "",
      data_vistoria: item.data_vistoria?.split("T")[0] || "",
      data_seguro: item.data_seguro?.split("T")[0] || "",
      documento_unico: item.documento_unico || "",
      apolice_seguro: item.apolice_seguro || "",
      observacoes: item.observacoes || "",
      obra_id: item.obra_id || "",
      dua_url: item.dua_url || "",
      seguro_url: item.seguro_url || "",
      ipo_url: item.ipo_url || "",
      carta_verde_url: item.carta_verde_url || "",
      manual_url: item.manual_url || "",
      em_manutencao: item.em_manutencao ?? false,
      descricao_avaria: item.descricao_avaria || "",
      data_ipo: item.data_ipo?.split("T")[0] || "",
      data_proxima_revisao: item.data_proxima_revisao?.split("T")[0] || "",
      kms_atual: item.kms_atual || 0,
      kms_proxima_revisao: item.kms_proxima_revisao || 0
    });
    setDialogOpen(true);
  };

  const openAtribuirDialog = (item, e) => {
    e?.stopPropagation();
    setSelectedItem(item);
    setAtribuirDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({
      matricula: "", marca: "", modelo: "", combustivel: "Gasoleo",
      ativa: true, foto: "", data_vistoria: "", data_seguro: "",
      documento_unico: "", apolice_seguro: "", observacoes: "", obra_id: "",
      dua_url: "", seguro_url: "", ipo_url: "", carta_verde_url: "", manual_url: "",
      em_manutencao: false, descricao_avaria: "",
      data_ipo: "", data_proxima_revisao: "", kms_atual: 0, kms_proxima_revisao: 0
    });
  };

  const getObraName = (obraId) => {
    const obra = obras.find(o => o.id === obraId);
    return obra ? obra.nome : "Obra";
  };

  const getAlertCount = (item) => {
    let count = 0;
    const hoje = new Date();
    
    if (item.data_seguro) {
      const dataSeg = new Date(item.data_seguro);
      if ((dataSeg - hoje) / (1000 * 60 * 60 * 24) <= 30) count++;
    }
    if (item.data_ipo) {
      const dataIpo = new Date(item.data_ipo);
      if ((dataIpo - hoje) / (1000 * 60 * 60 * 24) <= 30) count++;
    }
    if (item.data_proxima_revisao) {
      const dataRev = new Date(item.data_proxima_revisao);
      if ((dataRev - hoje) / (1000 * 60 * 60 * 24) <= 30) count++;
    }
    return count;
  };

  const filtered = viaturas.filter(v => {
    const search = searchTerm.toLowerCase();
    return (
      v.matricula?.toLowerCase().includes(search) ||
      v.marca?.toLowerCase().includes(search) ||
      v.modelo?.toLowerCase().includes(search)
    );
  });

  const inputClass = `${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className={isDark ? 'text-neutral-400' : 'text-gray-500'}>A carregar...</div></div>;

  return (
    <div data-testid="viaturas-page" className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Truck className="h-7 w-7 text-orange-500" />
          Viaturas
          <span className={`text-sm font-normal px-2 py-1 rounded ${isDark ? 'bg-neutral-700 text-neutral-300' : 'bg-gray-100 text-gray-600'}`}>{viaturas.length}</span>
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleSendAlerts} disabled={sendingAlerts} variant="outline" className={`${isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-700' : ''}`}>
            <Bell className="h-4 w-4 mr-2" />
            {sendingAlerts ? "A enviar..." : "Enviar Alertas"}
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" data-testid="add-viatura-btn">
            <Plus className="h-4 w-4 mr-2" /> Nova Viatura
          </Button>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
        <Input 
          placeholder="Pesquisar por matrícula, marca ou modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-10 ${inputClass}`}
        />
      </div>

      <div className={`hidden md:block rounded-lg border overflow-hidden ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-neutral-700' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Foto</th>
              <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Matrícula</th>
              <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Marca/Modelo</th>
              <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Combustível</th>
              <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Alertas</th>
              <th className={`text-left py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Localização</th>
              <th className={`text-right py-3 px-4 font-medium text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const alertCount = getAlertCount(item);
              return (
                <tr 
                  key={item.id} 
                  className={`border-b cursor-pointer transition-colors ${item.em_manutencao ? (isDark ? 'bg-red-500/5' : 'bg-red-50') : ''} ${isDark ? 'border-neutral-700/50 hover:bg-neutral-700/30' : 'border-gray-100 hover:bg-gray-50'}`}
                  onClick={() => navigate(`/viaturas/${item.id}`)}
                  data-testid={`viatura-row-${item.id}`}
                >
                  <td className="py-2 px-4">
                    {item.foto ? (
                      <img 
                        src={item.foto.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${item.foto}` : item.foto}
                        alt={item.matricula}
                        className="h-12 w-12 object-cover rounded-lg"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}>
                        <Truck className={`h-5 w-5 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-orange-500 font-bold">{item.matricula}</span>
                    {item.em_manutencao && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-500">
                        Avariado
                      </span>
                    )}
                  </td>
                  <td className={`py-3 px-4 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>{item.marca} {item.modelo}</td>
                  <td className={`py-3 px-4 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{item.combustivel}</td>
                  <td className="py-3 px-4">
                    {alertCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-500 font-medium text-sm">
                        <Bell className="h-4 w-4" /> {alertCount}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {item.em_manutencao ? (
                      <span className="flex items-center gap-1 text-red-500 font-medium text-sm">
                        <AlertTriangle className="h-3 w-3" />
                        Em Oficina
                      </span>
                    ) : item.obra_id ? (
                      <span className="flex items-center gap-1 text-orange-500 text-sm">
                        <Building2 className="h-3 w-3" />
                        {getObraName(item.obra_id)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-500 text-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Em armazém
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {!item.obra_id && item.ativa && !item.em_manutencao ? (
                      <Button variant="ghost" size="sm" onClick={(e) => openAtribuirDialog(item, e)} className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10">
                        <ArrowRight className="h-4 w-4 mr-1" /> Obra
                      </Button>
                    ) : item.obra_id ? (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDevolver(item); }} className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10">
                        Devolver
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={(e) => openEditDialog(item, e)} className={`${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
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
          const alertCount = getAlertCount(item);
          return (
            <div 
              key={item.id}
              className={`p-4 rounded-lg border cursor-pointer ${item.em_manutencao ? (isDark ? 'bg-red-500/5 border-red-500/30' : 'bg-red-50 border-red-200') : isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}
              onClick={() => navigate(`/viaturas/${item.id}`)}
            >
              <div className="flex gap-3 mb-3">
                {item.foto ? (
                  <img 
                    src={item.foto.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${item.foto}` : item.foto}
                    alt={item.matricula}
                    className="h-16 w-16 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className={`h-16 w-16 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}>
                    <Truck className={`h-6 w-6 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-sm text-orange-500 font-bold">{item.matricula}</span>
                  {item.em_manutencao && (
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-500">
                      Avariado
                    </span>
                  )}
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.marca} {item.modelo}</h3>
                  <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{item.combustivel}</p>
                </div>
                {alertCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-500 font-medium text-sm h-fit">
                    <Bell className="h-4 w-4" /> {alertCount}
                  </span>
                )}
              </div>
              <div className="text-sm mb-3">
                {item.em_manutencao ? (
                  <span className="flex items-center gap-1 text-red-500 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Em Oficina
                  </span>
                ) : item.obra_id ? (
                  <span className="flex items-center gap-1 text-orange-500 font-medium">
                    <Building2 className="h-3 w-3" />
                    {getObraName(item.obra_id)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Em armazém
                  </span>
                )}
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {!item.obra_id && item.ativa && !item.em_manutencao ? (
                  <Button size="sm" onClick={(e) => openAtribuirDialog(item, e)} className="bg-orange-500 hover:bg-orange-600 text-black text-xs flex-1">
                    <ArrowRight className="h-3 w-3 mr-1" /> Atribuir a Obra
                  </Button>
                ) : item.obra_id ? (
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleDevolver(item); }} className="text-emerald-500 border-emerald-500 hover:bg-emerald-500/10 text-xs flex-1">
                    Devolver
                  </Button>
                ) : item.em_manutencao ? (
                  <Button size="sm" variant="outline" className="text-red-500 border-red-500/50 text-xs flex-1 pointer-events-none">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Em Oficina
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={(e) => openEditDialog(item, e)} className={`text-xs ${isDark ? 'border-neutral-600' : 'border-gray-300'}`}>
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog Nova/Editar Viatura */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={`sm:max-w-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>{selectedItem ? "Editar Viatura" : "Nova Viatura"}</DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
              {selectedItem ? "Atualize os dados da viatura" : "Preencha os dados da nova viatura"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Matrícula *</Label>
                <Input value={formData.matricula} onChange={(e) => setFormData({...formData, matricula: e.target.value.toUpperCase()})} required className={inputClass} placeholder="00-AA-00" />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Combustível</Label>
                <Select value={formData.combustivel} onValueChange={(v) => setFormData({...formData, combustivel: v})}>
                  <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                  <SelectContent className={isDark ? 'bg-neutral-800 border-neutral-700' : ''}>{combustivelOptions.map(opt => <SelectItem key={opt} value={opt} className={isDark ? 'text-white' : ''}>{opt}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Marca</Label>
                <Input value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} className={inputClass} placeholder="Ex: Renault" />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Modelo</Label>
                <Input value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} className={inputClass} placeholder="Ex: Clio" />
              </div>
              
              {/* Datas e KMs */}
              <div className="md:col-span-2 pt-4 border-t border-neutral-700">
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                  <Calendar className="h-4 w-4 text-orange-500" /> Datas e Quilometragem
                </h4>
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Data Seguro (Validade)</Label>
                <Input type="date" value={formData.data_seguro} onChange={(e) => setFormData({...formData, data_seguro: e.target.value})} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Data IPO (Validade)</Label>
                <Input type="date" value={formData.data_ipo} onChange={(e) => setFormData({...formData, data_ipo: e.target.value})} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Data Próxima Revisão</Label>
                <Input type="date" value={formData.data_proxima_revisao} onChange={(e) => setFormData({...formData, data_proxima_revisao: e.target.value})} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Data Vistoria</Label>
                <Input type="date" value={formData.data_vistoria} onChange={(e) => setFormData({...formData, data_vistoria: e.target.value})} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>KMs Atual</Label>
                <Input type="number" value={formData.kms_atual} onChange={(e) => setFormData({...formData, kms_atual: parseInt(e.target.value) || 0})} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>KMs Próxima Revisão</Label>
                <Input type="number" value={formData.kms_proxima_revisao} onChange={(e) => setFormData({...formData, kms_proxima_revisao: parseInt(e.target.value) || 0})} className={inputClass} />
              </div>

              {/* Documentação PDFs */}
              <div className="md:col-span-2 pt-4 border-t border-neutral-700">
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                  <FileText className="h-4 w-4 text-orange-500" /> Documentação
                </h4>
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>DUA (Documento Único)</Label>
                <PdfUpload value={formData.dua_url} onChange={(url) => setFormData({...formData, dua_url: url})} label="Carregar DUA" isDark={isDark} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Apólice de Seguro</Label>
                <PdfUpload value={formData.seguro_url} onChange={(url) => setFormData({...formData, seguro_url: url})} label="Carregar Seguro" isDark={isDark} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Ficha IPO</Label>
                <PdfUpload value={formData.ipo_url} onChange={(url) => setFormData({...formData, ipo_url: url})} label="Carregar IPO" isDark={isDark} />
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Carta Verde</Label>
                <PdfUpload value={formData.carta_verde_url} onChange={(url) => setFormData({...formData, carta_verde_url: url})} label="Carregar Carta Verde" isDark={isDark} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Manual do Veículo</Label>
                <PdfUpload value={formData.manual_url} onChange={(url) => setFormData({...formData, manual_url: url})} label="Carregar Manual" isDark={isDark} />
              </div>

              {/* Estado Manutenção */}
              <div className="md:col-span-2 pt-4 border-t border-neutral-700">
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Estado
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.em_manutencao} onCheckedChange={(v) => setFormData({...formData, em_manutencao: v})} />
                <Label className={`${formData.em_manutencao ? 'text-red-500' : isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                  Em Oficina / Avariado
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.ativa} onCheckedChange={(v) => setFormData({...formData, ativa: v})} />
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Ativa</Label>
              </div>
              {formData.em_manutencao && (
                <div className="space-y-2 md:col-span-2">
                  <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Descrição da Avaria</Label>
                  <Textarea value={formData.descricao_avaria} onChange={(e) => setFormData({...formData, descricao_avaria: e.target.value})} placeholder="Descreva o problema, localização na oficina..." rows={3} className={inputClass} />
                </div>
              )}

              {/* Foto e Observações */}
              <div className="md:col-span-2 pt-4 border-t border-neutral-700">
                <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>Foto e Observações</h4>
              </div>
              <div className="space-y-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>URL da Foto</Label>
                <Input value={formData.foto} onChange={(e) => setFormData({...formData, foto: e.target.value})} className={inputClass} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <ImageUpload value={formData.foto} onChange={(url) => setFormData({...formData, foto: url})} label="Ou carregar foto" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Observações</Label>
                <Textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} className={inputClass} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className={isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : ''}>Cancelar</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Atribuir a Obra */}
      <Dialog open={atribuirDialogOpen} onOpenChange={setAtribuirDialogOpen}>
        <DialogContent className={`sm:max-w-md ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Atribuir Viatura a Obra</DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
              Selecione a obra para atribuir a viatura {selectedItem?.matricula}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Obra *</Label>
              <Select value={atribuirData.obra_id} onValueChange={(v) => setAtribuirData({...atribuirData, obra_id: v})}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Selecione uma obra" /></SelectTrigger>
                <SelectContent className={isDark ? 'bg-neutral-800 border-neutral-700' : ''}>
                  {obras.map(o => <SelectItem key={o.id} value={o.id} className={isDark ? 'text-white' : ''}>{o.codigo} - {o.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Responsável</Label>
              <Input value={atribuirData.responsavel_levantou} onChange={(e) => setAtribuirData({...atribuirData, responsavel_levantou: e.target.value})} className={inputClass} placeholder="Nome do responsável" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAtribuirDialogOpen(false)} className={isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : ''}>Cancelar</Button>
            <Button onClick={handleAtribuir} disabled={!atribuirData.obra_id} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">Atribuir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminação */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={isDark ? 'bg-neutral-900 border-neutral-700' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isDark ? 'text-white' : ''}>Eliminar Viatura?</AlertDialogTitle>
            <AlertDialogDescription className={isDark ? 'text-neutral-400' : ''}>
              Esta ação não pode ser desfeita. A viatura {selectedItem?.matricula} será permanentemente eliminada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : ''}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
