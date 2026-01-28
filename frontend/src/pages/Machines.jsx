import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Cog, Calendar } from "lucide-react";
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

export default function Machines() {
  const { token } = useAuth();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    location: "",
    status: "available",
    next_maintenance: "",
    maintenance_interval_days: 90
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API}/machines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMachines(response.data);
    } catch (error) {
      toast.error("Erro ao carregar máquinas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMachine) {
        await axios.put(`${API}/machines/${selectedMachine.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Máquina atualizada com sucesso");
      } else {
        await axios.post(`${API}/machines`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Máquina criada com sucesso");
      }
      setDialogOpen(false);
      resetForm();
      fetchMachines();
    } catch (error) {
      toast.error("Erro ao guardar máquina");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/machines/${selectedMachine.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Máquina eliminada com sucesso");
      setDeleteDialogOpen(false);
      setSelectedMachine(null);
      fetchMachines();
    } catch (error) {
      toast.error("Erro ao eliminar máquina");
    }
  };

  const openEditDialog = (machine) => {
    setSelectedMachine(machine);
    setFormData({
      name: machine.name,
      quantity: machine.quantity,
      location: machine.location || "",
      status: machine.status,
      next_maintenance: machine.next_maintenance?.split("T")[0] || "",
      maintenance_interval_days: machine.maintenance_interval_days || 90
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (machine) => {
    setSelectedMachine(machine);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedMachine(null);
    setFormData({
      name: "",
      quantity: 1,
      location: "",
      status: "available",
      next_maintenance: "",
      maintenance_interval_days: 90
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
    <div data-testid="machines-page">
      <div className="page-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Cog className="h-8 w-8 text-amber-500" />
            Máquinas
          </h1>
          <p className="page-subtitle">Gestão de máquinas do armazém</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="btn-primary"
          data-testid="add-machine-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Máquina
        </Button>
      </div>

      {/* Table */}
      {machines.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-sm">
          <Cog className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma máquina registada</p>
          <Button 
            onClick={() => { resetForm(); setDialogOpen(true); }}
            className="mt-4 btn-secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Máquina
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table" data-testid="machines-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Qtd.</th>
                <th>Localização</th>
                <th>Estado</th>
                <th>Próx. Manutenção</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.id} data-testid={`machine-row-${machine.id}`}>
                  <td className="font-medium">{machine.name}</td>
                  <td>{machine.quantity}</td>
                  <td className="text-slate-500">{machine.location || "-"}</td>
                  <td>
                    <span className={`badge status-${machine.status}`}>
                      {statusLabels[machine.status]}
                    </span>
                  </td>
                  <td>
                    {machine.next_maintenance ? (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(machine.next_maintenance).toLocaleDateString("pt-PT")}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(machine)}
                      data-testid={`edit-machine-${machine.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(machine)}
                      className="text-red-500 hover:text-red-600"
                      data-testid={`delete-machine-${machine.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedMachine ? "Editar Máquina" : "Nova Máquina"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="machine-name-input"
                  className="rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    data-testid="machine-quantity-input"
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="machine-status-select" className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
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
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Armazém A, Prateleira 3"
                  data-testid="machine-location-input"
                  className="rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="next_maintenance">Próx. Manutenção</Label>
                  <Input
                    id="next_maintenance"
                    type="date"
                    value={formData.next_maintenance}
                    onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
                    data-testid="machine-maintenance-input"
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Intervalo (dias)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={formData.maintenance_interval_days}
                    onChange={(e) => setFormData({ ...formData, maintenance_interval_days: parseInt(e.target.value) })}
                    data-testid="machine-interval-input"
                    className="rounded-sm"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-sm">
                Cancelar
              </Button>
              <Button type="submit" className="btn-primary" data-testid="machine-submit-btn">
                {selectedMachine ? "Guardar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Máquina</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar "{selectedMachine?.name}"? Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="btn-danger" data-testid="confirm-delete-btn">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
