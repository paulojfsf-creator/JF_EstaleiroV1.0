import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CONFIG = {
  equipamento: {
    endpoint: "equipamentos",
    title: "Equipamento",
    fields: [
      { name: "codigo", label: "Código" },
      { name: "descricao", label: "Descrição" },
      { name: "marca", label: "Marca" },
      { name: "modelo", label: "Modelo" },
    ],
  },
  viatura: {
    endpoint: "viaturas",
    title: "Viatura",
    fields: [
      { name: "matricula", label: "Matrícula" },
      { name: "marca", label: "Marca" },
      { name: "modelo", label: "Modelo" },
      { name: "combustivel", label: "Combustível" },
    ],
  },
  material: {
    endpoint: "materiais",
    title: "Material",
    fields: [
      { name: "codigo", label: "Código" },
      { name: "descricao", label: "Descrição" },
      { name: "unidade", label: "Unidade" },
      { name: "stock_minimo", label: "Stock Mínimo", type: "number" },
    ],
  },
};

export default function ResourceForm({
  type,
  initialData,
  onClose,
  onSuccess,
}) {
  const { token } = useAuth();
  const config = CONFIG[type];

  const [form, setForm] = useState(() => {
    const obj = {};
    config.fields.forEach((f) => {
      obj[f.name] = initialData?.[f.name] ?? "";
    });
    return obj;
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const url = `${process.env.REACT_APP_BACKEND_URL}/${config.endpoint}${
        initialData ? `/${initialData.id}` : ""
      }`;

      const method = initialData ? "put" : "post";

      const { data } = await axios[method](url, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(
        `${config.title} ${
          initialData ? "atualizado" : "criado"
        } com sucesso`
      );

      onSuccess?.(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-lg space-y-4">
        <h2 className="font-semibold text-lg">
          {initialData ? "Editar" : "Novo"} {config.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {config.fields.map((field) => (
            <input
              key={field.name}
              type={field.type || "text"}
              placeholder={field.label}
              value={form[field.name]}
              onChange={(e) =>
                handleChange(field.name, e.target.value)
              }
              className="w-full border p-2 rounded"
            />
          ))}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
