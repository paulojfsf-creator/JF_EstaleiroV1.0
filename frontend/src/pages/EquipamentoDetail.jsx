import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth, useTheme, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Wrench, 
  Building2, 
  Calendar, 
  User, 
  Clock,
  ArrowRightLeft,
  Tag,
  Hash,
  FileText,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function EquipamentoDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";
  
  // Dialogs
  const [manutencaoDialog, setManutencaoDialog] = useState(false);
  const [descricaoAvaria, setDescricaoAvaria] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/equipamentos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
      setDescricaoAvaria(response.data.equipamento?.descricao_avaria || "");
    } catch (error) {
      toast.error("Equipamento não encontrado");
      navigate("/equipamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleManutencao = async (novoEstado) => {
    if (novoEstado) {
      // Abrir dialog para inserir descrição da avaria
      setManutencaoDialog(true);
    } else {
      // Remover de manutenção diretamente
      await updateManutencao(false, "");
    }
  };

  const handleConfirmManutencao = async () => {
    await updateManutencao(true, descricaoAvaria);
    setManutencaoDialog(false);
  };

  const updateManutencao = async (emManutencao, descricao) => {
    setSaving(true);
    try {
      await axios.patch(`${API}/equipamentos/${id}/manutencao`, {
        em_manutencao: emManutencao,
        descricao_avaria: descricao
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(emManutencao ? "Equipamento marcado como em manutenção" : "Equipamento disponível novamente");
      fetchData();
    } catch (error) {
      toast.error("Erro ao atualizar estado");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("pt-PT", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch { return dateStr; }
  };

  const getStatusInfo = () => {
    if (!data?.equipamento) return { color: "gray", label: "Desconhecido", icon: null };
    
    const eq = data.equipamento;
    
    if (eq.em_manutencao) {
      return { 
        color: "red", 
        bgClass: isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200",
        textClass: "text-red-500",
        label: "Em Manutenção / Oficina", 
        icon: AlertTriangle 
      };
    }
    
    if (eq.obra_id) {
      return { 
        color: "orange", 
        bgClass: isDark ? "bg-orange-500/10 border-orange-500/30" : "bg-orange-50 border-orange-200",
        textClass: "text-orange-500",
        label: "Em Obra", 
        icon: Building2 
      };
    }
    
    return { 
      color: "green", 
      bgClass: isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200",
      textClass: "text-emerald-500",
      label: "Disponível em Armazém", 
      icon: CheckCircle 
    };
  };

  const getDocumentUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/api")) return `${process.env.REACT_APP_BACKEND_URL}${url}`;
    return url;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className={isDark ? 'text-neutral-400' : 'text-gray-500'}>A carregar...</div></div>;
  if (!data) return null;

  const { equipamento, obra_atual, historico } = data;
  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div data-testid="equipamento-detail-page" className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/equipamentos")}
          className={isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Status Banner */}
      <Card className={`mb-6 border-2 ${status.bgClass}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {StatusIcon && <StatusIcon className={`h-6 w-6 ${status.textClass}`} />}
              <div className="flex-1">
                <p className={`font-semibold text-lg ${status.textClass}`}>{status.label}</p>
                {equipamento.em_manutencao && (
                  <div className="mt-2">
                    {editingAvaria ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={descricaoAvaria} 
                          onChange={(e) => setDescricaoAvaria(e.target.value)} 
                          placeholder="Descreva o problema, localização na oficina, previsão de reparação..." 
                          rows={3}
                          className={`text-sm ${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={handleSaveAvaria}
                            disabled={saving}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            {saving ? "A guardar..." : "Guardar"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setEditingAvaria(false); setDescricaoAvaria(equipamento.descricao_avaria || ""); }}
                            className={isDark ? 'border-neutral-600 text-neutral-300' : ''}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          {equipamento.descricao_avaria || <span className={isDark ? 'text-neutral-500 italic' : 'text-gray-400 italic'}>Sem descrição da avaria</span>}
                        </p>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setEditingAvaria(true)}
                          className={`h-6 px-2 ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                          data-testid="editar-avaria-btn"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {obra_atual && (
                  <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                    Obra: <Link to={`/obras/${obra_atual.id}`} className="text-orange-500 hover:underline">{obra_atual.nome}</Link>
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!equipamento.em_manutencao ? (
                <Button 
                  onClick={() => handleToggleManutencao(true)}
                  variant="outline"
                  className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  data-testid="marcar-manutencao-btn"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Marcar em Manutenção
                </Button>
              ) : (
                <Button 
                  onClick={() => handleToggleManutencao(false)}
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                  data-testid="disponivel-btn"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar Disponível
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div className="flex items-start gap-4">
                {equipamento.foto ? (
                  <img 
                    src={equipamento.foto.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${equipamento.foto}` : equipamento.foto}
                    alt={equipamento.descricao}
                    className="w-24 h-24 object-cover rounded-xl border-2 border-orange-500/30"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-xl flex items-center justify-center ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}>
                    <Wrench className="h-10 w-10 text-orange-500" />
                  </div>
                )}
                <div className="flex-1">
                  <span className="text-orange-500 font-mono text-sm">{equipamento.codigo}</span>
                  <CardTitle className={`text-xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{equipamento.descricao}</CardTitle>
                  <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{equipamento.marca} {equipamento.modelo}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={equipamento.ativo ? "default" : "secondary"} className={equipamento.ativo ? "bg-emerald-500/20 text-emerald-500" : `${isDark ? 'bg-neutral-600 text-neutral-400' : 'bg-gray-200 text-gray-500'}`}>
                      {equipamento.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline" className={`${isDark ? 'border-neutral-600' : 'border-gray-300'} ${equipamento.estado_conservacao === "Bom" ? "text-emerald-500" : equipamento.estado_conservacao === "Razoável" ? "text-amber-500" : "text-red-500"}`}>
                      {equipamento.estado_conservacao}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {equipamento.categoria && (
                  <div className="flex items-center gap-2">
                    <Tag className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Categoria</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{equipamento.categoria}</p>
                    </div>
                  </div>
                )}
                {equipamento.numero_serie && (
                  <div className="flex items-center gap-2">
                    <Hash className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Nº Série</p>
                      <p className={`font-medium font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{equipamento.numero_serie}</p>
                    </div>
                  </div>
                )}
                {equipamento.data_aquisicao && (
                  <div className="flex items-center gap-2">
                    <Calendar className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Data Aquisição</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(equipamento.data_aquisicao).split(",")[0]}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documentação */}
          <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FileText className="h-5 w-5 text-orange-500" />
                Documentação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {equipamento.manual_url ? (
                  <a 
                    href={getDocumentUrl(equipamento.manual_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Manual de Utilizador</span>
                    <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </a>
                ) : (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-neutral-700/30 border-neutral-700 text-neutral-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                    <span className="flex-1">Manual de Utilizador</span>
                    <span className="text-xs">Não disponível</span>
                  </div>
                )}
                {equipamento.certificado_url ? (
                  <a 
                    href={getDocumentUrl(equipamento.certificado_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <FileText className="h-5 w-5 text-emerald-500" />
                    <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Certificado de Conformidade</span>
                    <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </a>
                ) : (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-neutral-700/30 border-neutral-700 text-neutral-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                    <span className="flex-1">Certificado de Conformidade</span>
                    <span className="text-xs">Não disponível</span>
                  </div>
                )}
                {equipamento.ficha_manutencao_url ? (
                  <a 
                    href={getDocumentUrl(equipamento.ficha_manutencao_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <FileText className="h-5 w-5 text-amber-500" />
                    <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Ficha de Manutenção</span>
                    <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </a>
                ) : (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-neutral-700/30 border-neutral-700 text-neutral-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                    <span className="flex-1">Ficha de Manutenção</span>
                    <span className="text-xs">Não disponível</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Histórico */}
        <div className="lg:col-span-1">
          <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <ArrowRightLeft className="h-5 w-5 text-orange-500" />
                Histórico de Movimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historico?.length === 0 ? (
                <p className={isDark ? 'text-neutral-500' : 'text-gray-400'}>Sem movimentos registados</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {historico.map((mov, idx) => (
                    <div 
                      key={mov.id || idx}
                      className={`p-4 rounded-lg border ${mov.tipo_movimento === "Saida" ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={mov.tipo_movimento === "Saida" ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"}>
                          {mov.tipo_movimento === "Saida" ? "Saída" : "Devolução"}
                        </Badge>
                        <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>{formatDate(mov.created_at)}</span>
                      </div>
                      {mov.obra_nome && (
                        <p className={`text-sm mb-2 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          <Building2 className="h-3 w-3 inline mr-1 text-orange-500" />
                          Obra: <span className="text-orange-500 font-medium">{mov.obra_nome}</span>
                        </p>
                      )}
                      {mov.tipo_movimento === "Saida" ? (
                        <>
                          <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                            <User className="h-3 w-3 inline mr-1" />
                            Levantado por: <span className={isDark ? 'text-white' : 'text-gray-900'}>{mov.responsavel_levantou || "-"}</span>
                          </p>
                          {mov.data_levantamento && (
                            <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                              Data: {formatDate(mov.data_levantamento)}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                            <User className="h-3 w-3 inline mr-1" />
                            Devolvido por: <span className={isDark ? 'text-white' : 'text-gray-900'}>{mov.responsavel_devolveu || "-"}</span>
                          </p>
                          {mov.data_devolucao && (
                            <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                              Data: {formatDate(mov.data_devolucao)}
                            </p>
                          )}
                        </>
                      )}
                      {mov.observacoes && (
                        <p className={`text-xs mt-2 italic ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>"{mov.observacoes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: Marcar em Manutenção */}
      <Dialog open={manutencaoDialog} onOpenChange={setManutencaoDialog}>
        <DialogContent className={`sm:max-w-lg ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Marcar em Manutenção
            </DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
              Descreva o problema ou avaria do equipamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Descrição da Avaria *</Label>
              <Textarea 
                value={descricaoAvaria} 
                onChange={(e) => setDescricaoAvaria(e.target.value)} 
                placeholder="Descreva o problema, localização na oficina, previsão de reparação..." 
                rows={4}
                className={isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-gray-300 text-gray-900'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setManutencaoDialog(false)} className={isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-800' : ''}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmManutencao} disabled={saving} className="bg-red-500 hover:bg-red-600 text-white">
              {saving ? "A guardar..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
