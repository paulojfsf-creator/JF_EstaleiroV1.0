import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth, API } from "@/App";
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
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EquipamentoDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400">A carregar...</div>
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
          className="text-neutral-400 hover:text-white"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Info Card */}
        <div className="flex-1">
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader className="border-b border-neutral-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {equipamento.foto ? (
                    <img 
                      src={equipamento.foto.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${equipamento.foto}` : equipamento.foto}
                      alt={equipamento.descricao}
                      className="h-20 w-20 object-cover rounded-lg bg-neutral-700"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-neutral-700 rounded-lg flex items-center justify-center">
                      <Wrench className="h-8 w-8 text-neutral-500" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-2xl text-white">{equipamento.descricao}</CardTitle>
                    <p className="text-neutral-400 font-mono text-sm mt-1">{equipamento.codigo}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={equipamento.ativo ? "default" : "secondary"} className={equipamento.ativo ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-600 text-neutral-400"}>
                        {equipamento.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline" className={`border-neutral-600 ${equipamento.estado_conservacao === "Bom" ? "text-emerald-400" : equipamento.estado_conservacao === "Razoável" ? "text-amber-400" : "text-red-400"}`}>
                        {equipamento.estado_conservacao}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Tag className="h-4 w-4 text-orange-500" />
                    <span className="text-neutral-500">Marca/Modelo:</span>
                    <span>{equipamento.marca || "-"} {equipamento.modelo || ""}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Hash className="h-4 w-4 text-orange-500" />
                    <span className="text-neutral-500">Nº Série:</span>
                    <span className="font-mono">{equipamento.numero_serie || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Wrench className="h-4 w-4 text-orange-500" />
                    <span className="text-neutral-500">Categoria:</span>
                    <span>{equipamento.categoria || "-"}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="text-neutral-500">Data Aquisição:</span>
                    <span>{equipamento.data_aquisicao ? formatDate(equipamento.data_aquisicao).split(",")[0] : "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-neutral-500">Criado em:</span>
                    <span>{formatDate(equipamento.created_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização Atual */}
          <Card className="bg-neutral-800 border-neutral-700 mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
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
                    <p className="font-semibold text-white">{obra_atual.nome}</p>
                    <p className="text-sm text-neutral-400">{obra_atual.codigo} • {obra_atual.endereco || "Sem endereço"}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-neutral-700/50 border border-neutral-600 rounded-lg">
                  <Building2 className="h-8 w-8 text-neutral-500" />
                  <div>
                    <p className="font-semibold text-neutral-300">Em Armazém</p>
                    <p className="text-sm text-neutral-500">Este equipamento não está atribuído a nenhuma obra</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Movimentos */}
        <div className="lg:w-96">
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
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
                        <Badge className={mov.tipo_movimento === "Saida" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}>
                          {mov.tipo_movimento === "Saida" ? "Saída" : "Devolução"}
                        </Badge>
                        <span className="text-xs text-neutral-500">{formatDate(mov.created_at)}</span>
                      </div>
                      {mov.tipo_movimento === "Saida" ? (
                        <>
                          <p className="text-sm text-neutral-300">
                            <User className="h-3 w-3 inline mr-1" />
                            Levantado por: <span className="text-white">{mov.responsavel_levantou || "-"}</span>
                          </p>
                          {mov.data_levantamento && (
                            <p className="text-xs text-neutral-500 mt-1">
                              Data: {formatDate(mov.data_levantamento)}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-neutral-300">
                            <User className="h-3 w-3 inline mr-1" />
                            Devolvido por: <span className="text-white">{mov.responsavel_devolveu || "-"}</span>
                          </p>
                          {mov.data_devolucao && (
                            <p className="text-xs text-neutral-500 mt-1">
                              Data: {formatDate(mov.data_devolucao)}
                            </p>
                          )}
                        </>
                      )}
                      {mov.observacoes && (
                        <p className="text-xs text-neutral-400 mt-2 italic">"{mov.observacoes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
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
