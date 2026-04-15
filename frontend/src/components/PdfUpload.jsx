import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function PdfUpload({
  value,
  onChange,
  label = "Carregar PDF",
  isDark = true,
}) {
  const { token } = useAuth();

  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileInputRef = useRef(null);

  // ---------- Handlers ----------

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor selecione um ficheiro PDF.");
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/upload`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onChange(data.url);
      toast.success("PDF carregado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar o PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreviewOpen(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  // ---------- Utils ----------

  const getPreviewUrl = (url) => {
    if (!url) return "";

    let finalUrl = url;

    if (url.startsWith("/api")) {
      finalUrl = `${process.env.REACT_APP_BACKEND_URL}${url}`;
    }

    if (finalUrl.includes("cloudinary.com")) {
      finalUrl = finalUrl.replace(
        "/upload/",
        "/upload/fl_attachment:false/"
      );
    }

    return finalUrl;
  };

  const fileName = value?.split("/").pop();

  // ---------- Render Helpers ----------

  const renderUploadButton = () => (
    <Button
      type="button"
      variant="outline"
      onClick={openFilePicker}
      disabled={uploading}
      className="w-full flex items-center gap-2"
    >
      {uploading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          A carregar...
        </>
      ) : (
        <>
          <Upload className="h-4 w-4" />
          Selecionar PDF
        </>
      )}
    </Button>
  );

  const renderFileInfo = () => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isDark
          ? "bg-neutral-700/50 border-neutral-600"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />

      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className={`flex-1 text-sm truncate text-left hover:underline ${
          isDark ? "text-neutral-200" : "text-gray-700"
        }`}
      >
        {fileName}
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderModal = () => {
    if (!previewOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) closePreview();
        }}
      >
        <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <span className="text-sm font-medium">{fileName}</span>

            <Button variant="ghost" size="sm" onClick={closePreview}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* PDF Viewer */}
          <iframe
            src={getPreviewUrl(value)}
            className="w-full h-full"
            title="PDF Preview"
          />
        </div>
      </div>
    );
  };

  // ---------- Render ----------

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? renderFileInfo() : renderUploadButton()}

      {renderModal()}
    </div>
  );
}
