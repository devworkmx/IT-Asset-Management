import { useState, useEffect } from "react";
import { MapPin, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface Ubicacion {
  id: string;
  nombre: string;
  created_at: string;
}

export default function Ubicaciones() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [assetCounts, setAssetCounts] = useState<Record<string, number>>({});

  const loadUbicaciones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ubicaciones")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("[Supabase] Error cargando ubicaciones:", error.message);
      setUbicaciones([]);
    } else {
      setUbicaciones((data as Ubicacion[]) || []);
    }

    // Load asset counts per ubicacion (nivel field)
    const { data: assets } = await supabase.from("assets").select("nivel");
    if (assets) {
      const counts: Record<string, number> = {};
      assets.forEach((a: { nivel: string }) => {
        counts[a.nivel] = (counts[a.nivel] || 0) + 1;
      });
      setAssetCounts(counts);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUbicaciones();
  }, []);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setSaving(true);
    const { error } = await supabase
      .from("ubicaciones")
      .insert({ nombre: trimmed });

    if (error) {
      console.error("[Supabase] Error creando ubicación:", error.message);
      if (error.code === "23505") {
        alert("Ya existe una ubicación con ese nombre.");
      }
    } else {
      setNewName("");
      setAdding(false);
      await loadUbicaciones();
    }
    setSaving(false);
  };

  const handleEdit = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    setSaving(true);
    const ubicacion = ubicaciones.find((u) => u.id === id);
    const oldName = ubicacion?.nombre;

    const { error } = await supabase
      .from("ubicaciones")
      .update({ nombre: trimmed })
      .eq("id", id);

    if (error) {
      console.error("[Supabase] Error actualizando ubicación:", error.message);
      if (error.code === "23505") {
        alert("Ya existe una ubicación con ese nombre.");
      }
    } else {
      // Update assets that reference the old name
      if (oldName && oldName !== trimmed) {
        await supabase
          .from("assets")
          .update({ nivel: trimmed })
          .eq("nivel", oldName);
      }
      setEditingId(null);
      setEditName("");
      await loadUbicaciones();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const ubicacion = ubicaciones.find((u) => u.id === id);
    if (!ubicacion) return;

    const count = assetCounts[ubicacion.nombre] || 0;
    if (count > 0) {
      alert(
        `No se puede eliminar "${ubicacion.nombre}" porque tiene ${count} equipo(s) asignado(s). Reasigna los equipos antes de eliminar.`,
      );
      setDeleteConfirmId(null);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("ubicaciones")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Supabase] Error eliminando ubicación:", error.message);
    } else {
      setDeleteConfirmId(null);
      await loadUbicaciones();
    }
    setSaving(false);
  };

  const startEdit = (ubicacion: Ubicacion) => {
    setEditingId(ubicacion.id);
    setEditName(ubicacion.nombre);
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Ubicaciones
          </h2>
          <p className="text-slate-500 mt-1">
            {loading
              ? "Cargando ubicaciones..."
              : `${ubicaciones.length} ${ubicaciones.length === 1 ? "ubicación registrada" : "ubicaciones registradas"}`}
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="size-4" />
            Agregar Ubicación
          </button>
        )}
      </div>

      {/* Add Form */}
      {adding && (
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="font-medium text-slate-900 mb-3">Nueva Ubicación</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Nombre de la ubicación"
              autoFocus
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAdd}
              disabled={saving || !newName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <Check className="size-4" />
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setNewName("");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="size-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Ubicaciones List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-slate-500">
            Cargando ubicaciones...
          </div>
        ) : ubicaciones.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            No hay ubicaciones registradas
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {ubicaciones.map((ubicacion) => (
              <div
                key={ubicacion.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                {editingId === ubicacion.id ? (
                  <div className="flex-1 flex gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEdit(ubicacion.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleEdit(ubicacion.id)}
                      disabled={saving || !editName.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      <Check className="size-3.5" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <X className="size-3.5" />
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <MapPin className="size-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {ubicacion.nombre}
                        </p>
                        <p className="text-xs text-slate-500">
                          {assetCounts[ubicacion.nombre] || 0} equipo(s)
                          asignado(s)
                        </p>
                      </div>
                    </div>

                    {deleteConfirmId === ubicacion.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600 mr-2">
                          ¿Eliminar?
                        </span>
                        <button
                          onClick={() => handleDelete(ubicacion.id)}
                          disabled={saving}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                        >
                          Sí, eliminar
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(ubicacion)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(ubicacion.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
