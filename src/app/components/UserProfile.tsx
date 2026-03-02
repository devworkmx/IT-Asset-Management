import { FormEvent, useState } from "react";
import { Navigate } from "react-router";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export default function UserProfile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(
    (user?.user_metadata as { full_name?: string } | null)?.full_name ?? "",
  );
  const [position, setPosition] = useState(
    (user?.user_metadata as { position?: string } | null)?.position ?? "",
  );
  const [phone, setPhone] = useState(
    (user?.user_metadata as { phone?: string } | null)?.phone ?? "",
  );
  const [notes, setNotes] = useState(
    (user?.user_metadata as { notes?: string } | null)?.notes ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        position,
        phone,
        notes,
      },
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Perfil actualizado correctamente.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Perfil de administrador
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Información básica del usuario que se mostrará en el panel y en los
          registros.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Nombre completo
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre y apellidos"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Correo
              </label>
              <Input value={user.email ?? ""} disabled />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Cargo / Rol interno
              </label>
              <Input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej. Responsable de Sistemas"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Teléfono de contacto
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Notas internas
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información relevante sobre el administrador o el área de responsabilidad."
              rows={4}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
              {success}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

