import { useState, useRef, useCallback } from "react";
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
  const [progress, setProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // ---------- Upload ----------

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/upload/pdf`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );

      onChange(data.url);
      toast.success("PDF carregado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar PDF");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // ---------- File select ----------

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Apenas PDF permitido");
      return;
    }

    await uploadFile(file);
    e.target.value = "";
  };

  // ---------- Drag & Drop ----------

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Apenas PDF permitido");
      return;
    }

    await uploadFile(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  // ---------- Utils ----------

  const fileName = value?.split("/").pop() || "PDF";

  const getPreviewUrl = (url) => {
    if (!url) return "";

    let finalUrl = url;

    if (finalUrl.includes("cloudinary.com")) {
      finalUrl = finalUrl.replace(
        "/upload/",
        "/upload/fl_attachment:false/"
      );
    }

    return finalUrl;
  };

  // ---------- Actions ----------

  const handleRemove = () => {
    onChange("");
    setPreviewOpen(false);
  };

  const openPicker = () => fileInputRef.current?.click();

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
        <div
          onClick={openPicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300"
          }`}
        >
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="animate-spin mx-auto" />
              <p>{progress}%</p>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-blue-500 h-2 rounded transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="mx-auto mb-2" />
              <p className="text-sm">
                Arrasta um PDF ou clica para selecionar
              </p>
            </>
          )}
        </div>
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
