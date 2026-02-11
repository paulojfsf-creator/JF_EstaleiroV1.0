import { useState, useEffect, useCallback } from "react";
import { useAuth, useTheme, API } from "@/App";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { 
  ArrowLeft, Building2, Wrench, Truck, Eye, Plus, Package, 
  ArrowRightLeft, TrendingDown, TrendingUp, RotateCcw, User, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const estadoLabels = { Ativa: "Ativa", Concluida: "Concluída", Pausada: "Pausada" };

export default function ObraDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  
  const [obraData, setObraData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Available resources for assignment
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState([]);
  const [viaturasDisponiveis, setViaturasDisponiveis] = useState([]);
  const [materiais, setMateriais] = useState([]);
  
  // Dialogs
  const [atribuirEquipDialog, setAtribuirEquipDialog] = useState(false);
  const [atribuirViaturaDialog, setAtribuirViaturaDialog] = useState(false);
  const [movimentoStockDialog, setMovimentoStockDialog] = useState(false);
  const [devolverDialog, setDevolverDialog] = useState(false);
  
  // Form data
  const [selectedEquipamento, setSelectedEquipamento] = useState("");
  const [selectedViatura, setSelectedViatura] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [tipoMovStock, setTipoMovStock] = useState("Saida");
  const [recursoDevolver, setRecursoDevolver] = useState(null);
  
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  const fetchAllData = useCallback(async () => {
    try {
      const [obraRes, equipRes, viatRes, matRes] = await Promise.all([
      axios.get(`${API}/obras/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/equipamentos`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/viaturas`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/materiais`, { headers: { Authorization: `Bearer ${token}` } })
    ]);  
    
    setObraData(obraRes.data);
    setEquipamentosDisponiveis(equipRes.data.filter(e => !e.obra_id));
    setViaturasDisponiveis(viatRes.data.filter(v => !v.obra_id));
    setMateriais(matRes.data);
  } catch (error) {
    toast.error("Erro ao carregar dados da obra");
    navigate("/obras");
  } finally {
    setLoading(false);
  }
}, [id, token, navigate]);

  const handleAtribuirEquipamento = async () => {
    if (!selectedEquipamento) {
      toast.error("Selecione um equipamento");
      return;
    }
    try {
      await axios.post(`${API}/movimentos/atribuir`, {
        recurso_id: selectedEquipamento,
        tipo_recurso: "equipamento",
        obra_id: id,
        responsavel_levantou: responsavel,
        observacoes: observacoes
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success("Equipamento atribuído com sucesso");
      setAtribuirEquipDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao atribuir equipamento");
    }
  };

  const handleAtribuirViatura = async () => {
    if (!selectedViatura) {
      toast.error("Selecione uma viatura");
      return;
    }
    try {
      await axios.post(`${API}/movimentos/atribuir`, {
        recurso_id: selectedViatura,
        tipo_recurso: "viatura",
        obra_id: id,
        responsavel_levantou: responsavel,
        observacoes: observacoes
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success("Viatura atribuída com sucesso");
      setAtribuirViaturaDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao atribuir viatura");
    }
  };

  const handleMovimentoStock = async () => {
    if (!selectedMaterial || !quantidade) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      await axios.post(`${API}/movimentos/stock`, {
        material_id: selectedMaterial,
        tipo_movimento: tipoMovStock,
        quantidade: parseFloat(quantidade),
        obra_id: id,
        responsavel: responsavel,
        observacoes: observacoes
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(`Movimento de stock registado (${tipoMovStock})`);
      setMovimentoStockDialog(false);
      resetForms();
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao registar movimento");
    }
  };

  const handleDevolver = async () => {
    if (!recursoDevolver) return;
    try {
      await axios.post(`${API}/movimentos/devolver`, {
        recurso_id: recursoDevolver.id,
        tipo_recurso: recursoDevolver.tipo,
        responsavel_devolveu: responsavel,
        observacoes: observacoes
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(`${recursoDevolver.tipo === "equipamento" ? "Equipamento" : "Viatura"} devolvido(a) com sucesso`);
      setDevolverDialog(false);
      setRecursoDevolver(null);
      resetForms();
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao devolver recurso");
    }
  };

  const openDevolverDialog = (recurso, tipo) => {
    setRecursoDevolver({ ...recurso, tipo });
    setDevolverDialog(true);
  };

  const resetForms = () => {
    setSelectedEquipamento("");
    setSelectedViatura("");
    setSelectedMaterial("");
    setResponsavel("");
    setObservacoes("");
    setQuantidade("");
    setTipoMovStock("Saida");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className={isDark ? 'text-neutral-400' : 'text-gray-500'}>A carregar...</div></div>;
  if (!obraData) return null;

  const { obra, equipamentos, viaturas } = obraData;

  return (
    <div data-testid="obra-detail-page" className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/obras")}
          className={isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Obra Header */}
      <Card className={`mb-6 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8 text-orange-500" />
                <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{obra.nome}</CardTitle>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`font-mono text-sm px-2 py-1 rounded text-orange-500 ${isDark ? 'bg-neutral-700' : 'bg-orange-50'}`}>{obra.codigo}</span>
                <Badge className={`${obra.estado === "Ativa" ? "bg-emerald-500/20 text-emerald-500" : obra.estado === "Pausada" ? "bg-amber-500/20 text-amber-500" : "bg-neutral-500/20 text-neutral-400"}`}>
                  {estadoLabels[obra.estado]}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setAtribuirEquipDialog(true)} 
                className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                data-testid="atribuir-equipamento-btn"
              >
                <Wrench className="h-4 w-4 mr-2" /> Atribuir Equipamento
              </Button>
              <Button 
                onClick={() => setAtribuirViaturaDialog(true)} 
                className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                data-testid="atribuir-viatura-btn"
              >
                <Truck className="h-4 w-4 mr-2" /> Atribuir Viatura
              </Button>
              <Button 
                onClick={() => setMovimentoStockDialog(true)} 
                variant="outline"
                className={isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-700' : 'border-gray-300'}
                data-testid="movimento-stock-btn"
              >
                <Package className="h-4 w-4 mr-2" /> Movimento de Material
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {obra.endereco && (
              <div>
                <span className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Endereço:</span>
                <p className={isDark ? 'text-neutral-300' : 'text-gray-700'}>{obra.endereco}</p>
              </div>
            )}
            {obra.cliente && (
              <div>
                <span className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Cliente:</span>
                <p className={isDark ? 'text-neutral-300' : 'text-gray-700'}>{obra.cliente}</p>
              </div>
            )}
            <div className="flex gap-6">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-neutral-700/50' : 'bg-gray-50'}`}>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{equipamentos?.length || 0}</p>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Equipamentos</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-neutral-700/50' : 'bg-gray-50'}`}>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{viaturas?.length || 0}</p>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Viaturas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Resources */}
      <Tabs defaultValue="equipamentos" className="space-y-4">
        <TabsList className={`grid w-full grid-cols-2 ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}>
          <TabsTrigger value="equipamentos" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
            <Wrench className="h-4 w-4 mr-2" /> Equipamentos ({equipamentos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="viaturas" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
            <Truck className="h-4 w-4 mr-2" /> Viaturas ({viaturas?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Equipamentos Tab */}
        <TabsContent value="equipamentos">
          <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Wrench className="h-5 w-5 text-orange-500" />
                Equipamentos na Obra
              </CardTitle>
              <CardDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
                Equipamentos atualmente atribuídos a esta obra
              </CardDescription>
            </CardHeader>
            <CardContent>
              {equipamentos?.length === 0 ? (
                <div className={`text-center py-8 rounded-lg border-2 border-dashed ${isDark ? 'border-neutral-700' : 'border-gray-200'}`}>
                  <Wrench className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-neutral-600' : 'text-gray-300'}`} />
                  <p className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Nenhum equipamento atribuído</p>
                  <Button onClick={() => setAtribuirEquipDialog(true)} variant="link" className="text-orange-500 mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Atribuir equipamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipamentos.map((item) => (
                    <div key={item.id} className={`p-4 rounded-lg flex items-center justify-between ${isDark ? 'bg-neutral-700/50 hover:bg-neutral-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                      <div className="flex items-center gap-4">
                        {item.foto ? (
                          <img 
                            src={item.foto.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${item.foto}` : item.foto}
                            alt={item.codigo}
                            className="h-12 w-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-neutral-600' : 'bg-gray-200'}`}>
                            <Wrench className={`h-5 w-5 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} />
                          </div>
                        )}
                        <div>
                          <span className="font-mono text-sm text-orange-500">{item.codigo}</span>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.descricao}</p>
                          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{item.marca} {item.modelo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/equipamentos/${item.id}`}>
                          <Button variant="ghost" size="sm" className={isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openDevolverDialog(item, "equipamento")}
                          className={`text-amber-500 border-amber-500/50 hover:bg-amber-500/10 ${isDark ? '' : 'hover:border-amber-500'}`}
                          data-testid={`devolver-equip-${item.id}`}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" /> Devolver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Viaturas Tab */}
        <TabsContent value="viaturas">
          <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Truck className="h-5 w-5 text-orange-500" />
                Viaturas na Obra
              </CardTitle>
              <CardDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
                Viaturas atualmente atribuídas a esta obra
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viaturas?.length === 0 ? (
                <div className={`text-center py-8 rounded-lg border-2 border-dashed ${isDark ? 'border-neutral-700' : 'border-gray-200'}`}>
                  <Truck className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-neutral-600' : 'text-gray-300'}`} />
                  <p className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Nenhuma viatura atribuída</p>
                  <Button onClick={() => setAtribuirViaturaDialog(true)} variant="link" className="text-orange-500 mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Atribuir viatura
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {viaturas.map((item) => (
                    <div key={item.id} className={`p-4 rounded-lg flex items-center justify-between ${isDark ? 'bg-neutral-700/50 hover:bg-neutral-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                      <div className="flex items-center gap-4">
                        {item.foto ? (
                          <img 
                            src={item.foto.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${item.foto}` : item.foto}
                            alt={item.matricula}
                            className="h-12 w-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-neutral-600' : 'bg-gray-200'}`}>
                            <Truck className={`h-5 w-5 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} />
                          </div>
                        )}
                        <div>
                          <span className="font-mono text-sm font-bold text-orange-500">{item.matricula}</span>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.marca} {item.modelo}</p>
                          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{item.combustivel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/viaturas/${item.id}`}>
                          <Button variant="ghost" size="sm" className={isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openDevolverDialog(item, "viatura")}
                          className={`text-amber-500 border-amber-500/50 hover:bg-amber-500/10 ${isDark ? '' : 'hover:border-amber-500'}`}
                          data-testid={`devolver-viatura-${item.id}`}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" /> Devolver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Atribuir Equipamento */}
      <Dialog open={atribuirEquipDialog} onOpenChange={setAtribuirEquipDialog}>
        <DialogContent className={`sm:max-w-lg ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Atribuir Equipamento à Obra</DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
              Selecione um equipamento disponível para atribuir a "{obra.nome}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Equipamento *</Label>
              <Select value={selectedEquipamento} onValueChange={setSelectedEquipamento}>
                <SelectTrigger className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}>
                  <SelectValue placeholder="Selecione um equipamento" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
                  {equipamentosDisponiveis.length === 0 ? (
                    <div className={`p-3 text-sm ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Nenhum equipamento disponível</div>
                  ) : (
                    equipamentosDisponiveis.map(e => (
                      <SelectItem key={e.id} value={e.id} className={isDark ? 'text-white' : 'text-gray-900'}>
                        {e.codigo} - {e.descricao}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Responsável pelo Levantamento</Label>
              <Input 
                value={responsavel} 
                onChange={(e) => setResponsavel(e.target.value)} 
                placeholder="Nome do responsável"
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Observações</Label>
              <Input 
                value={observacoes} 
                onChange={(e) => setObservacoes(e.target.value)} 
                placeholder="Observações (opcional)"
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAtribuirEquipDialog(false)} className={isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : ''}>
              Cancelar
            </Button>
            <Button onClick={handleAtribuirEquipamento} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" disabled={!selectedEquipamento}>
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Atribuir Viatura */}
      <Dialog open={atribuirViaturaDialog} onOpenChange={setAtribuirViaturaDialog}>
        <DialogContent className={`sm:max-w-lg ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Atribuir Viatura à Obra</DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
              Selecione uma viatura disponível para atribuir a "{obra.nome}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Viatura *</Label>
              <Select value={selectedViatura} onValueChange={setSelectedViatura}>
                <SelectTrigger className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}>
                  <SelectValue placeholder="Selecione uma viatura" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
                  {viaturasDisponiveis.length === 0 ? (
                    <div className={`p-3 text-sm ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Nenhuma viatura disponível</div>
                  ) : (
                    viaturasDisponiveis.map(v => (
                      <SelectItem key={v.id} value={v.id} className={isDark ? 'text-white' : 'text-gray-900'}>
                        {v.matricula} - {v.marca} {v.modelo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Responsável pelo Levantamento</Label>
              <Input 
                value={responsavel} 
                onChange={(e) => setResponsavel(e.target.value)} 
                placeholder="Nome do responsável"
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Observações</Label>
              <Input 
                value={observacoes} 
                onChange={(e) => setObservacoes(e.target.value)} 
                placeholder="Observações (opcional)"
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAtribuirViaturaDialog(false)} className={isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : ''}>
              Cancelar
            </Button>
            <Button onClick={handleAtribuirViatura} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" disabled={!selectedViatura}>
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Movimento de Stock */}
      <Dialog open={movimentoStockDialog} onOpenChange={setMovimentoStockDialog}>
        <DialogContent className={`sm:max-w-lg ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Movimento de Material</DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
              Registar entrada ou saída de material para "{obra.nome}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Tipo de Movimento *</Label>
              <Select value={tipoMovStock} onValueChange={setTipoMovStock}>
                <SelectTrigger className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
                  <SelectItem value="Saida" className={isDark ? 'text-white' : 'text-gray-900'}>
                    <span className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" /> Saída (Consumo)</span>
                  </SelectItem>
                  <SelectItem value="Entrada" className={isDark ? 'text-white' : 'text-gray-900'}>
                    <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Entrada (Devolução)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Material *</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}>
                  <SelectValue placeholder="Selecione um material" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
                  {materiais.length === 0 ? (
                    <div className={`p-3 text-sm ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Nenhum material registado</div>
                  ) : (
                    materiais.map(m => (
                      <SelectItem key={m.id} value={m.id} className={isDark ? 'text-white' : 'text-gray-900'}>
                        {m.codigo} - {m.descricao} ({m.stock_atual || 0} {m.unidade})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Quantidade *</Label>
              <Input 
                type="number"
                value={quantidade} 
                onChange={(e) => setQuantidade(e.target.value)} 
                placeholder="Quantidade"
                min="0"
                step="0.01"
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Responsável</Label>
              <Input 
                value={responsavel} 
                onChange={(e) => setResponsavel(e.target.value)} 
                placeholder="Nome do responsável"
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Observações</Label>
              <Input 
                value={observacoes} 
                onChange={(e) => setObservacoes(e.target.value)} 
                placeholder="Observações (opcional)"
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMovimentoStockDialog(false)} className={isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : ''}>
              Cancelar
            </Button>
            <Button onClick={handleMovimentoStock} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold" disabled={!selectedMaterial || !quantidade}>
              Registar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Devolver Recurso */}
      <Dialog open={devolverDialog} onOpenChange={setDevolverDialog}>
        <DialogContent className={`sm:max-w-lg ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Devolver {recursoDevolver?.tipo === "equipamento" ? "Equipamento" : "Viatura"}</DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
              Confirmar devolução de: <span className="text-orange-500 font-medium">{recursoDevolver?.codigo || recursoDevolver?.matricula}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Responsável pela Devolução</Label>
              <Input 
                value={responsavel} 
                onChange={(e) => setResponsavel(e.target.value)} 
                placeholder="Nome do responsável"
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Observações</Label>
              <Input 
                value={observacoes} 
                onChange={(e) => setObservacoes(e.target.value)} 
                placeholder="Estado do recurso, observações..."
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setDevolverDialog(false); setRecursoDevolver(null); }} className={isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : ''}>
              Cancelar
            </Button>
            <Button onClick={handleDevolver} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <RotateCcw className="h-4 w-4 mr-2" /> Devolver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
