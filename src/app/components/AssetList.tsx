import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Search,
  Filter,
  Monitor,
  Printer,
  Network,
  Server,
  X,
} from "lucide-react";
import { tiposAsset, estadosAsset } from "../data/mockData";
import { Asset, AssetType, AssetStatus } from "../types";
import { supabase } from "../lib/supabaseClient";

export default function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<AssetType | "Todos">("Todos");
  const [filterStatus, setFilterStatus] = useState<AssetStatus | "Todos">(
    "Todos",
  );
  const [filterLevel, setFilterLevel] = useState<string>("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [niveles, setNiveles] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("nombre", { ascending: true });

      if (!isMounted) return;

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] Error cargando activos:", error.message);
        setAssets([]);
      } else {
        setAssets((data as Asset[]) || []);
      }

      const { data: locs, error: locsError } = await supabase
        .from("ubicaciones")
        .select("nombre")
        .order("nombre", { ascending: true });

      if (!locsError && locs) {
        setNiveles(locs.map((l: any) => l.nombre));
      }

      setLoading(false);
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "Todos" || asset.tipo === filterType;
    const matchesStatus = filterStatus === "Todos" || asset.estado === filterStatus;
    const matchesLevel = filterLevel === "Todos" || asset.nivel === filterLevel;

    return matchesSearch && matchesType && matchesStatus && matchesLevel;
  });

  const hasActiveFilters = filterType !== "Todos" || filterStatus !== "Todos" || filterLevel !== "Todos";

  const clearFilters = () => {
    setFilterType("Todos");
    setFilterStatus("Todos");
    setFilterLevel("Todos");
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "PC": return <Monitor className="size-4" />;
      case "Impresora": return <Printer className="size-4" />;
      case "Switch":
      case "Router": return <Network className="size-4" />;
      case "Servidor": return <Server className="size-4" />;
      default: return <Server className="size-4" />;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Equipos IT</h2>
          <p className="text-slate-500 mt-1">
            {loading
              ? "Cargando equipos..."
              : `${filteredAssets.length} ${
                  filteredAssets.length === 1
                    ? "equipo encontrado"
                    : "equipos encontrados"
                }`}
          </p>
        </div>
        <Link
          to="/add-asset"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Agregar Equipo
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, IP, MAC, ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              hasActiveFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter className="size-4" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {[filterType, filterStatus, filterLevel].filter(f => f !== "Todos").length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as AssetType | "Todos")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todos">Todos los tipos</option>
                  {tiposAsset.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as AssetStatus | "Todos")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todos">Todos los estados</option>
                  {estadosAsset.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ubicación Principal</label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todos">Todas las ubicaciones</option>
                  {niveles.map((nivel) => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <X className="size-4" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ubicación Principal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Detalles Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Cargando equipos...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No se encontraron equipos
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/assets/${asset.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600"
                      >
                        {asset.nombre}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600">
                        {getTypeIcon(asset.tipo)}
                        <span>{asset.tipo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {asset.nivel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {asset.ubicacion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-sm">
                      {asset.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(asset.estado)}`}>
                        {asset.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
