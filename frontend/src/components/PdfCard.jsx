import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PdfCard({
  fileName,
  isDark,
  onPreview,
  onRemove,
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isDark
          ? "bg-neutral-700/50 border-neutral-600"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <FileText className="h-5 w-5 text-red-500" />

      <button
        onClick={onPreview}
        className="flex-1 text-sm truncate text-left hover:underline"
      >
        {fileName}
      </button>

      <Button variant="ghost" size="icon" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
