import { useState, useEffect, useRef } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { FileText, Download, FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  const { token } = useAuth();
  const [downloading, setDownloading] = useState({ pdf: false, excel: false });
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const fileInputRef = useRef(null);

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
      link.setAttribute("download", "dados_armazem.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Dados Excel exportados com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar Excel");
    } finally {
      setDownloading({ ...downloading, excel: false });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Por favor, selecione um ficheiro Excel (.xlsx ou .xls)");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/import/excel`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { imported } = response.data;
      const total = (imported.equipamentos || 0) + (imported.viaturas || 0) + (imported.materiais || 0) + (imported.obras || 0);
      
      if (total > 0) {
        toast.success(`Importação concluída: ${imported.equipamentos || 0} equipamentos, ${imported.viaturas || 0} viaturas, ${imported.materiais || 0} materiais, ${imported.obras || 0} obras`);
        fetchSummary();
      } else {
        toast.info("Nenhum registo novo importado. Verifique se os códigos já existem no sistema.");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao importar ficheiro");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div data-testid="reports-page" className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText className="h-7 w-7 text-orange-500" />
          Relatórios e Dados
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Exportação e importação de dados do armazém</p>
      </div>

      {/* Summary Preview */}
      {summary && (
        <Card className="mb-8 bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Resumo do Armazém</CardTitle>
            <CardDescription className="text-neutral-400">Dados atuais que serão incluídos nos relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-700/50 p-4 rounded-lg">
                <p className="text-3xl font-black text-white">{summary.equipamentos?.total || 0}</p>
                <p className="text-sm text-neutral-400">Equipamentos</p>
              </div>
              <div className="bg-neutral-700/50 p-4 rounded-lg">
                <p className="text-3xl font-black text-white">{summary.viaturas?.total || 0}</p>
                <p className="text-sm text-neutral-400">Viaturas</p>
              </div>
              <div className="bg-neutral-700/50 p-4 rounded-lg">
                <p className="text-3xl font-black text-white">{summary.materiais?.total || 0}</p>
                <p className="text-sm text-neutral-400">Materiais</p>
              </div>
              <div className="bg-neutral-700/50 p-4 rounded-lg">
                <p className="text-3xl font-black text-white">{summary.obras?.total || 0}</p>
                <p className="text-sm text-neutral-400">Obras</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export/Import Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Export */}
        <Card className="bg-neutral-800 border-neutral-700 hover:border-neutral-600 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-red-500" />
              Relatório PDF
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Exportar resumo em PDF para impressão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-neutral-400 space-y-1 mb-4">
              <li>• Resumo geral do armazém</li>
              <li>• Totais por categoria</li>
              <li>• Ideal para impressão</li>
            </ul>
            <Button 
              onClick={downloadPDF} 
              disabled={downloading.pdf}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              data-testid="export-pdf-btn"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading.pdf ? "A exportar..." : "Exportar PDF"}
            </Button>
          </CardContent>
        </Card>

        {/* Excel Export */}
        <Card className="bg-neutral-800 border-neutral-700 hover:border-neutral-600 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
              Exportar Excel
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Exportar dados completos em Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-neutral-400 space-y-1 mb-4">
              <li>• Folhas separadas por entidade</li>
              <li>• Todos os campos de cada registo</li>
              <li>• Formato .xlsx</li>
            </ul>
            <Button 
              onClick={downloadExcel} 
              disabled={downloading.excel}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              data-testid="export-excel-btn"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading.excel ? "A exportar..." : "Exportar Excel"}
            </Button>
          </CardContent>
        </Card>

        {/* Excel Import */}
        <Card className="bg-neutral-800 border-neutral-700 hover:border-orange-500/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Upload className="h-5 w-5 text-orange-500" />
              Importar Excel
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Importar dados a partir de ficheiro Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-neutral-400 space-y-1 mb-4">
              <li>• Folhas: Equipamentos, Viaturas, Materiais, Obras</li>
              <li>• Registos duplicados são ignorados</li>
              <li>• Formato .xlsx ou .xls</li>
            </ul>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <Button 
              onClick={handleImportClick} 
              disabled={uploading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
              data-testid="import-excel-btn"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "A importar..." : "Importar Excel"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
