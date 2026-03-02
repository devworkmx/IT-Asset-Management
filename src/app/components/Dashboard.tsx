import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Monitor,
  Printer,
  Network,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart";
import { niveles } from "../data/mockData";
import { Asset } from "../types";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const statusChartConfig = {
  activos: {
    label: "Activos",
    color: "hsl(142 76% 36%)",
  },
  mantenimiento: {
    label: "Mantenimiento",
    color: "hsl(45 93% 47%)",
  },
  inactivos: {
    label: "Inactivos",
    color: "hsl(0 84% 60%)",
  },
} satisfies ChartConfig;

const typeChartConfig = {
  PC: {
    label: "PC",
    color: "hsl(221 83% 53%)",
  },
  Impresora: {
    label: "Impresoras",
    color: "hsl(262 83% 58%)",
  },
  Switch: {
    label: "Switch",
    color: "hsl(199 89% 48%)",
  },
  Router: {
    label: "Router",
    color: "hsl(199 89% 48%)",
  },
  Servidor: {
    label: "Servidores",
    color: "hsl(25 95% 53%)",
  },
  Otro: {
    label: "Otros",
    color: "hsl(215 25% 70%)",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("fechaAdquisicion", { ascending: false });

      if (!isMounted) return;

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] Error cargando activos:", error.message);
        setAssets([]);
      } else {
        setAssets((data as Asset[]) || []);
      }
      setLoading(false);
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalAssets = assets.length;
  const activeAssets = assets.filter((a) => a.estado === "Activo").length;
  const inactiveAssets = assets.filter((a) => a.estado === "Inactivo").length;
  const maintenanceAssets = assets.filter(
    (a) => a.estado === "Mantenimiento",
  ).length;

  const assetsByType = {
    PC: assets.filter((a) => a.tipo === "PC").length,
    Impresora: assets.filter((a) => a.tipo === "Impresora").length,
    Switch: assets.filter((a) => a.tipo === "Switch").length,
    Router: assets.filter((a) => a.tipo === "Router").length,
    Servidor: assets.filter((a) => a.tipo === "Servidor").length,
    Otro: assets.filter((a) => a.tipo === "Otro").length,
  };

  const assetsByLevel = niveles.map((nivel) => ({
    nivel,
    count: assets.filter((a) => a.nivel === nivel).length,
  }));

  const recentAssets = assets
    .slice()
    .sort((a, b) => {
      const dateA = a.fechaAdquisicion
        ? new Date(a.fechaAdquisicion).getTime()
        : 0;
      const dateB = b.fechaAdquisicion
        ? new Date(b.fechaAdquisicion).getTime()
        : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "PC":
        return <Monitor className="size-4" />;
      case "Impresora":
        return <Printer className="size-4" />;
      case "Switch":
      case "Router":
        return <Network className="size-4" />;
      case "Servidor":
        return <Server className="size-4" />;
      default:
        return <Server className="size-4" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "bg-green-100 text-green-700";
      case "Inactivo":
        return "bg-red-100 text-red-700";
      case "Mantenimiento":
        return "bg-yellow-100 text-yellow-700";
      case "Fuera de Servicio":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const statusChartData = [
    { key: "activos", name: "Activos", value: activeAssets },
    { key: "mantenimiento", name: "Mantenimiento", value: maintenanceAssets },
    { key: "inactivos", name: "Inactivos", value: inactiveAssets },
  ].filter((item) => item.value > 0);

  const typeChartData = Object.entries(assetsByType).map(([tipo, count]) => ({
    tipo,
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Hero principal moderno */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-600 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,#ffffff,transparent_55%),radial-gradient(circle_at_bottom_right,#0ea5e9,transparent_55%)]" />
        <div className="relative px-6 py-6 sm:px-8 sm:py-7 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              Panel de administración
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Hola,{" "}
              <span className="font-bold">
                {user?.user_metadata?.full_name || "Administrador"}
              </span>
            </h2>
            <p className="text-sm sm:text-base text-sky-100/90">
              Tienes una visión global del estado de todos los activos IT de la
              organización: salud, incidencias y capacidad, todo en un solo
              lugar.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/assets"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium hover:bg-white/20 transition-colors"
              >
                Ver inventario completo
              </Link>
              <Link
                to="/add-asset"
                className="inline-flex items-center gap-2 rounded-full bg-white text-xs font-semibold text-sky-700 px-4 py-1.5 hover:bg-slate-50 transition-colors"
              >
                + Registrar nuevo activo
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[220px]">
            {user && (
              <div className="flex items-center gap-3 rounded-2xl bg-black/10 px-4 py-3 backdrop-blur">
                <div className="h-10 w-10 rounded-full bg-white/90 text-sky-700 flex items-center justify-center text-sm font-semibold">
                  {user.email?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user.user_metadata?.full_name || "Administrador"}
                  </p>
                  <p className="text-[11px] text-sky-100/80 truncate">
                    {user.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide text-sky-100/70">
                    Rol
                  </p>
                  <p className="text-[11px] font-semibold">Admin</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-xl bg-black/10 px-3 py-2 backdrop-blur">
                <p className="text-sky-100/80">Activos</p>
                <p className="mt-1 text-lg font-semibold">{totalAssets}</p>
              </div>
              <div className="rounded-xl bg-black/10 px-3 py-2 backdrop-blur">
                <p className="text-emerald-100/90">Operativos</p>
                <p className="mt-1 text-lg font-semibold text-emerald-200">
                  {activeAssets}
                </p>
              </div>
              <div className="rounded-xl bg-black/10 px-3 py-2 backdrop-blur">
                <p className="text-amber-100/90">En mant.</p>
                <p className="mt-1 text-lg font-semibold text-amber-200">
                  {maintenanceAssets}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Total activos
              </p>
              <p className="text-3xl font-semibold text-slate-900 mt-1">
                {loading ? "…" : totalAssets}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Server className="size-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Activos
              </p>
              <p className="text-3xl font-semibold text-emerald-600 mt-1">
                {loading ? "…" : activeAssets}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <CheckCircle className="size-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Mantenimiento
              </p>
              <p className="text-3xl font-semibold text-amber-600 mt-1">
                {loading ? "…" : maintenanceAssets}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <Wrench className="size-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">
                Inactivos
              </p>
              <p className="text-3xl font-semibold text-rose-600 mt-1">
                {loading ? "…" : inactiveAssets}
              </p>
            </div>
            <div className="bg-rose-50 p-3 rounded-lg">
              <AlertTriangle className="size-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets by Type - Bar chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Activos por Tipo
              </h3>
              <p className="text-sm text-slate-500">
                Distribución por categoría de activo
              </p>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg">
              <Activity className="size-5 text-slate-600" />
            </div>
          </div>

          <ChartContainer config={typeChartConfig}>
            <BarChart data={typeChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="tipo"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(210 40% 96%)" }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Assets by Status - Pie chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Estado de Activos
              </h3>
              <p className="text-sm text-slate-500">
                Porcentaje por estado operativo
              </p>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg">
              <Activity className="size-5 text-slate-600" />
            </div>
          </div>

          <ChartContainer config={statusChartConfig}>
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={statusChartData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {statusChartData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={`var(--color-${entry.key})`}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {statusChartData.map((entry) => (
              <div
                key={entry.key}
                className="inline-flex items-center gap-2 text-slate-600"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: `var(--color-${entry.key})`,
                  }}
                />
                <span>{entry.name}</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {totalAssets
                    ? `${Math.round((entry.value / totalAssets) * 100)}%`
                    : "0%"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assets by Level */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">
          Activos por Nivel
        </h3>
        <div className="space-y-3">
          {assetsByLevel.map(({ nivel, count }) => (
            <div key={nivel} className="flex items-center justify-between">
              <span className="text-slate-700">{nivel}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width:
                        totalAssets > 0
                          ? `${(count / totalAssets) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="font-semibold text-slate-900 w-6 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assets */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Activos Recientes</h3>
            <Link
              to="/assets"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Ver todos
            </Link>
          </div>
        </div>
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
                  Nivel
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
              {recentAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/assets/${asset.id}`}
                      className="text-slate-900 hover:text-blue-600"
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
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-sm">
                    {asset.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(
                        asset.estado,
                      )}`}
                    >
                      {asset.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
