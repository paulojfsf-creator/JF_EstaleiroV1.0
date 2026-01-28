import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  const { token } = useAuth();
  const [downloading, setDownloading] = useState({ pdf: false, excel: false });
  const [summary, setSummary] = useState(null);

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
    }
  };

  const downloadPDF = async () => {
    setDownloading({ ...downloading, pdf: true });
    try {
      const response = await axios.get(`${API}/export/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "relatorio_armazem.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Relatório PDF exportado com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
    } finally {
      setDownloading({ ...downloading, pdf: false });
    }
  };

  const downloadExcel = async () => {
    setDownloading({ ...downloading, excel: true });
    try {
      const response = await axios.get(`${API}/export/excel`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "relatorio_armazem.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Relatório Excel exportado com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar Excel");
    } finally {
      setDownloading({ ...downloading, excel: false });
    }
  };

  return (
    <div data-testid="reports-page">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3">
          <FileText className="h-8 w-8 text-amber-500" />
          Relatórios
        </h1>
        <p className="page-subtitle">Exportação de relatórios do armazém</p>
      </div>

      {/* Summary Preview */}
      {summary && (
        <Card className="mb-8 border-slate-200">
          <CardHeader>
            <CardTitle>Resumo do Armazém</CardTitle>
            <CardDescription>Prévia dos dados que serão incluídos nos relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-50 p-4 rounded-sm">
                <p className="text-2xl font-black text-slate-900">{summary.machines?.total || 0}</p>
                <p className="text-sm text-slate-500">Máquinas</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-sm">
                <p className="text-2xl font-black text-slate-900">{summary.equipment?.total || 0}</p>
                <p className="text-sm text-slate-500">Equipamentos</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-sm">
                <p className="text-2xl font-black text-slate-900">{summary.tools?.total || 0}</p>
                <p className="text-sm text-slate-500">Ferramentas</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-sm">
                <p className="text-2xl font-black text-slate-900">{summary.vehicles?.total || 0}</p>
                <p className="text-sm text-slate-500">Viaturas</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-sm">
                <p className="text-2xl font-black text-slate-900">{summary.materials?.total || 0}</p>
                <p className="text-sm text-slate-500">Materiais</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-sm">
                <p className="text-2xl font-black text-slate-900">{summary.obras?.total || 0}</p>
                <p className="text-sm text-slate-500">Obras</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              Relatório PDF
            </CardTitle>
            <CardDescription>
              Exportar relatório completo em formato PDF para impressão ou arquivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-600 space-y-1 mb-4">
              <li>• Resumo geral do armazém</li>
              <li>• Totais por categoria</li>
              <li>• Estado dos recursos</li>
              <li>• Data de geração</li>
            </ul>
            <Button 
              onClick={downloadPDF} 
              disabled={downloading.pdf}
              className="w-full btn-primary"
              data-testid="export-pdf-btn"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading.pdf ? "A exportar..." : "Exportar PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
              Relatório Excel
            </CardTitle>
            <CardDescription>
              Exportar dados detalhados em formato Excel para análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-600 space-y-1 mb-4">
              <li>• Folhas separadas por categoria</li>
              <li>• Todos os campos de cada recurso</li>
              <li>• Fácil de filtrar e analisar</li>
              <li>• Compatível com Excel/Google Sheets</li>
            </ul>
            <Button 
              onClick={downloadExcel} 
              disabled={downloading.excel}
              className="w-full btn-primary"
              data-testid="export-excel-btn"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading.excel ? "A exportar..." : "Exportar Excel"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
