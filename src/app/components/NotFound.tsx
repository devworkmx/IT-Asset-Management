import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <AlertTriangle className="size-16 text-slate-400" />
      </div>
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Página no encontrada</h2>
      <p className="text-slate-500 mb-6">La página que buscas no existe</p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Volver al Dashboard
      </Link>
    </div>
  );
}
