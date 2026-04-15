import { useState, useRef } from "react";
import { useAuth, API } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
const [previewOpen, setPreviewOpen] = useState(false);

export default function PdfUpload({ value, onChange, label = "Carregar PDF", isDark = true }) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Apenas ficheiros PDF são permitidos");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ficheiro demasiado grande (máx. 10MB)");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/upload/pdf`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      onChange(response.data.url);
      toast.success("PDF carregado com sucesso");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao carregar PDF");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const getPreviewUrl = (url) => {
  if (!url) return "";

  let finalUrl = url;

  if (url.startsWith("/api")) {
    finalUrl = `${process.env.REACT_APP_BACKEND_URL}${url}`;
  }

  if (finalUrl.includes("cloudinary.com")) {
    finalUrl = finalUrl.replace("/upload/", "/upload/fl_attachment:false/");
  }

  return finalUrl;
};

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,application/pdf"
        className="hidden"
      />

      {value ? (
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-neutral-700/50 border-neutral-600' : 'bg-gray-50 border-gray-200'}`}>
          <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
         <button
  type="button"
  onClick={() => setPreviewOpen(true)}
  className={`flex-1 text-sm truncate text-left hover:underline ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}
>
  {value.split("/").pop()}
</button>
            {value.split("/").pop()}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`w-full justify-start ${isDark ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              A carregar...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {label}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
{previewOpen && (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
    
    <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-sm font-medium">
          {value?.split("/").pop()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPreviewOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* PDF Viewer */}
      <iframe
        src={getPreviewUrl(value)}
        className="w-full h-full"
        title="PDF Preview"
      />
      return (
  <div className="space-y-2">

    {/* ... resto do código */}

    {previewOpen && (
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) setPreviewOpen(false);
        }}
      >
        <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <span className="text-sm font-medium">
              {value?.split("/").pop()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* PDF */}
          <iframe
            src={getPreviewUrl(value)}
            className="w-full h-full"
            title="PDF Preview"
          />
        </div>
      </div>
    )}

  </div>
);

      
    </div>
  </div>
)}
