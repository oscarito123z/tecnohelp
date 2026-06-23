import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogIn, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function LoginTrabajadoresPage() {
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isStaff) navigate({ to: "/admin" });
  }, [user, isStaff, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Ingresa tu correo y contraseña");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Credenciales incorrectas");
      return;
    }
    toast.success("Bienvenido");
    navigate({ to: "/admin" });
  }

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
              Ingresa con tu correo y contraseña de trabajador.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-base font-semibold">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@tecnohelp.ni"
                className="h-12 text-base"
                required
              />
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
            <p className="text-sm text-muted-foreground text-center pt-2">
              ¿Olvidaste tu contraseña? Pídele al administrador que la restablezca desde el panel.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
