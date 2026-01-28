import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { 
  Cog, 
  Wrench, 
  Hammer, 
  Truck, 
  Package, 
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusIcons = {
  available: CheckCircle,
  in_use: Clock,
  maintenance: AlertTriangle,
  broken: XCircle
};

const statusColors = {
  available: "text-emerald-500",
  in_use: "text-amber-500",
  maintenance: "text-orange-500",
  broken: "text-red-500"
};

export default function Dashboard() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API}/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">A carregar...</div>
      </div>
    );
  }

  const resourceCards = [
    { key: "machines", label: "Máquinas", icon: Cog, data: summary?.machines },
    { key: "equipment", label: "Equipamentos", icon: Wrench, data: summary?.equipment },
    { key: "tools", label: "Ferramentas", icon: Hammer, data: summary?.tools },
    { key: "vehicles", label: "Viaturas", icon: Truck, data: summary?.vehicles },
  ];

  return (
    <div data-testid="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral do armazém</p>
      </div>

      {/* Alerts Section */}
      {summary?.alerts && summary.alerts.length > 0 && (
        <div className="mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alertas de Manutenção
          </h2>
          <div className="grid gap-3">
            {summary.alerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`alert-card ${alert.urgent ? 'urgent' : ''}`}
                data-testid={`alert-${idx}`}
              >
                <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${alert.urgent ? 'text-red-500' : 'text-amber-500'}`} />
                <div>
                  <p className="font-medium text-slate-900">
                    {alert.type === "machine" ? "Máquina" : "Viatura"}: {alert.name}
                    {alert.plate && <span className="ml-2 text-slate-500">({alert.plate})</span>}
                  </p>
                  <p className={`text-sm ${alert.urgent ? 'text-red-600' : 'text-amber-600'}`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {resourceCards.map((card, idx) => (
          <Card key={card.key} className="stat-card animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }} data-testid={`stat-${card.key}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </CardTitle>
              <card.icon className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{card.data?.total || 0}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-slate-600">{card.data?.available || 0} Disp.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-slate-600">{card.data?.in_use || 0} Em uso</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-slate-600">{card.data?.maintenance || 0} Manut.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-slate-600">{card.data?.broken || 0} Avariado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Materials & Obras Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="stat-card animate-fade-in stagger-4" data-testid="stat-materials">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Materiais
            </CardTitle>
            <Package className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{summary?.materials?.total || 0}</div>
            <p className="text-sm text-slate-500 mt-1">
              {summary?.materials?.total_quantity || 0} unidades em stock
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card animate-fade-in stagger-4" data-testid="stat-obras">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Obras
            </CardTitle>
            <Building2 className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{summary?.obras?.total || 0}</div>
            <div className="mt-3 flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-emerald-500 rounded-full" />
                <span className="text-slate-600">{summary?.obras?.active || 0} Ativas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-slate-400 rounded-full" />
                <span className="text-slate-600">{summary?.obras?.completed || 0} Concluídas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-amber-500 rounded-full" />
                <span className="text-slate-600">{summary?.obras?.paused || 0} Pausadas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
