import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

import PdfCard from "./PdfCard";
import PdfModal from "./PdfModal";

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

    await uploadFile(file);
    event.target.value = ""; // allow re-upload same file
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

  const fileName = value?.split("/").pop() || "PDF";

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

      {!value ? (
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
      ) : (
        <PdfCard
          fileName={fileName}
          isDark={isDark}
          onPreview={() => setPreviewOpen(true)}
          onRemove={handleRemove}
        />
      )}

      <PdfModal
        open={previewOpen}
        url={getPreviewUrl(value)}
        fileName={fileName}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
