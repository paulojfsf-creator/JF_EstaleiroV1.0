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
  MapPin,
  Tag,
  Hash,
  FileText,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EquipamentoDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/equipamentos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      toast.error("Equipamento não encontrado");
      navigate("/equipamentos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
        A carregar...
      </div>
    );
  }

  const { equipamento, obra_atual, historico } = data;

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

  return (
    <div data-testid="equipamento-detail-page" className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/equipamentos")}
          className={isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Info Card */}
        <div className="flex-1">
          <Card className={isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}>
            <CardHeader className={`border-b ${isDark ? 'border-neutral-700' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {equipamento.foto ? (
                  <img 
                    src={equipamento.foto.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${equipamento.foto}` : equipamento.foto}
                    alt={equipamento.descricao}
                    className={`h-20 w-20 object-cover rounded-lg ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}
                  />
                ) : (
                  <div className={`h-20 w-20 rounded-lg flex items-center justify-center ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}>
                    <Wrench className={`h-8 w-8 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{equipamento.descricao}</CardTitle>
                  <p className={`font-mono text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{equipamento.codigo}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={equipamento.ativo ? "default" : "secondary"} className={equipamento.ativo ? "bg-emerald-500/20 text-emerald-500" : `${isDark ? 'bg-neutral-600 text-neutral-400' : 'bg-gray-200 text-gray-500'}`}>
                      {equipamento.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline" className={`${isDark ? 'border-neutral-600' : 'border-gray-300'} ${equipamento.estado_conservacao === "Bom" ? "text-emerald-500" : equipamento.estado_conservacao === "Razoável" ? "text-amber-500" : "text-red-500"}`}>
                      {equipamento.estado_conservacao}
                    </Badge>
                    {equipamento.em_manutencao && (
                      <Badge className="bg-amber-500/20 text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Em Manutenção
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                    <Tag className="h-4 w-4 text-orange-500" />
                    <span className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Marca/Modelo:</span>
                    <span>{equipamento.marca || "-"} {equipamento.modelo || ""}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                    <Hash className="h-4 w-4 text-orange-500" />
                    <span className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Nº Série:</span>
                    <span className="font-mono">{equipamento.numero_serie || "-"}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                    <Wrench className="h-4 w-4 text-orange-500" />
                    <span className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Categoria:</span>
                    <span>{equipamento.categoria || "-"}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Data Aquisição:</span>
                    <span>{equipamento.data_aquisicao ? formatDate(equipamento.data_aquisicao).split(",")[0] : "-"}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className={isDark ? 'text-neutral-500' : 'text-gray-500'}>Criado em:</span>
                    <span>{formatDate(equipamento.created_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização Atual */}
          <Card className={`mt-6 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
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
                  className="flex items-center gap-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg hover:bg-orange-500/20 transition-colors"
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
                    <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Este equipamento não está atribuído a nenhuma obra</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Avaria / Em Manutenção */}
          {equipamento.em_manutencao && (
            <Card className={`mt-6 border-amber-500/30 ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                  Em Manutenção / Avariado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={isDark ? 'text-neutral-300' : 'text-gray-700'}>
                  {equipamento.descricao_avaria || "Sem descrição da avaria"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Documentação */}
          {(equipamento.manual_url || equipamento.certificado_url || equipamento.ficha_manutencao_url) && (
            <Card className={`mt-6 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FileText className="h-5 w-5 text-orange-500" />
                  Documentação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipamento.manual_url && (
                    <a 
                      href={equipamento.manual_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                    >
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Manual de Utilizador</span>
                      <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                    </a>
                  )}
                  {equipamento.certificado_url && (
                    <a 
                      href={equipamento.certificado_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                    >
                      <FileText className="h-5 w-5 text-emerald-500" />
                      <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Certificado de Conformidade</span>
                      <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                    </a>
                  )}
                  {equipamento.ficha_manutencao_url && (
                    <a 
                      href={equipamento.ficha_manutencao_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDark ? 'bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                    >
                      <FileText className="h-5 w-5 text-amber-500" />
                      <span className={`flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>Ficha de Manutenção</span>
                      <ExternalLink className={`h-4 w-4 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Histórico de Movimentos */}
        <div className="lg:w-96">
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
    </div>
  );
}
