import { useState, useEffect, useCallback } from "react";
import { useAuth, useTheme, API } from "@/App";
import axios from "axios";
import { 
  Wrench, 
  Truck, 
  Package, 
  Building2,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";

  const fetchSummary = useCallback(async () => {
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
}, [token]);

  useEffect(() => {
  fetchSummary();
}, [fetchSummary]);
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
        A carregar...
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page" className="animate-fade-in">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
        <p className={`mt-1 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Visão geral do armazém</p>
      </div>

      {/* Alerts Section */}
      {summary?.alerts && summary.alerts.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alertas ({summary.alerts.length})
          </h2>
          <div className="grid gap-3 max-h-64 overflow-y-auto">
            {summary.alerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-3 p-4 rounded-lg border ${alert.urgent ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}
                data-testid={`alert-${idx}`}
              >
                <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${alert.urgent ? 'text-red-500' : 'text-amber-500'}`} />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{alert.item}</p>
                  <p className={`text-sm ${alert.urgent ? 'text-red-400' : 'text-amber-500'}`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/equipamentos">
          <Card className={`hover:border-orange-500/50 transition-colors cursor-pointer group ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200 shadow-sm'}`} data-testid="stat-equipamentos">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                Equipamentos
              </CardTitle>
              <Wrench className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{summary?.equipamentos?.total || 0}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-3 text-sm">
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle className="h-3.5 w-3.5" /> {summary?.equipamentos?.ativos || 0} ativos
                  </span>
                </div>
                <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm">
                  Ver <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className={`mt-2 text-xs ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                {summary?.equipamentos?.em_obra || 0} em obra
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/viaturas">
          <Card className={`hover:border-orange-500/50 transition-colors cursor-pointer group ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200 shadow-sm'}`} data-testid="stat-viaturas">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                Viaturas
              </CardTitle>
              <Truck className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{summary?.viaturas?.total || 0}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-3 text-sm">
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle className="h-3.5 w-3.5" /> {summary?.viaturas?.ativas || 0} ativas
                  </span>
                </div>
                <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm">
                  Ver <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className={`mt-2 text-xs ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                {summary?.viaturas?.em_obra || 0} em obra
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/materiais">
          <Card className={`hover:border-orange-500/50 transition-colors cursor-pointer group ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200 shadow-sm'}`} data-testid="stat-materiais">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                Materiais
              </CardTitle>
              <Package className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{summary?.materiais?.total || 0}</div>
              <div className="mt-3 flex items-center justify-between">
                <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                  Stock total: <span className={isDark ? 'text-white' : 'text-gray-900'}>{summary?.materiais?.stock_total || 0}</span>
                </p>
                <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm">
                  Ver <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/obras">
          <Card className={`hover:border-orange-500/50 transition-colors cursor-pointer group ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200 shadow-sm'}`} data-testid="stat-obras">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                Obras
              </CardTitle>
              <Building2 className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{summary?.obras?.total || 0}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded text-xs">
                    {summary?.obras?.ativas || 0} Ativas
                  </span>
                </div>
                <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm">
                  Ver <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
