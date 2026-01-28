import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Building2, Cog, Wrench, Hammer, Truck, Package, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";

const resourceIcons = {
  machine: Cog,
  equipment: Wrench,
  tool: Hammer,
  vehicle: Truck,
  material: Package
};

const resourceLabels = {
  machine: "Máquinas",
  equipment: "Equipamentos",
  tool: "Ferramentas",
  vehicle: "Viaturas",
  material: "Materiais"
};

const statusLabels = {
  active: "Ativa",
  completed: "Concluída",
  paused: "Pausada"
};

export default function ObraDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [obraData, setObraData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availableResources, setAvailableResources] = useState({});
  const [selectedResourceType, setSelectedResourceType] = useState("machine");
  const [selectedResourceId, setSelectedResourceId] = useState("");

  useEffect(() => {
    fetchObraResources();
    fetchAvailableResources();
  }, [id]);

  const fetchObraResources = async () => {
    try {
      const response = await axios.get(`${API}/obras/${id}/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setObraData(response.data);
    } catch (error) {
      toast.error("Erro ao carregar dados da obra");
      navigate("/obras");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableResources = async () => {
    try {
      const [machines, equipment, tools, vehicles, materials] = await Promise.all([
        axios.get(`${API}/machines`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/equipment`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/tools`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/vehicles`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/materials`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setAvailableResources({
        machine: machines.data.filter(r => r.status === "available" && !r.obra_id),
        equipment: equipment.data.filter(r => r.status === "available" && !r.obra_id),
        tool: tools.data.filter(r => r.status === "available" && !r.obra_id),
        vehicle: vehicles.data.filter(r => r.status === "available" && !r.obra_id),
        material: materials.data.filter(r => r.status === "available" && !r.obra_id)
      });
    } catch (error) {
      console.error("Error fetching available resources:", error);
    }
  };

  const handleAssign = async () => {
    if (!selectedResourceId) {
      toast.error("Selecione um recurso");
      return;
    }
    
    try {
      await axios.post(`${API}/assignments`, {
        resource_id: selectedResourceId,
        resource_type: selectedResourceType,
        obra_id: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Recurso atribuído com sucesso");
      setAssignDialogOpen(false);
      setSelectedResourceId("");
      fetchObraResources();
      fetchAvailableResources();
    } catch (error) {
      toast.error("Erro ao atribuir recurso");
    }
  };

  const handleUnassign = async (resourceId, resourceType) => {
    try {
      await axios.post(`${API}/assignments/unassign`, {
        resource_id: resourceId,
        resource_type: resourceType,
        obra_id: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Recurso removido da obra");
      fetchObraResources();
      fetchAvailableResources();
    } catch (error) {
      toast.error("Erro ao remover recurso");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">A carregar...</div>
      </div>
    );
  }

  if (!obraData) {
    return null;
  }

  const resourceSections = [
    { key: "machines", type: "machine", data: obraData.machines },
    { key: "equipment", type: "equipment", data: obraData.equipment },
    { key: "tools", type: "tool", data: obraData.tools },
    { key: "vehicles", type: "vehicle", data: obraData.vehicles },
    { key: "materials", type: "material", data: obraData.materials }
  ];

  return (
    <div data-testid="obra-detail-page">
      {/* Header */}
      <div className="page-header">
        <Button variant="ghost" onClick={() => navigate("/obras")} className="mb-4" data-testid="back-to-obras-btn">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar às Obras
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <Building2 className="h-8 w-8 text-amber-500" />
              {obraData.obra.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`badge status-${obraData.obra.status}`}>
                {statusLabels[obraData.obra.status]}
              </span>
              {obraData.obra.address && (
                <span className="text-slate-500 text-sm">{obraData.obra.address}</span>
              )}
              {obraData.obra.client_name && (
                <span className="text-slate-500 text-sm">Cliente: {obraData.obra.client_name}</span>
              )}
            </div>
          </div>
          <Button onClick={() => setAssignDialogOpen(true)} className="btn-accent" data-testid="assign-resource-btn">
            <Plus className="h-4 w-4 mr-2" />
            Atribuir Recurso
          </Button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resourceSections.map((section) => {
          const Icon = resourceIcons[section.type];
          return (
            <Card key={section.key} className="border-slate-200" data-testid={`${section.key}-section`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-amber-500" />
                  {resourceLabels[section.type]}
                  <span className="ml-auto text-sm font-normal text-slate-500">
                    {section.data.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {section.data.length === 0 ? (
                  <p className="text-slate-400 text-sm">Nenhum recurso atribuído</p>
                ) : (
                  <ul className="space-y-2">
                    {section.data.map((item) => (
                      <li key={item.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-sm">
                        <span className="text-sm font-medium">{item.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnassign(item.id, section.type)}
                          className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
                          data-testid={`unassign-${section.type}-${item.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assign Resource Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Recurso à Obra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Recurso</Label>
              <Select value={selectedResourceType} onValueChange={(value) => { setSelectedResourceType(value); setSelectedResourceId(""); }}>
                <SelectTrigger data-testid="resource-type-select" className="rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="machine">Máquina</SelectItem>
                  <SelectItem value="equipment">Equipamento</SelectItem>
                  <SelectItem value="tool">Ferramenta</SelectItem>
                  <SelectItem value="vehicle">Viatura</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recurso Disponível</Label>
              {availableResources[selectedResourceType]?.length === 0 ? (
                <p className="text-slate-500 text-sm py-2">Nenhum recurso disponível deste tipo</p>
              ) : (
                <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
                  <SelectTrigger data-testid="resource-select" className="rounded-sm">
                    <SelectValue placeholder="Selecione um recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableResources[selectedResourceType]?.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} {resource.plate ? `(${resource.plate})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)} className="rounded-sm">
              Cancelar
            </Button>
            <Button onClick={handleAssign} className="btn-primary" data-testid="confirm-assign-btn" disabled={!selectedResourceId}>
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
