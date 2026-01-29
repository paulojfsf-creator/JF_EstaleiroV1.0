import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Truck, Search, Calendar, Mail, Eye, Building2 } from "lucide-react";
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

const combustivelOptions = ["Gasoleo", "Gasolina", "Eletrico", "Hibrido"];

export default function Viaturas() {
  const { token } = useAuth();
  const [viaturas, setViaturas] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingAlerts, setSendingAlerts] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    obra_id: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
  };

  const handleSendAlerts = async () => {
    setSendingAlerts(true);
    try {
      const response = await axios.post(`${API}/alerts/send`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const openEditDialog = (item) => {
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
      obra_id: item.obra_id || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({
      matricula: "", marca: "", modelo: "", combustivel: "Gasoleo", ativa: true,
      foto: "", data_vistoria: "", data_seguro: "", documento_unico: "",
      apolice_seguro: "", observacoes: "", obra_id: ""
    });
  };

  const filtered = viaturas.filter(v => 
    v.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getObraName = (obraId) => {
    const obra = obras.find(o => o.id === obraId);
    return obra ? obra.nome : null;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-neutral-400">A carregar...</div></div>;

  return (
    <div data-testid="viaturas-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Truck className="h-7 w-7 text-orange-500" />
            Viaturas
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Gestão de viaturas e veículos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSendAlerts} disabled={sendingAlerts} variant="outline" className="border-neutral-600 text-neutral-300 hover:bg-neutral-800" data-testid="send-alerts-btn">
            <Mail className="h-4 w-4 mr-2" />
            {sendingAlerts ? "A enviar..." : "Enviar Alertas"}
          </Button>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" data-testid="add-viatura-btn">
            <Plus className="h-4 w-4 mr-2" /> Nova Viatura
          </Button>
        </div>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <Input placeholder="Pesquisar por matrícula, marca ou modelo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500" data-testid="search-input" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-neutral-800 border border-neutral-700 rounded-lg">
          <Truck className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">{searchTerm ? "Nenhum resultado" : "Nenhuma viatura registada"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-neutral-800 border border-neutral-700 rounded-lg">
          <table className="w-full" data-testid="viaturas-table">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Matrícula</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Marca/Modelo</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Combustível</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Vistoria</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Seguro</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Obra</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Ativa</th>
                <th className="text-right py-3 px-4 text-neutral-400 font-medium text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/30" data-testid={`viatura-row-${item.id}`}>
                  <td className="py-3 px-4 font-mono text-orange-400 font-bold">{item.matricula}</td>
                  <td className="py-3 px-4 text-white">{item.marca} {item.modelo}</td>
                  <td className="py-3 px-4 text-neutral-400">{item.combustivel}</td>
                  <td className="py-3 px-4">
                    {item.data_vistoria ? (
                      <span className="flex items-center gap-1 text-sm text-neutral-300">
                        <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                        {new Date(item.data_vistoria).toLocaleDateString("pt-PT")}
                      </span>
                    ) : <span className="text-neutral-500">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    {item.data_seguro ? (
                      <span className="flex items-center gap-1 text-sm text-neutral-300">
                        <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                        {new Date(item.data_seguro).toLocaleDateString("pt-PT")}
                      </span>
                    ) : <span className="text-neutral-500">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    {item.obra_id ? (
                      <span className="flex items-center gap-1 text-orange-400 text-sm">
                        <Building2 className="h-3 w-3" />
                        {getObraName(item.obra_id)}
                      </span>
                    ) : (
                      <span className="text-neutral-500 text-sm">Em armazém</span>
                    )}
                  </td>
                  <td className="py-3 px-4"><span className={`h-2 w-2 rounded-full inline-block ${item.ativa ? "bg-emerald-500" : "bg-neutral-500"}`} /></td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/viaturas/${item.id}`}>
                      <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white" data-testid={`view-${item.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} className="text-neutral-400 hover:text-white" data-testid={`edit-${item.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(item); setDeleteDialogOpen(true); }} className="text-red-400 hover:text-red-300" data-testid={`delete-${item.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedItem ? "Editar Viatura" : "Nova Viatura"}</DialogTitle>
            <DialogDescription className="text-neutral-400">Preencha os dados da viatura</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-neutral-300">Matrícula *</Label>
                <Input value={formData.matricula} onChange={(e) => setFormData({...formData, matricula: e.target.value})} required placeholder="XX-XX-XX" data-testid="matricula-input" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Marca</Label>
                <Input value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} data-testid="marca-input" className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Modelo</Label>
                <Input value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} data-testid="modelo-input" className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Combustível</Label>
                <Select value={formData.combustivel} onValueChange={(v) => setFormData({...formData, combustivel: v})}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    {combustivelOptions.map(c => <SelectItem key={c} value={c} className="text-white hover:bg-neutral-700">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Data Vistoria</Label>
                <Input type="date" value={formData.data_vistoria} onChange={(e) => setFormData({...formData, data_vistoria: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Data Seguro</Label>
                <Input type="date" value={formData.data_seguro} onChange={(e) => setFormData({...formData, data_seguro: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Documento Único</Label>
                <Input value={formData.documento_unico} onChange={(e) => setFormData({...formData, documento_unico: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Apólice Seguro</Label>
                <Input value={formData.apolice_seguro} onChange={(e) => setFormData({...formData, apolice_seguro: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Obra</Label>
                <Select value={formData.obra_id || "none"} onValueChange={(v) => setFormData({...formData, obra_id: v === "none" ? "" : v})}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue placeholder="Selecione uma obra" /></SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="none" className="text-white hover:bg-neutral-700">Em armazém</SelectItem>
                    {obras.filter(o => o.estado === "Ativa").map(o => <SelectItem key={o.id} value={o.id} className="text-white hover:bg-neutral-700">{o.codigo} - {o.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">URL Foto</Label>
                <Input value={formData.foto} onChange={(e) => setFormData({...formData, foto: e.target.value})} placeholder="https://..." className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500" />
              </div>
              <div className="md:col-span-2">
                <ImageUpload 
                  value={formData.foto} 
                  onChange={(url) => setFormData({...formData, foto: url})}
                  label="Ou carregar foto"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-neutral-300">Observações</Label>
                <Textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" rows={2} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.ativa} onCheckedChange={(v) => setFormData({...formData, ativa: v})} />
                <Label className="text-neutral-300">Ativa</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-neutral-600 text-neutral-300 hover:bg-neutral-800">Cancelar</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">{selectedItem ? "Guardar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Eliminar Viatura</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">Tem a certeza que deseja eliminar "{selectedItem?.matricula}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-neutral-600 text-neutral-300 hover:bg-neutral-800">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
