import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
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
  available: "Disponível",
  in_use: "Em Uso",
  maintenance: "Manutenção",
  broken: "Avariado"
};

export default function Equipment() {
  const { token } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    location: "",
    status: "available"
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(response.data);
    } catch (error) {
      toast.error("Erro ao carregar equipamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await axios.put(`${API}/equipment/${selectedItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Equipamento atualizado com sucesso");
      } else {
        await axios.post(`${API}/equipment`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Equipamento criado com sucesso");
      }
      setDialogOpen(false);
      resetForm();
      fetchEquipment();
    } catch (error) {
      toast.error("Erro ao guardar equipamento");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/equipment/${selectedItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Equipamento eliminado com sucesso");
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchEquipment();
    } catch (error) {
      toast.error("Erro ao eliminar equipamento");
    }
  };

  const openEditDialog = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      location: item.location || "",
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
      quantity: 1,
      location: "",
      status: "available"
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
    <div data-testid="equipment-page">
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Wrench className="h-8 w-8 text-amber-500" />
            Equipamentos
          </h1>
          <p className="page-subtitle">Gestão de equipamentos do armazém</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="btn-primary"
          data-testid="add-equipment-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Equipamento
        </Button>
      </div>

      {equipment.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-sm">
          <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum equipamento registado</p>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="mt-4 btn-secondary">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Equipamento
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table" data-testid="equipment-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Qtd.</th>
                <th>Localização</th>
                <th>Estado</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item.id} data-testid={`equipment-row-${item.id}`}>
                  <td className="font-medium">{item.name}</td>
                  <td>{item.quantity}</td>
                  <td className="text-slate-500">{item.location || "-"}</td>
                  <td>
                    <span className={`badge status-${item.status}`}>
                      {statusLabels[item.status]}
                    </span>
                  </td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} data-testid={`edit-equipment-${item.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(item)} className="text-red-500 hover:text-red-600" data-testid={`delete-equipment-${item.id}`}>
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
            <DialogTitle>{selectedItem ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="equipment-name-input" className="rounded-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input id="quantity" type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} data-testid="equipment-quantity-input" className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="equipment-status-select" className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponível</SelectItem>
                      <SelectItem value="in_use">Em Uso</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="broken">Avariado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Ex: Armazém A, Prateleira 3" data-testid="equipment-location-input" className="rounded-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-sm">Cancelar</Button>
              <Button type="submit" className="btn-primary" data-testid="equipment-submit-btn">{selectedItem ? "Guardar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Equipamento</AlertDialogTitle>
            <AlertDialogDescription>Tem a certeza que deseja eliminar "{selectedItem?.name}"? Esta ação não pode ser revertida.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="btn-danger" data-testid="confirm-delete-equipment-btn">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
