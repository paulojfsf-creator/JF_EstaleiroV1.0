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
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl h-[90vh] bg-white rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b">
          <span className="text-sm">{fileName}</span>

          <Button variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </div>

        <iframe
          src={url}
          className="w-full h-full"
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
