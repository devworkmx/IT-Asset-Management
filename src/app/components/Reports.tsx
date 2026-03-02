import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { Asset } from "../types";
import { supabase } from "../lib/supabaseClient";

export default function Reports() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("area");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [loading, setLoading] = useState(true);
  const [niveles, setNiveles] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("nivel", { ascending: true });

      if (!isMounted) return;

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] Error cargando activos (reportes):", error.message);
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

  // Data calculations
  const assetsByArea = niveles.map(nivel => ({
    name: nivel,
    cantidad: assets.filter(a => a.nivel === nivel).length,
  }));

  const assetsByStatus = [
    { name: "Activo", value: assets.filter(a => a.estado === "Activo").length, color: "#10b981" },
    { name: "Inactivo", value: assets.filter(a => a.estado === "Inactivo").length, color: "#ef4444" },
    { name: "Mantenimiento", value: assets.filter(a => a.estado === "Mantenimiento").length, color: "#f59e0b" },
    { name: "Fuera de Servicio", value: assets.filter(a => a.estado === "Fuera de Servicio").length, color: "#6b7280" },
  ];

  const decommissionedAssets = assets.filter(a => {
    if (a.estado === "Fuera de Servicio" && a.ultimoMantenimiento) {
      const year = new Date(a.ultimoMantenimiento).getFullYear();
      return year === selectedYear;
    }
    return false;
  });

  const assetsByType = [
    { name: "PC", value: assets.filter(a => a.tipo === "PC").length, color: "#3b82f6" },
    { name: "Impresora", value: assets.filter(a => a.tipo === "Impresora").length, color: "#8b5cf6" },
    { name: "Switch", value: assets.filter(a => a.tipo === "Switch").length, color: "#06b6d4" },
    { name: "Router", value: assets.filter(a => a.tipo === "Router").length, color: "#14b8a6" },
    { name: "Servidor", value: assets.filter(a => a.tipo === "Servidor").length, color: "#f59e0b" },
    { name: "Otro", value: assets.filter(a => a.tipo === "Otro").length, color: "#6b7280" },
  ];

  // Export functions
  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportFullInventory = () => {
    const exportData = assets.map(asset => ({
      ID: asset.id,
      Nombre: asset.nombre,
      Tipo: asset.tipo,
      IP: asset.ip,
      MAC: asset.mac,
      Nivel: asset.nivel,
      Ubicación: asset.ubicacion,
      Estado: asset.estado,
      Marca: asset.marca || "",
      Modelo: asset.modelo || "",
      "Número de Serie": asset.numeroSerie || "",
      "Fecha de Adquisición": asset.fechaAdquisicion || "",
      "Garantía Hasta": asset.garantiaHasta || "",
      "Último Mantenimiento": asset.ultimoMantenimiento || "",
      Notas: asset.notas || "",
    }));
    exportToExcel(exportData, "inventario_completo");
  };

  const exportByArea = () => {
    const exportData = assetsByArea.map(item => ({
      Área: item.name,
      Cantidad: item.cantidad,
    }));
    exportToExcel(exportData, "equipos_por_area");
  };

  const exportByStatus = () => {
    const exportData = assetsByStatus.map(item => ({
      Estado: item.name,
      Cantidad: item.value,
    }));
    exportToExcel(exportData, "equipos_por_estado");
  };

  const exportDecommissioned = () => {
    const exportData = decommissionedAssets.map(asset => ({
      ID: asset.id,
      Nombre: asset.nombre,
      Tipo: asset.tipo,
      Nivel: asset.nivel,
      Ubicación: asset.ubicacion,
      "Fecha de Baja": asset.ultimoMantenimiento || "",
      Notas: asset.notas || "",
    }));
    exportToExcel(exportData, `equipos_dados_baja_${selectedYear}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
          <h2 className="text-2xl font-semibold text-slate-900">Reportes</h2>
          <p className="text-slate-500 mt-1">
            {loading
              ? "Cargando datos de equipos..."
              : "Análisis y exportación de datos de equipos"}
          </p>
      </div>

      {/* Quick Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={exportFullInventory}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FileText className="size-6 text-blue-600" />
            </div>
            <Download className="size-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Inventario Completo</h3>
          <p className="text-sm text-slate-500">Exportar todos los equipos</p>
        </button>

        <button
          onClick={exportByArea}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <BarChart3 className="size-6 text-green-600" />
            </div>
            <Download className="size-5 text-slate-400 group-hover:text-green-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Por Área</h3>
          <p className="text-sm text-slate-500">Equipos por ubicación</p>
        </button>

        <button
          onClick={exportByStatus}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
              <PieChart className="size-6 text-purple-600" />
            </div>
            <Download className="size-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Por Estado</h3>
          <p className="text-sm text-slate-500">Resumen de estados</p>
        </button>

        <button
          onClick={exportDecommissioned}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
              <TrendingUp className="size-6 text-orange-600" />
            </div>
            <Download className="size-5 text-slate-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Dados de Baja</h3>
          <p className="text-sm text-slate-500">Equipos retirados {selectedYear}</p>
        </button>
      </div>

      {/* Report Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="size-5 text-slate-600" />
            <span className="font-medium text-slate-900">Visualizar:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedReport("area")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedReport === "area"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Por Área
            </button>
            <button
              onClick={() => setSelectedReport("status")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedReport === "status"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Por Estado
            </button>
            <button
              onClick={() => setSelectedReport("type")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedReport === "type"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Por Tipo
            </button>
            <button
              onClick={() => setSelectedReport("decommissioned")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedReport === "decommissioned"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Dados de Baja
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        {selectedReport === "area" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
            <h3 className="font-semibold text-slate-900 mb-6">Equipos por Área/Ubicación</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetsByArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#3b82f6" name="Cantidad de Equipos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie Chart - Status */}
        {selectedReport === "status" && (
          <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-6">Equipos por Estado</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={assetsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Detalle por Estado</h3>
              <div className="space-y-3">
                {assetsByStatus.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pie Chart - Type */}
        {selectedReport === "type" && (
          <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-6">Equipos por Tipo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={assetsByType.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Detalle por Tipo</h3>
              <div className="space-y-3">
                {assetsByType.filter(item => item.value > 0).map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Decommissioned Assets */}
        {selectedReport === "decommissioned" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">Equipos Dados de Baja</h3>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
            </div>
            {decommissionedAssets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No hay equipos dados de baja en {selectedYear}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nivel</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ubicación</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha Baja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {decommissionedAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="px-4 py-3 text-slate-900">{asset.nombre}</td>
                        <td className="px-4 py-3 text-slate-600">{asset.tipo}</td>
                        <td className="px-4 py-3 text-slate-600">{asset.nivel}</td>
                        <td className="px-4 py-3 text-slate-600">{asset.ubicacion}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {asset.ultimoMantenimiento
                            ? new Date(asset.ultimoMantenimiento).toLocaleDateString("es-ES")
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-4">Resumen Estadístico</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-blue-700">Total Equipos</p>
            <p className="text-2xl font-bold text-blue-900">
              {loading ? "…" : assets.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Equipos Activos</p>
            <p className="text-2xl font-bold text-green-700">
              {loading
                ? "…"
                : assets.filter((a) => a.estado === "Activo").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700">En Mantenimiento</p>
            <p className="text-2xl font-bold text-yellow-700">
              {loading
                ? "…"
                : assets.filter((a) => a.estado === "Mantenimiento").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Áreas Cubiertas</p>
            <p className="text-2xl font-bold text-blue-900">{niveles.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
