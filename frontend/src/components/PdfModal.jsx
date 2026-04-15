import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PdfModal({
  open,
  url,
  fileName,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-sm font-medium">{fileName}</span>

          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* PDF Viewer */}
        <iframe
          src={url}
          className="w-full h-full"
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
