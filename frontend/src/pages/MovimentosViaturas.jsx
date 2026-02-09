import { useState, useEffect, useCallback } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Truck, Gauge } from "lucide-react";
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

export default function MovimentosViaturas() {
  const { token } = useAuth();
  const [movimentos, setMovimentos] = useState([]);
  const [viaturas, setViaturas] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    viatura_id: "",
    obra_id: "",
    condutor: "",
    km_inicial: 0,
    km_final: 0,
    data: "",
    observacoes: ""
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    try {
      const [movRes, viatRes, obrasRes] = await Promise.all([
        axios.get(`${API}/movimentos/viaturas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/viaturas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/obras`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMovimentos(movRes.data);
      setViaturas(viatRes.data);
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
      const payload = {
        ...formData,
        obra_id: formData.obra_id || null,
        km_inicial: parseFloat(formData.km_inicial) || 0,
        km_final: parseFloat(formData.km_final) || 0
      };
      await axios.post(`${API}/movimentos/viaturas`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Movimento registado");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Erro ao registar movimento");
    }
  };

  const resetForm = () => {
    setFormData({
      viatura_id: "", obra_id: "", condutor: "", km_inicial: 0, km_final: 0, data: "", observacoes: ""
    });
  };

  const getViaturaName = (id) => {
    const v = viaturas.find(v => v.id === id);
    return v ? `${v.matricula} - ${v.marca} ${v.modelo}` : id;
  };
  const getObraName = (id) => obras.find(o => o.id === id)?.nome || "-";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-neutral-400">A carregar...</div></div>;

  return (
    <div data-testid="movimentos-viaturas-page" className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Truck className="h-7 w-7 text-orange-500" />
            Movimentos de Viaturas
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Registo de utilização e quilometragem</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" data-testid="add-mov-btn">
          <Plus className="h-4 w-4 mr-2" /> Novo Movimento
        </Button>
      </div>

      {movimentos.length === 0 ? (
        <div className="text-center py-12 bg-neutral-800 border border-neutral-700 rounded-lg">
          <Truck className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Nenhum movimento registado</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-neutral-800 border border-neutral-700 rounded-lg">
          <table className="w-full" data-testid="movimentos-table">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Data</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Viatura</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Obra</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Condutor</th>
                <th className="text-right py-3 px-4 text-neutral-400 font-medium text-sm">Km Inicial</th>
                <th className="text-right py-3 px-4 text-neutral-400 font-medium text-sm">Km Final</th>
                <th className="text-right py-3 px-4 text-neutral-400 font-medium text-sm">Percorridos</th>
              </tr>
            </thead>
            <tbody>
              {movimentos.map((mov) => (
                <tr key={mov.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/30">
                  <td className="py-3 px-4 text-sm text-neutral-300">{mov.data ? new Date(mov.data).toLocaleDateString("pt-PT") : "-"}</td>
                  <td className="py-3 px-4 text-white">{getViaturaName(mov.viatura_id)}</td>
                  <td className="py-3 px-4 text-neutral-400">{getObraName(mov.obra_id)}</td>
                  <td className="py-3 px-4 text-neutral-400">{mov.condutor || "-"}</td>
                  <td className="py-3 px-4 text-right text-neutral-400 font-mono">{(mov.km_inicial || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-neutral-400 font-mono">{(mov.km_final || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-medium text-orange-400 font-mono flex items-center justify-end gap-1">
                    <Gauge className="h-3 w-3" />
                    {((mov.km_final || 0) - (mov.km_inicial || 0)).toLocaleString()} km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">Novo Movimento de Viatura</DialogTitle>
            <DialogDescription className="text-neutral-400">Registe a utilização de uma viatura</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-neutral-300">Viatura *</Label>
                <Select value={formData.viatura_id} onValueChange={(v) => setFormData({...formData, viatura_id: v})}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    {viaturas.map(v => <SelectItem key={v.id} value={v.id} className="text-white hover:bg-neutral-700">{v.matricula} - {v.marca} {v.modelo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Obra</Label>
                <Select value={formData.obra_id || "none"} onValueChange={(v) => setFormData({...formData, obra_id: v === "none" ? "" : v})}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="none" className="text-white hover:bg-neutral-700">Nenhuma</SelectItem>
                    {obras.map(o => <SelectItem key={o.id} value={o.id} className="text-white hover:bg-neutral-700">{o.codigo} - {o.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Data</Label>
                <Input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Condutor</Label>
                <Input value={formData.condutor} onChange={(e) => setFormData({...formData, condutor: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Km Inicial</Label>
                <Input type="number" min="0" value={formData.km_inicial} onChange={(e) => setFormData({...formData, km_inicial: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Km Final</Label>
                <Input type="number" min="0" value={formData.km_final} onChange={(e) => setFormData({...formData, km_final: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-neutral-300">Observações</Label>
                <Textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} rows={2} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-neutral-600 text-neutral-300 hover:bg-neutral-800">Cancelar</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" disabled={!formData.viatura_id}>Registar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
