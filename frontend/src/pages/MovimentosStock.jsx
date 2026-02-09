import { useState, useEffect, useCallback } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Package, ArrowDown, ArrowUp } from "lucide-react";
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

const tipoMovOptions = ["Entrada", "Saida"];

export default function MovimentosStock() {
  const { token } = useAuth();
  const [movimentos, setMovimentos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    material_id: "",
    tipo_movimento: "Entrada",
    quantidade: 0,
    obra_id: "",
    fornecedor: "",
    documento: "",
    responsavel: "",
    observacoes: ""
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    try {
      const [movRes, matRes, obrasRes] = await Promise.all([
        axios.get(`${API}/movimentos/stock`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/materiais`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/obras`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMovimentos(movRes.data);
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
      const payload = {
        ...formData,
        obra_id: formData.obra_id || null,
        quantidade: parseFloat(formData.quantidade) || 0
      };
      await axios.post(`${API}/movimentos/stock`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Movimento registado e stock atualizado");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Erro ao registar movimento");
    }
  };

  const resetForm = () => {
    setFormData({
      material_id: "", tipo_movimento: "Entrada", quantidade: 0,
      obra_id: "", fornecedor: "", documento: "", responsavel: "", observacoes: ""
    });
  };

  const getMaterialName = (id) => {
    const mat = materiais.find(m => m.id === id);
    return mat ? `${mat.codigo} - ${mat.descricao}` : id;
  };
  const getObraName = (id) => obras.find(o => o.id === id)?.nome || "-";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-neutral-400">A carregar...</div></div>;

  return (
    <div data-testid="movimentos-stock-page" className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="h-7 w-7 text-orange-500" />
            Movimentos de Stock
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Registo de entradas e saídas de materiais</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" data-testid="add-mov-btn">
          <Plus className="h-4 w-4 mr-2" /> Novo Movimento
        </Button>
      </div>

      {movimentos.length === 0 ? (
        <div className="text-center py-12 bg-neutral-800 border border-neutral-700 rounded-lg">
          <Package className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">Nenhum movimento registado</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-neutral-800 border border-neutral-700 rounded-lg">
          <table className="w-full" data-testid="movimentos-table">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Data/Hora</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Tipo</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Material</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Quantidade</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Obra</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Fornecedor</th>
                <th className="text-left py-3 px-4 text-neutral-400 font-medium text-sm">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {movimentos.map((mov) => (
                <tr key={mov.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/30">
                  <td className="py-3 px-4 text-sm text-neutral-300">{new Date(mov.data_hora).toLocaleString("pt-PT")}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${mov.tipo_movimento === "Entrada" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {mov.tipo_movimento === "Entrada" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                      {mov.tipo_movimento}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{getMaterialName(mov.material_id)}</td>
                  <td className={`py-3 px-4 font-medium ${mov.tipo_movimento === "Entrada" ? "text-emerald-400" : "text-amber-400"}`}>
                    {mov.tipo_movimento === "Entrada" ? "+" : "-"}{mov.quantidade}
                  </td>
                  <td className="py-3 px-4 text-neutral-400">{getObraName(mov.obra_id)}</td>
                  <td className="py-3 px-4 text-neutral-400">{mov.fornecedor || "-"}</td>
                  <td className="py-3 px-4 text-neutral-400">{mov.responsavel || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">Novo Movimento de Stock</DialogTitle>
            <DialogDescription className="text-neutral-400">Registe uma entrada ou saída de material</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-neutral-300">Tipo Movimento *</Label>
                <Select value={formData.tipo_movimento} onValueChange={(v) => setFormData({...formData, tipo_movimento: v})}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    {tipoMovOptions.map(t => <SelectItem key={t} value={t} className="text-white hover:bg-neutral-700">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Material *</Label>
                <Select value={formData.material_id} onValueChange={(v) => setFormData({...formData, material_id: v})}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    {materiais.map(m => <SelectItem key={m.id} value={m.id} className="text-white hover:bg-neutral-700">{m.codigo} - {m.descricao}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Quantidade *</Label>
                <Input type="number" step="0.01" min="0" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} required className="bg-neutral-800 border-neutral-700 text-white" />
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
                <Label className="text-neutral-300">Fornecedor</Label>
                <Input value={formData.fornecedor} onChange={(e) => setFormData({...formData, fornecedor: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-300">Documento</Label>
                <Input value={formData.documento} onChange={(e) => setFormData({...formData, documento: e.target.value})} placeholder="Nº Fatura, Guia, etc." className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-neutral-300">Responsável</Label>
                <Input value={formData.responsavel} onChange={(e) => setFormData({...formData, responsavel: e.target.value})} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-neutral-300">Observações</Label>
                <Textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} rows={2} className="bg-neutral-800 border-neutral-700 text-white" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-neutral-600 text-neutral-300 hover:bg-neutral-800">Cancelar</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" disabled={!formData.material_id || !formData.quantidade}>Registar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
