import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { Asset } from "../types";
import { niveles, tiposAsset, estadosAsset } from "../data/mockData";
import { supabase } from "../lib/supabaseClient";

export default function AddAsset() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [formData, setFormData] = useState<Partial<Asset>>({
    nombre: "",
    tipo: "PC",
    ip: "",
    mac: "",
    nivel: niveles[0],
    ubicacion: "",
    estado: "Activo",
    marca: "",
    modelo: "",
    numeroSerie: "",
    fechaAdquisicion: "",
    garantiaHasta: "",
    notas: "",
    ultimoMantenimiento: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing || !editId) return;

    let isMounted = true;

    const loadAsset = async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("id", editId)
        .single();

      if (!isMounted) return;

      if (error) {
        // eslint-disable-next-line no-console
        console.error(
          "[Supabase] Error cargando activo para edición:",
          error.message,
        );
      } else if (data) {
        setFormData(data as Asset);
      }
    };

    loadAsset();

    return () => {
      isMounted = false;
    };
  }, [isEditing, editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.ip || !formData.mac) return;

    setSaving(true);

    const payload = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      ip: formData.ip,
      mac: formData.mac,
      nivel: formData.nivel,
      ubicacion: formData.ubicacion,
      estado: formData.estado,
      marca: formData.marca || null,
      modelo: formData.modelo || null,
      numeroSerie: formData.numeroSerie || null,
      fechaAdquisicion: formData.fechaAdquisicion || null,
      garantiaHasta: formData.garantiaHasta || null,
      notas: formData.notas || null,
      ultimoMantenimiento: formData.ultimoMantenimiento || null,
    };

    if (isEditing && editId) {
      const { error } = await supabase
        .from("assets")
        .update(payload)
        .eq("id", editId);

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] Error actualizando activo:", error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("assets").insert(payload);
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] Error creando activo:", error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    navigate("/assets");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/assets"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="size-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {isEditing ? "Editar Activo" : "Agregar Nuevo Activo"}
          </h2>
          <p className="text-slate-500 mt-1">
            {isEditing ? "Modifica la información del activo" : "Completa el formulario para agregar un nuevo activo"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Basic Information */}
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del Activo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: PC Capitán"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiposAsset.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dirección IP *
                </label>
                <input
                  type="text"
                  name="ip"
                  value={formData.ip}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="192.168.1.10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dirección MAC *
                </label>
                <input
                  type="text"
                  name="mac"
                  value={formData.mac}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00:1B:44:11:3A:B7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {estadosAsset.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nivel *
                </label>
                <select
                  name="nivel"
                  value={formData.nivel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {niveles.map((nivel) => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ubicación Específica *
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Cabina del Capitán"
                />
              </div>
            </div>
          </div>

          {/* Hardware Details */}
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Detalles de Hardware</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Dell"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: OptiPlex 7090"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Número de Serie
                </label>
                <input
                  type="text"
                  name="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: SN789012345"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Fechas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha de Adquisición
                </label>
                <input
                  type="date"
                  name="fechaAdquisicion"
                  value={formData.fechaAdquisicion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Garantía Hasta
                </label>
                <input
                  type="date"
                  name="garantiaHasta"
                  value={formData.garantiaHasta}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Último Mantenimiento
                </label>
                <input
                  type="date"
                  name="ultimoMantenimiento"
                  value={formData.ultimoMantenimiento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Notas Adicionales</h3>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Información adicional sobre el activo..."
            />
          </div>

          {/* Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <Link
              to="/assets"
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              disabled={saving}
            >
              <Save className="size-4" />
              <span>
                {saving
                  ? "Guardando..."
                  : isEditing
                    ? "Guardar Cambios"
                    : "Agregar Activo"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
