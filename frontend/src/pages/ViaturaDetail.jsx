import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth, useTheme, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Truck, 
  Building2, 
  Calendar, 
  User, 
  Clock,
  ArrowRightLeft,
  MapPin,
  Fuel,
  FileText,
  Shield,
  Gauge,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  Pencil,
  Bell,
  Wrench
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

export default function ViaturaDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  // Dialogs e estados de edição
  const [manutencaoDialog, setManutencaoDialog] = useState(false);
  const [descricaoAvaria, setDescricaoAvaria] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingAvaria, setEditingAvaria] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id, token, navigate]);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/viaturas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
      setDescricaoAvaria(response.data.viatura?.descricao_avaria || "");
    } catch (error) {
      toast.error("Viatura não encontrada");
      navigate("/viaturas");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleToggleManutencao = async (novoEstado) => {
    if (novoEstado) {
      setManutencaoDialog(true);
    } else {
      await updateManutencao(false, "");
    }
  };

  const handleConfirmManutencao = async () => {
    await updateManutencao(true, descricaoAvaria);
    setManutencaoDialog(false);
  };

  const handleSaveAvaria = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API}/viaturas/${id}/manutencao`, {
        em_manutencao: true,
        descricao_avaria: descricaoAvaria
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success("Descrição da avaria atualizada");
      setEditingAvaria(false);
      fetchData();
    } catch (error) {
      toast.error("Erro ao guardar descrição");
    } finally {
      setSaving(false);
    }
  };

  const updateManutencao = async (emManutencao, descricao) => {
    setSaving(true);
    try {
      await axios.patch(`${API}/viaturas/${id}/manutencao`, {
        em_manutencao: emManutencao,
        descricao_avaria: descricao
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(emManutencao ? "Viatura marcada como em oficina" : "Viatura disponível novamente");
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
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateSimple = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("pt-PT");
    } catch {
      return dateStr;
    }
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
      return diff;
    } catch {
      return null;
    }
  };

  const getStatusInfo = () => {
    if (!data?.viatura) return { color: "gray", label: "Desconhecido", icon: null };
    
    const v = data.viatura;
    
    if (v.em_manutencao) {
      return { 
        color: "red", 
        bgClass: isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200",
        textClass: "text-red-500",
        label: "Em Oficina / Avariado", 
        icon: AlertTriangle 
      };
    }
    
    if (v.obra_id) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={isDark ? 'text-neutral-400' : 'text-gray-500'}>A carregar...</div>
      </div>
    );
  }

  if (!data) return null;

  const { viatura, obra_atual, historico, km_historico, alertas } = data;
  const status = getStatusInfo();
  const StatusIcon = status.icon;

  const ipoDays = getDaysUntil(viatura.data_ipo);
  const seguroDays = getDaysUntil(viatura.data_seguro);
  const revisaoDays = getDaysUntil(viatura.data_proxima_revisao);
  const vistoriaDays = getDaysUntil(viatura.data_vistoria);

  return (
    <div data-testid="viatura-detail-page" className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/viaturas")}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {StatusIcon && <StatusIcon className={`h-6 w-6 ${status.textClass}`} />}
              <div className="flex-1">
                <p className={`font-semibold text-lg ${status.textClass}`}>{status.label}</p>
                {viatura.em_manutencao && (
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
                            onClick={() => { setEditingAvaria(false); setDescricaoAvaria(viatura.descricao_avaria || ""); }}
                            className={isDark ? 'border-neutral-600 text-neutral-300' : ''}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                          {viatura.descricao_avaria || <span className={isDark ? 'text-neutral-500 italic' : 'text-gray-400 italic'}>Sem descrição da avaria</span>}
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
              {!viatura.em_manutencao ? (
                <Button 
                  onClick={() => handleToggleManutencao(true)}
                  variant="outline"
                  className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  data-testid="marcar-manutencao-btn"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Marcar em Oficina
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

      {/* Alertas */}
      {alertas && alertas.length > 0 && (
        <Card className={`mb-6 border-2 ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-5 w-5 text-amber-500" />
              <span className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                Alertas ({alertas.length})
              </span>
            </div>
            <div className="space-y-2">
              {alertas.map((alerta, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2 text-sm ${alerta.urgente ? 'text-red-500 font-medium' : (isDark ? 'text-neutral-300' : 'text-gray-700')}`}
                >
                  <AlertTriangle className={`h-4 w-4 ${alerta.urgente ? 'text-red-500' : 'text-amber-500'}`} />
                  <span>{alerta.mensagem}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <div className="flex items-start gap-4">
                {viatura.foto ? (
                  <img 
                    src={viatura.foto.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${viatura.foto}` : viatura.foto}
                    alt={viatura.matricula}
                    className="w-24 h-24 object-cover rounded-xl border-2 border-orange-500/30"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-xl flex items-center justify-center ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}>
                    <Truck className="h-10 w-10 text-orange-500" />
                  </div>
                )}
                <div className="flex-1">
                  <span className="text-orange-500 font-mono text-lg font-bold">{viatura.matricula}</span>
                  <CardTitle className={`text-xl mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{viatura.marca} {viatura.modelo}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={viatura.ativa ? "default" : "secondary"} className={viatura.ativa ? "bg-emerald-500/20 text-emerald-500" : `${isDark ? 'bg-neutral-600 text-neutral-400' : 'bg-gray-200 text-gray-500'}`}>
                      {viatura.ativa ? "Ativa" : "Inativa"}
                    </Badge>
                    <Badge variant="outline" className={`${isDark ? 'border-neutral-600' : 'border-gray-300'}`}>
                      <Fuel className="h-3 w-3 mr-1" />
                      {viatura.combustivel || "Gasóleo"}
                    </Badge>
                    {viatura.kms_atual > 0 && (
                      <Badge variant="outline" className={`${isDark ? 'border-neutral-600 text-neutral-300' : 'border-gray-300 text-gray-600'}`}>
                        <Gauge className="h-3 w-3 mr-1" />
                        {viatura.kms_atual.toLocaleString()} km
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Datas Importantes */}
              <div className="mb-6">
                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                  Datas Importantes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Seguro */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${seguroDays !== null && seguroDays <= 30 ? (seguroDays <= 0 ? (isDark ? "bg-red-500/20 border border-red-500/30" : "bg-red-50 border border-red-200") : seguroDays <= 7 ? (isDark ? "bg-amber-500/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200") : (isDark ? "bg-neutral-700/50" : "bg-gray-50")) : (isDark ? "bg-neutral-700/50" : "bg-gray-50")}`}>
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Seguro:</span>
                    </div>
                    <div className="text-right">
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatDateSimple(viatura.data_seguro)}</span>
                      {seguroDays !== null && (
                        <p className={`text-xs ${seguroDays <= 0 ? "text-red-500" : seguroDays <= 7 ? "text-amber-500" : (isDark ? 'text-neutral-500' : 'text-gray-400')}`}>
                          {seguroDays <= 0 ? "Expirado!" : `${seguroDays} dias restantes`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* IPO */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${ipoDays !== null && ipoDays <= 30 ? (ipoDays <= 0 ? (isDark ? "bg-red-500/20 border border-red-500/30" : "bg-red-50 border border-red-200") : ipoDays <= 7 ? (isDark ? "bg-amber-500/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200") : (isDark ? "bg-neutral-700/50" : "bg-gray-50")) : (isDark ? "bg-neutral-700/50" : "bg-gray-50")}`}>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>IPO:</span>
                    </div>
                    <div className="text-right">
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatDateSimple(viatura.data_ipo)}</span>
                      {ipoDays !== null && (
                        <p className={`text-xs ${ipoDays <= 0 ? "text-red-500" : ipoDays <= 7 ? "text-amber-500" : (isDark ? 'text-neutral-500' : 'text-gray-400')}`}>
                          {ipoDays <= 0 ? "Expirado!" : `${ipoDays} dias restantes`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Próxima Revisão */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${revisaoDays !== null && revisaoDays <= 30 ? (revisaoDays <= 0 ? (isDark ? "bg-red-500/20 border border-red-500/30" : "bg-red-50 border border-red-200") : revisaoDays <= 7 ? (isDark ? "bg-amber-500/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200") : (isDark ? "bg-neutral-700/50" : "bg-gray-50")) : (isDark ? "bg-neutral-700/50" : "bg-gray-50")}`}>
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-orange-500" />
                      <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Revisão:</span>
                    </div>
                    <div className="text-right">
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatDateSimple(viatura.data_proxima_revisao)}</span>
                      {revisaoDays !== null && (
                        <p className={`text-xs ${revisaoDays <= 0 ? "text-red-500" : revisaoDays <= 7 ? "text-amber-500" : (isDark ? 'text-neutral-500' : 'text-gray-400')}`}>
                          {revisaoDays <= 0 ? "Expirada!" : `${revisaoDays} dias restantes`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vistoria */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${vistoriaDays !== null && vistoriaDays <= 30 ? (vistoriaDays <= 0 ? (isDark ? "bg-red-500/20 border border-red-500/30" : "bg-red-50 border border-red-200") : vistoriaDays <= 7 ? (isDark ? "bg-amber-500/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200") : (isDark ? "bg-neutral-700/50" : "bg-gray-50")) : (isDark ? "bg-neutral-700/50" : "bg-gray-50")}`}>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Vistoria:</span>
                    </div>
                    <div className="text-right">
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatDateSimple(viatura.data_vistoria)}</span>
                      {vistoriaDays !== null && (
                        <p className={`text-xs ${vistoriaDays <= 0 ? "text-red-500" : vistoriaDays <= 7 ? "text-amber-500" : (isDark ? 'text-neutral-500' : 'text-gray-400')}`}>
                          {vistoriaDays <= 0 ? "Expirada!" : `${vistoriaDays} dias restantes`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quilometragem para próxima revisão */}
              {viatura.kms_proxima_revisao > 0 && (
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-neutral-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gauge className="h-5 w-5 text-orange-500" />
                      <span className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Próxima revisão aos:</span>
                    </div>
                    <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {viatura.kms_proxima_revisao.toLocaleString()} km
                    </span>
                  </div>
                  {viatura.kms_atual > 0 && (
                    <div className="mt-2">
                      <div className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                        Faltam: <span className={`font-semibold ${(viatura.kms_proxima_revisao - viatura.kms_atual) <= 1000 ? 'text-amber-500' : (isDark ? 'text-emerald-400' : 'text-emerald-600')}`}>
                          {(viatura.kms_proxima_revisao - viatura.kms_atual).toLocaleString()} km
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-neutral-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${(viatura.kms_proxima_revisao - viatura.kms_atual) <= 1000 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min((viatura.kms_atual / viatura.kms_proxima_revisao) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {viatura.observacoes && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-neutral-700/50' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                    Observações
                  </h3>
                  <p className={isDark ? 'text-neutral-300' : 'text-gray-700'}>{viatura.observacoes}</p>
                </div>
              )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* DUA */}
                {viatura.dua_url ? (
                  <a 
                    href={getDocumentUrl(viatura.dua_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>DUA (Doc. Único)</span>
                    <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </a>
                ) : (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-neutral-700/30 border-neutral-700 text-neutral-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                    <span className="flex-1">DUA (Doc. Único)</span>
                    <span className="text-xs">Não disponível</span>
                  </div>
                )}

                {/* Seguro */}
                {viatura.seguro_url ? (
                  <a 
                    href={getDocumentUrl(viatura.seguro_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <Shield className="h-5 w-5 text-emerald-500" />
                    <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Apólice de Seguro</span>
                    <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </a>
                ) : (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-neutral-700/30 border-neutral-700 text-neutral-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <Shield className="h-5 w-5" />
                    <span className="flex-1">Apólice de Seguro</span>
                    <span className="text-xs">Não disponível</span>
                  </div>
                )}

                {/* IPO */}
                {viatura.ipo_url ? (
                  <a 
                    href={getDocumentUrl(viatura.ipo_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <FileText className="h-5 w-5 text-amber-500" />
                    <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Ficha IPO</span>
                    <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </a>
                ) : (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-neutral-700/30 border-neutral-700 text-neutral-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                    <span className="flex-1">Ficha IPO</span>
                    <span className="text-xs">Não disponível</span>
                  </div>
                )}

                {/* Carta Verde */}
                {viatura.carta_verde_url ? (
                  <a 
                    href={getDocumentUrl(viatura.carta_verde_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <FileText className="h-5 w-5 text-green-500" />
                    <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Carta Verde</span>
                    <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </a>
                ) : (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-neutral-700/30 border-neutral-700 text-neutral-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                    <span className="flex-1">Carta Verde</span>
                    <span className="text-xs">Não disponível</span>
                  </div>
                )}

                {/* Manual */}
                {viatura.manual_url ? (
                  <a 
                    href={getDocumentUrl(viatura.manual_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors md:col-span-2 ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                  >
                    <FileText className="h-5 w-5 text-purple-500" />
                    <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Manual do Veículo</span>
                    <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </a>
                ) : (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border md:col-span-2 ${isDark ? 'bg-neutral-700/30 border-neutral-700 text-neutral-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                    <span className="flex-1">Manual do Veículo</span>
                    <span className="text-xs">Não disponível</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Localização Atual */}
          <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <MapPin className="h-5 w-5 text-orange-500" />
                Localização Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {obra_atual ? (
                <Link 
                  to={`/obras/${obra_atual.id}`}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${isDark ? 'bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20' : 'bg-orange-50 border border-orange-200 hover:bg-orange-100'}`}
                >
                  <Building2 className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{obra_atual.nome}</p>
                    <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{obra_atual.codigo} • {obra_atual.endereco || "Sem endereço"}</p>
                  </div>
                </Link>
              ) : (
                <div className={`flex items-center gap-4 p-4 rounded-lg border ${isDark ? 'bg-neutral-700/50 border-neutral-600' : 'bg-gray-50 border-gray-200'}`}>
                  <Building2 className={`h-8 w-8 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>Em Armazém</p>
                    <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>Esta viatura não está atribuída a nenhuma obra</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de KM */}
          {km_historico && km_historico.length > 0 && (
            <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Gauge className="h-5 w-5 text-orange-500" />
                  Histórico de Quilómetros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${isDark ? 'text-neutral-400 border-neutral-700' : 'text-gray-500 border-gray-200'}`}>
                        <th className="text-left py-2">Data</th>
                        <th className="text-left py-2">Condutor</th>
                        <th className="text-right py-2">KM Inicial</th>
                        <th className="text-right py-2">KM Final</th>
                        <th className="text-right py-2">Percorridos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {km_historico.slice(0, 10).map((km, idx) => (
                        <tr key={km.id || idx} className={`border-b ${isDark ? 'border-neutral-700/50 text-neutral-300' : 'border-gray-100 text-gray-700'}`}>
                          <td className="py-2">{km.data ? formatDateSimple(km.data) : "-"}</td>
                          <td className="py-2">{km.condutor || "-"}</td>
                          <td className="py-2 text-right font-mono">{km.km_inicial?.toLocaleString() || "-"}</td>
                          <td className="py-2 text-right font-mono">{km.km_final?.toLocaleString() || "-"}</td>
                          <td className="py-2 text-right font-mono text-orange-500">
                            {km.km_inicial && km.km_final ? (km.km_final - km.km_inicial).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Histórico de Movimentos */}
        <div className="lg:col-span-1">
          <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <ArrowRightLeft className="h-5 w-5 text-orange-500" />
                Histórico de Movimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historico && historico.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
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
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                  <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Sem movimentos registados</p>
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
              Marcar em Oficina
            </DialogTitle>
            <DialogDescription className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
              Descreva o problema ou avaria da viatura
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
