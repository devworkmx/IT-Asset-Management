import { useState } from "react";
import { Plus, Wrench, Calendar, User, FileText, X } from "lucide-react";
import { MaintenanceRecord, MaintenanceType } from "../types";
import { supabase } from "../lib/supabaseClient";

interface MaintenanceHistoryProps {
  assetId: string;
  history: MaintenanceRecord[];
  onUpdate: (history: MaintenanceRecord[]) => void;
}

export default function MaintenanceHistory({
  assetId,
  history,
  onUpdate,
}: MaintenanceHistoryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tipo: "Preventivo" as MaintenanceType,
    problema: "",
    solucion: "",
    tecnico: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId) return;

    setSaving(true);

    const { data, error } = await supabase
      .from("maintenance_records")
      .insert({
        asset_id: assetId,
        fecha: formData.fecha,
        tipo: formData.tipo,
        problema: formData.problema,
        solucion: formData.solucion,
        tecnico: formData.tecnico,
      })
      .select("*")
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error(
        "[Supabase] Error creando registro de mantenimiento:",
        error.message,
      );
      setSaving(false);
      return;
    }

    // Actualizar fecha de último mantenimiento del activo
    await supabase
      .from("assets")
      .update({ ultimoMantenimiento: formData.fecha })
      .eq("id", assetId);

    const newRecord = data as MaintenanceRecord;
    const updatedHistory = [newRecord, ...(history || [])];
    onUpdate(updatedHistory);

    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      tipo: "Preventivo",
      problema: "",
      solucion: "",
      tecnico: "",
    });
    setShowAddForm(false);
    setSaving(false);
  };

  const handleDelete = async (recordId: string) => {
    const { error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", recordId);

    if (error) {
      // eslint-disable-next-line no-console
      console.error(
        "[Supabase] Error eliminando registro de mantenimiento:",
        error.message,
      );
      return;
    }

    const updatedHistory = history.filter((h) => h.id !== recordId);
    onUpdate(updatedHistory);
  };

  const sortedHistory = [...(history || [])].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="size-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Historial de Mantenimiento</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="size-4" />
          <span>Agregar Registro</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Mantenimiento *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as MaintenanceType })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción del Problema *
                </label>
                <textarea
                  value={formData.problema}
                  onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el problema o motivo del mantenimiento..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Solución Aplicada *
                </label>
                <textarea
                  value={formData.solucion}
                  onChange={(e) => setFormData({ ...formData, solucion: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe la solución o acciones realizadas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Técnico Responsable *
                </label>
                <input
                  type="text"
                  value={formData.tecnico}
                  onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del técnico"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar Registro"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History List */}
      <div className="space-y-3">
        {sortedHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No hay registros de mantenimiento
          </div>
        ) : (
          sortedHistory.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    record.tipo === "Preventivo" 
                      ? "bg-green-100" 
                      : "bg-orange-100"
                  }`}>
                    <Wrench className={`size-4 ${
                      record.tipo === "Preventivo"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        record.tipo === "Preventivo"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {record.tipo}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(record.fecha).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                      <User className="size-3" />
                      {record.tecnico}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <FileText className="size-3" />
                    Problema:
                  </p>
                  <p className="text-sm text-slate-900">{record.problema}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <FileText className="size-3" />
                    Solución:
                  </p>
                  <p className="text-sm text-slate-900">{record.solucion}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
