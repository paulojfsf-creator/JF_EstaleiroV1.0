import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Truck, Calendar } from "lucide-react";
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

export default function Vehicles() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    plate: "",
    quantity: 1,
    location: "",
    status: "available",
    next_maintenance: "",
    maintenance_interval_days: 30
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data);
    } catch (error) {
      toast.error("Erro ao carregar viaturas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await axios.put(`${API}/vehicles/${selectedItem.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Viatura atualizada com sucesso");
      } else {
        await axios.post(`${API}/vehicles`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Viatura criada com sucesso");
      }
      setDialogOpen(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      toast.error("Erro ao guardar viatura");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/vehicles/${selectedItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Viatura eliminada com sucesso");
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchVehicles();
    } catch (error) {
      toast.error("Erro ao eliminar viatura");
    }
  };

  const openEditDialog = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      plate: item.plate || "",
      quantity: item.quantity,
      location: item.location || "",
      status: item.status,
      next_maintenance: item.next_maintenance?.split("T")[0] || "",
      maintenance_interval_days: item.maintenance_interval_days || 30
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
      plate: "",
      quantity: 1,
      location: "",
      status: "available",
      next_maintenance: "",
      maintenance_interval_days: 30
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
    <div data-testid="vehicles-page">
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Truck className="h-8 w-8 text-amber-500" />
            Viaturas
          </h1>
          <p className="page-subtitle">Gestão de viaturas do armazém</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="btn-primary" data-testid="add-vehicle-btn">
          <Plus className="h-4 w-4 mr-2" />
          Nova Viatura
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-sm">
          <Truck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma viatura registada</p>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="mt-4 btn-secondary">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Viatura
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table" data-testid="vehicles-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Matrícula</th>
                <th>Localização</th>
                <th>Estado</th>
                <th>Próx. Manutenção</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((item) => (
                <tr key={item.id} data-testid={`vehicle-row-${item.id}`}>
                  <td className="font-medium">{item.name}</td>
                  <td className="font-mono text-sm">{item.plate || "-"}</td>
                  <td className="text-slate-500">{item.location || "-"}</td>
                  <td>
                    <span className={`badge status-${item.status}`}>{statusLabels[item.status]}</span>
                  </td>
                  <td>
                    {item.next_maintenance ? (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.next_maintenance).toLocaleDateString("pt-PT")}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} data-testid={`edit-vehicle-${item.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(item)} className="text-red-500 hover:text-red-600" data-testid={`delete-vehicle-${item.id}`}>
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
            <DialogTitle>{selectedItem ? "Editar Viatura" : "Nova Viatura"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="vehicle-name-input" className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">Matrícula</Label>
                  <Input id="plate" value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} placeholder="XX-XX-XX" data-testid="vehicle-plate-input" className="rounded-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input id="quantity" type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} data-testid="vehicle-quantity-input" className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="vehicle-status-select" className="rounded-sm"><SelectValue /></SelectTrigger>
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
                <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Ex: Parque, Garagem" data-testid="vehicle-location-input" className="rounded-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="next_maintenance">Próx. Manutenção</Label>
                  <Input id="next_maintenance" type="date" value={formData.next_maintenance} onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })} data-testid="vehicle-maintenance-input" className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Intervalo (dias)</Label>
                  <Input id="interval" type="number" min="1" value={formData.maintenance_interval_days} onChange={(e) => setFormData({ ...formData, maintenance_interval_days: parseInt(e.target.value) })} data-testid="vehicle-interval-input" className="rounded-sm" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-sm">Cancelar</Button>
              <Button type="submit" className="btn-primary" data-testid="vehicle-submit-btn">{selectedItem ? "Guardar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Viatura</AlertDialogTitle>
            <AlertDialogDescription>Tem a certeza que deseja eliminar "{selectedItem?.name}"? Esta ação não pode ser revertida.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="btn-danger" data-testid="confirm-delete-vehicle-btn">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
