import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

const statusLabels = {
  active: "Ativa",
  completed: "Concluída",
  paused: "Pausada"
};

export default function Obras() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    client_name: "",
    status: "active"
  });

  useEffect(() => {
    fetchObras();
  }, []);

  const fetchObras = async () => {
    try {
      const response = await axios.get(`${API}/obras`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setObras(response.data);
    } catch (error) {
      toast.error("Erro ao carregar obras");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await axios.put(`${API}/obras/${selectedItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Obra atualizada com sucesso");
      } else {
        await axios.post(`${API}/obras`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Obra criada com sucesso");
      }
      setDialogOpen(false);
      resetForm();
      fetchObras();
    } catch (error) {
      toast.error("Erro ao guardar obra");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/obras/${selectedItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Obra eliminada com sucesso");
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchObras();
    } catch (error) {
      toast.error("Erro ao eliminar obra");
    }
  };

  const openEditDialog = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      address: item.address || "",
      client_name: item.client_name || "",
      status: item.status
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({
      name: "",
      address: "",
      client_name: "",
      status: "active"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div data-testid="obras-page">
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Building2 className="h-8 w-8 text-amber-500" />
            Obras
          </h1>
          <p className="page-subtitle">Gestão de obras e projetos</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="btn-primary" data-testid="add-obra-btn">
          <Plus className="h-4 w-4 mr-2" />
          Nova Obra
        </Button>
      </div>

      {obras.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-sm">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma obra registada</p>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="mt-4 btn-secondary">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Obra
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table" data-testid="obras-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Endereço</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((item) => (
                <tr key={item.id} data-testid={`obra-row-${item.id}`}>
                  <td className="font-medium">{item.name}</td>
                  <td className="text-slate-500">{item.address || "-"}</td>
                  <td className="text-slate-500">{item.client_name || "-"}</td>
                  <td>
                    <span className={`badge status-${item.status}`}>{statusLabels[item.status]}</span>
                  </td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/obras/${item.id}`)} data-testid={`view-obra-${item.id}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} data-testid={`edit-obra-${item.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(item)} className="text-red-500 hover:text-red-600" data-testid={`delete-obra-${item.id}`}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Editar Obra" : "Nova Obra"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Obra *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="obra-name-input" className="rounded-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Morada da obra" data-testid="obra-address-input" className="rounded-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Cliente</Label>
                  <Input id="client_name" value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} placeholder="Nome do cliente" data-testid="obra-client-input" className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="obra-status-select" className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="paused">Pausada</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-sm">Cancelar</Button>
              <Button type="submit" className="btn-primary" data-testid="obra-submit-btn">{selectedItem ? "Guardar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Obra</AlertDialogTitle>
            <AlertDialogDescription>Tem a certeza que deseja eliminar "{selectedItem?.name}"? Todos os recursos atribuídos serão desassociados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="btn-danger" data-testid="confirm-delete-obra-btn">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
