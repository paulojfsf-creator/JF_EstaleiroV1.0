import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth, API } from "@/App";
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
  Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViaturaDetail() {
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
      const response = await axios.get(`${API}/viaturas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      toast.error("Viatura não encontrada");
      navigate("/viaturas");
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

  const { viatura, obra_atual, historico, km_historico } = data;

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

  const vistoriaDays = getDaysUntil(viatura.data_vistoria);
  const seguroDays = getDaysUntil(viatura.data_seguro);

  return (
    <div data-testid="viatura-detail-page" className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/viaturas")}
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
                  {viatura.foto ? (
                    <img 
                      src={viatura.foto.startsWith('/api') ? `${process.env.REACT_APP_BACKEND_URL}${viatura.foto}` : viatura.foto}
                      alt={viatura.matricula}
                      className="h-20 w-20 object-cover rounded-lg bg-neutral-700"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-neutral-700 rounded-lg flex items-center justify-center">
                      <Truck className="h-8 w-8 text-neutral-500" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-2xl text-white">{viatura.marca} {viatura.modelo}</CardTitle>
                    <p className="text-orange-500 font-mono text-lg font-bold mt-1">{viatura.matricula}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={viatura.ativa ? "default" : "secondary"} className={viatura.ativa ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-600 text-neutral-400"}>
                        {viatura.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                      <Badge variant="outline" className="border-neutral-600 text-neutral-300">
                        <Fuel className="h-3 w-3 mr-1" />
                        {viatura.combustivel || "Gasóleo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Documentação */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Documentação</h3>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span className="text-neutral-500">Doc. Único:</span>
                    <span className="font-mono">{viatura.documento_unico || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <span className="text-neutral-500">Apólice Seguro:</span>
                    <span className="font-mono">{viatura.apolice_seguro || "-"}</span>
                  </div>
                </div>
                
                {/* Datas */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Datas Importantes</h3>
                  <div className={`flex items-center justify-between p-3 rounded-lg ${vistoriaDays !== null && vistoriaDays <= 7 ? (vistoriaDays <= 0 ? "bg-red-500/20 border border-red-500/30" : "bg-amber-500/20 border border-amber-500/30") : "bg-neutral-700/50"}`}>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="text-neutral-400">Vistoria:</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white">{formatDateSimple(viatura.data_vistoria)}</span>
                      {vistoriaDays !== null && (
                        <p className={`text-xs ${vistoriaDays <= 0 ? "text-red-400" : vistoriaDays <= 7 ? "text-amber-400" : "text-neutral-500"}`}>
                          {vistoriaDays <= 0 ? "Expirada!" : `${vistoriaDays} dias restantes`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg ${seguroDays !== null && seguroDays <= 7 ? (seguroDays <= 0 ? "bg-red-500/20 border border-red-500/30" : "bg-amber-500/20 border border-amber-500/30") : "bg-neutral-700/50"}`}>
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span className="text-neutral-400">Seguro:</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white">{formatDateSimple(viatura.data_seguro)}</span>
                      {seguroDays !== null && (
                        <p className={`text-xs ${seguroDays <= 0 ? "text-red-400" : seguroDays <= 7 ? "text-amber-400" : "text-neutral-500"}`}>
                          {seguroDays <= 0 ? "Expirado!" : `${seguroDays} dias restantes`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {viatura.observacoes && (
                <div className="mt-6 p-4 bg-neutral-700/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Observações</h3>
                  <p className="text-neutral-300">{viatura.observacoes}</p>
                </div>
              )}
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
                    <p className="text-sm text-neutral-500">Esta viatura não está atribuída a nenhuma obra</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de KM */}
          {km_historico && km_historico.length > 0 && (
            <Card className="bg-neutral-800 border-neutral-700 mt-6">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-orange-500" />
                  Histórico de Quilómetros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-neutral-400 border-b border-neutral-700">
                        <th className="text-left py-2">Data</th>
                        <th className="text-left py-2">Condutor</th>
                        <th className="text-right py-2">KM Inicial</th>
                        <th className="text-right py-2">KM Final</th>
                        <th className="text-right py-2">Percorridos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {km_historico.slice(0, 10).map((km, idx) => (
                        <tr key={km.id || idx} className="border-b border-neutral-700/50 text-neutral-300">
                          <td className="py-2">{km.data ? formatDateSimple(km.data) : "-"}</td>
                          <td className="py-2">{km.condutor || "-"}</td>
                          <td className="py-2 text-right font-mono">{km.km_inicial?.toLocaleString() || "-"}</td>
                          <td className="py-2 text-right font-mono">{km.km_final?.toLocaleString() || "-"}</td>
                          <td className="py-2 text-right font-mono text-orange-400">
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
                      {mov.obra_nome && (
                        <p className="text-sm text-neutral-300 mb-2">
                          <Building2 className="h-3 w-3 inline mr-1 text-orange-500" />
                          Obra: <span className="text-orange-500 font-medium">{mov.obra_nome}</span>
                        </p>
                      )}
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
