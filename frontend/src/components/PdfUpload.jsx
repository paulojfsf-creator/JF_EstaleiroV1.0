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

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor selecione um ficheiro PDF.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onChange(response.data.url);
      toast.success("PDF carregado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar o PDF.");
    } finally {
      setUploading(false);
    }
  };

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

  const handleRemove = () => {
    onChange("");
    setPreviewOpen(false);
  };

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

      {!value ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
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
      ) : (
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
            {value.split("/").pop()}
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
      )}

      {/* MODAL PREVIEW */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewOpen(false);
            }
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
}
