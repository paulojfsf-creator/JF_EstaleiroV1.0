import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [materiais, setMateriais] = useState([]);
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    unidade: "unidade",
    stock_atual: 0,
    stock_minimo: 0,
    ativo: true,
    local_id: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, locRes] = await Promise.all([
        axios.get(`${API}/materiais`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/locais`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMateriais(mRes.data);
      setLocais(locRes.data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, local_id: formData.local_id || null };
      if (selectedItem) {
        await axios.put(`${API}/materiais/${selectedItem.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Material atualizado");
      } else {
        await axios.post(`${API}/materiais`, payload, { headers: { Authorization: `Bearer ${token}` } });
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

  const openEditDialog = (item) => {
    setSelectedItem(item);
    setFormData({
      codigo: item.codigo,
      descricao: item.descricao,
      unidade: item.unidade || "unidade",
      stock_atual: item.stock_atual || 0,
      stock_minimo: item.stock_minimo || 0,
      ativo: item.ativo ?? true,
      local_id: item.local_id || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({ codigo: "", descricao: "", unidade: "unidade", stock_atual: 0, stock_minimo: 0, ativo: true, local_id: "" });
  };

  const filtered = materiais.filter(m => 
    m.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-500">A carregar...</div></div>;

  return (
    <div data-testid="materiais-page">
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Package className="h-8 w-8 text-amber-500" />
            Materiais
          </h1>
          <p className="page-subtitle">Gestão de materiais e stock</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="btn-primary" data-testid="add-material-btn">
          <Plus className="h-4 w-4 mr-2" /> Novo Material
        </Button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Pesquisar por código ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 rounded-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-sm">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">{searchTerm ? "Nenhum resultado" : "Nenhum material registado"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table" data-testid="materiais-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Unidade</th>
                <th>Stock Atual</th>
                <th>Stock Mínimo</th>
                <th>Ativo</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const lowStock = item.stock_atual <= item.stock_minimo && item.stock_minimo > 0;
                return (
                  <tr key={item.id} data-testid={`material-row-${item.id}`}>
                    <td className="font-mono font-medium">{item.codigo}</td>
                    <td>{item.descricao}</td>
                    <td className="text-slate-500">{item.unidade}</td>
                    <td className={lowStock ? "text-red-600 font-medium" : ""}>
                      {lowStock && <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />}
                      {item.stock_atual}
                    </td>
                    <td className="text-slate-500">{item.stock_minimo}</td>
                    <td><span className={`h-2 w-2 rounded-full inline-block ${item.ativo ? "bg-emerald-500" : "bg-slate-300"}`} /></td>
                    <td className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(item); setDeleteDialogOpen(true); }} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Editar Material" : "Novo Material"}</DialogTitle>
            <DialogDescription>Preencha os dados do material</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} required className="rounded-sm" />
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} required className="rounded-sm" />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={formData.unidade} onValueChange={(v) => setFormData({...formData, unidade: v})}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {unidadeOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stock Atual</Label>
                <Input type="number" step="0.01" value={formData.stock_atual} onChange={(e) => setFormData({...formData, stock_atual: parseFloat(e.target.value) || 0})} className="rounded-sm" />
              </div>
              <div className="space-y-2">
                <Label>Stock Mínimo</Label>
                <Input type="number" step="0.01" value={formData.stock_minimo} onChange={(e) => setFormData({...formData, stock_minimo: parseFloat(e.target.value) || 0})} className="rounded-sm" />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Select value={formData.local_id || "none"} onValueChange={(v) => setFormData({...formData, local_id: v === "none" ? "" : v})}>
                  <SelectTrigger className="rounded-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {locais.map(l => <SelectItem key={l.id} value={l.id}>{l.codigo} - {l.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.ativo} onCheckedChange={(v) => setFormData({...formData, ativo: v})} />
                <Label>Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-sm">Cancelar</Button>
              <Button type="submit" className="btn-primary">{selectedItem ? "Guardar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Material</AlertDialogTitle>
            <AlertDialogDescription>Tem a certeza que deseja eliminar "{selectedItem?.descricao}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="btn-danger">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
