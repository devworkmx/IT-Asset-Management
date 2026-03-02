import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Monitor,
  Printer,
  Network,
  Server,
  Calendar,
  MapPin,
  Activity,
} from "lucide-react";
import { Asset, MaintenanceRecord } from "../types";
import MaintenanceHistory from "./MaintenanceHistory";
import { supabase } from "../lib/supabaseClient";

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      const [{ data: assetData, error: assetError }, { data: historyData }] =
        await Promise.all([
          supabase.from("assets").select("*").eq("id", id).single(),
          supabase
            .from("maintenance_records")
            .select("*")
            .eq("asset_id", id)
            .order("fecha", { ascending: false }),
        ]);

      if (!isMounted) return;

      if (assetError || !assetData) {
        // eslint-disable-next-line no-console
        if (assetError) {
          console.error(
            "[Supabase] Error cargando activo:",
            assetError.message,
          );
        }
        setAsset(null);
      } else {
        setAsset(assetData as Asset);
      }

      setHistory((historyData as MaintenanceRecord[]) || []);
      setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[Supabase] Error eliminando activo:", error.message);
      return;
    }
    navigate("/assets");
  };

  const handleMaintenanceUpdate = (updatedHistory: MaintenanceRecord[]) => {
    setHistory(updatedHistory);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Cargando activo...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Activo no encontrado</p>
      </div>
    );
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "PC": return <Monitor className="size-6" />;
      case "Impresora": return <Printer className="size-6" />;
      case "Switch":
      case "Router": return <Network className="size-6" />;
      case "Servidor": return <Server className="size-6" />;
      default: return <Server className="size-6" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Activo": return "bg-green-100 text-green-700";
      case "Inactivo": return "bg-red-100 text-red-700";
      case "Mantenimiento": return "bg-yellow-100 text-yellow-700";
      case "Fuera de Servicio": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/assets"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="size-5 text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{asset.nombre}</h2>
            <p className="text-slate-500 mt-1">Detalles del activo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/add-asset?edit=${asset.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="size-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="size-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 p-4 rounded-xl">
                {getTypeIcon(asset.tipo)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">{asset.nombre}</h3>
                <span className={`inline-flex mt-2 px-3 py-1 text-sm rounded-full ${getStatusColor(asset.estado)}`}>
                  {asset.estado}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Tipo</p>
                <p className="text-slate-900 mt-1">{asset.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Dirección IP</p>
                <p className="text-slate-900 mt-1 font-mono">{asset.ip}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Dirección MAC</p>
                <p className="text-slate-900 mt-1 font-mono">{asset.mac}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Número de Serie</p>
                <p className="text-slate-900 mt-1">{asset.numeroSerie || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Hardware Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Información de Hardware</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Marca</p>
                <p className="text-slate-900 mt-1">{asset.marca || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Modelo</p>
                <p className="text-slate-900 mt-1">{asset.modelo || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Fecha de Adquisición</p>
                <p className="text-slate-900 mt-1">
                  {asset.fechaAdquisicion
                    ? new Date(asset.fechaAdquisicion).toLocaleDateString("es-ES")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Garantía Hasta</p>
                <p className="text-slate-900 mt-1">
                  {asset.garantiaHasta
                    ? new Date(asset.garantiaHasta).toLocaleDateString("es-ES")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {asset.notas && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">Notas</h3>
              <p className="text-slate-600">{asset.notas}</p>
            </div>
          )}

          {/* Maintenance History */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <MaintenanceHistory
              assetId={asset.id}
              history={history}
              onUpdate={handleMaintenanceUpdate}
            />
          </div>
        </div>

        {/* Right Column - Location & Status */}
        <div className="space-y-6">
          {/* Location Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="size-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Ubicación</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Nivel</p>
                <p className="text-slate-900 mt-1">{asset.nivel}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Ubicación Específica</p>
                <p className="text-slate-900 mt-1">{asset.ubicacion}</p>
              </div>
            </div>
          </div>

          {/* Maintenance Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="size-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Mantenimiento</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Último Mantenimiento</p>
                <p className="text-slate-900 mt-1">
                  {asset.ultimoMantenimiento
                    ? new Date(asset.ultimoMantenimiento).toLocaleDateString("es-ES")
                    : "Sin registros"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="size-5 text-blue-700" />
              <h3 className="font-semibold text-blue-900">Información Adicional</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-blue-800">
                <span className="font-medium">ID:</span> {asset.id}
              </p>
              {asset.fechaAdquisicion && (
                <p className="text-blue-800">
                  <span className="font-medium">Días en servicio:</span>{" "}
                  {Math.floor(
                    (new Date().getTime() - new Date(asset.fechaAdquisicion).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Confirmar Eliminación</h3>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar el activo "{asset.nombre}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}