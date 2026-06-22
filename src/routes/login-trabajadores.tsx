import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogIn, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login-trabajadores")({
  head: () => ({
    meta: [
      { title: "Acceso del equipo · TecnoHelp" },
      { name: "description", content: "Inicio de sesión exclusivo para técnicos y administradores de TecnoHelp." },
    ],
  }),
  component: LoginTrabajadoresPage,
});

type Staff = { id: string; nombre: string; email: string; role: "admin" | "tecnico" };

function LoginTrabajadoresPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "reset">("signin");

  useEffect(() => {
    if (user && isAdmin) navigate({ to: "/admin" });
  }, [user, isAdmin, navigate]);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_staff_list");
      if (error) throw error;
      return (data ?? []) as Staff[];
    },
  });

  return (
    <div className="min-h-dvh flex flex-col bg-secondary">
      <div className="container-page py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline">
          <ArrowLeft className="size-5" /> Volver al inicio
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md bg-card rounded-3xl border border-border p-8 shadow-soft">
          <div className="text-center mb-6">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground mb-3">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="font-display text-2xl font-bold">Acceso del Equipo Técnico</h1>
            <p className="text-base text-muted-foreground mt-1">
              Selecciona tu nombre e ingresa tu contraseña.
            </p>
          </div>

          {mode === "signin" ? (
            <SignInForm staff={staff} loading={isLoading} onForgot={() => setMode("reset")} />
          ) : (
            <ResetForm staff={staff} loading={isLoading} onBack={() => setMode("signin")} />
          )}
        </div>
      </div>
    </div>
  );
}

function SignInForm({ staff, loading, onForgot }: { staff: Staff[]; loading: boolean; onForgot: () => void }) {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const member = staff.find((s) => s.id === staffId);
    if (!member) {
      toast.error("Selecciona tu nombre");
      return;
    }
    if (!password) {
      toast.error("Ingresa tu contraseña");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: member.email,
      password,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Credenciales incorrectas");
      return;
    }
    toast.success(`Bienvenido, ${member.nombre}`);
    navigate({ to: "/admin" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="staff" className="text-base font-semibold">Nombre del trabajador</Label>
        <Select value={staffId} onValueChange={setStaffId}>
          <SelectTrigger id="staff" className="h-12 text-base">
            <SelectValue placeholder={loading ? "Cargando..." : "Selecciona tu nombre"} />
          </SelectTrigger>
          <SelectContent>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-base">
                {s.nombre} · {s.role === "admin" ? "Administrador" : "Técnico"}
              </SelectItem>
            ))}
            {!loading && staff.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">No hay trabajadores registrados.</div>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pw" className="text-base font-semibold">Contraseña</Label>
        <Input
          id="pw"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 text-base"
          required
        />
      </div>
      <Button type="submit" size="xl" className="w-full" disabled={submitting}>
        <LogIn /> {submitting ? "Ingresando…" : "Ingresar"}
      </Button>
      <button
        type="button"
        onClick={onForgot}
        className="w-full text-sm font-semibold text-primary hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  );
}

function ResetForm({ staff, loading, onBack }: { staff: Staff[]; loading: boolean; onBack: () => void }) {
  const [staffId, setStaffId] = useState("");
  const [pin, setPin] = useState("");
  const [newPw, setNewPw] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!staffId) return toast.error("Selecciona tu nombre");
    if (pin !== "TECNOHELP") return toast.error("PIN maestro incorrecto");
    if (newPw.length < 4) return toast.error("Mínimo 4 caracteres");
    setSubmitting(true);
    const { error } = await (supabase as any).rpc("reset_staff_password", {
      p_user_id: staffId,
      p_pin: pin,
      p_new_password: newPw,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contraseña actualizada. Ya puedes ingresar.");
    onBack();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl bg-warning/10 border border-warning/30 p-3 text-sm">
        Ingresa el <strong>PIN Maestro</strong> entregado por el administrador para restablecer tu contraseña.
      </div>
      <div className="space-y-1.5">
        <Label className="text-base font-semibold">Tu nombre</Label>
        <Select value={staffId} onValueChange={setStaffId}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder={loading ? "Cargando..." : "Selecciona tu nombre"} />
          </SelectTrigger>
          <SelectContent>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-base">{s.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pin" className="text-base font-semibold">PIN Maestro</Label>
        <Input id="pin" value={pin} onChange={(e) => setPin(e.target.value)} className="h-12 text-base tracking-widest" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newpw" className="text-base font-semibold">Nueva contraseña</Label>
        <Input id="newpw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="h-12 text-base" minLength={4} required />
      </div>
      <Button type="submit" size="xl" variant="accent" className="w-full" disabled={submitting}>
        <KeyRound /> {submitting ? "Guardando…" : "Restablecer contraseña"}
      </Button>
      <button type="button" onClick={onBack} className="w-full text-sm font-semibold text-primary hover:underline">
        ← Volver al inicio de sesión
      </button>
    </form>
  );
}
