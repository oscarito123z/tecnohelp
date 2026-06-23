import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · TecnoHelp" },
      { name: "description", content: "Accede a tu cuenta de TecnoHelp para gestionar tus citas." },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre").max(80),
  email: z.string().trim().email("Correo no válido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
  telefono: z.string().trim().min(8, "Teléfono no válido").max(20),
});

const signInSchema = z.object({
  email: z.string().trim().email("Correo no válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/reservar" });
  }, [user, navigate]);

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
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground font-display text-2xl font-bold mb-3">
              T
            </div>
            <h1 className="font-display text-2xl font-bold">Bienvenido a TecnoHelp</h1>
            <p className="text-base text-muted-foreground mt-1">
              Gestiona tus citas y pre-diagnósticos.
            </p>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 mb-6 h-12">
              <TabsTrigger value="signin" className="text-base">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup" className="text-base">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signInSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) toast.error("No pudimos iniciar sesión: " + error.message);
    else toast.success("¡Bienvenido de vuelta!");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="si-email" label="Correo electrónico">
        <Input
          id="si-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </Field>
      <Field id="si-pass" label="Contraseña">
        <Input
          id="si-pass"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </Field>
      <Button type="submit" size="xl" className="w-full" disabled={loading}>
        <LogIn /> {loading ? "Ingresando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", password: "", telefono: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/reservar`,
        data: { nombre: parsed.data.nombre, telefono: parsed.data.telefono },
      },
    });
    setLoading(false);
    if (error) toast.error("No pudimos crear tu cuenta: " + error.message);
    else toast.success("¡Cuenta creada! Ya puedes agendar citas.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="su-nombre" label="Nombre completo">
        <Input
          id="su-nombre"
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
      </Field>
      <Field id="su-tel" label="Teléfono / WhatsApp">
        <Input
          id="su-tel"
          type="tel"
          inputMode="tel"
          placeholder="8888-8888"
          required
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />
      </Field>
      <Field id="su-email" label="Correo electrónico">
        <Input
          id="su-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </Field>
      <Field id="su-pass" label="Contraseña (mínimo 6 caracteres)">
        <Input
          id="su-pass"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </Field>
      <Button type="submit" size="xl" variant="accent" className="w-full" disabled={loading}>
        <UserPlus /> {loading ? "Creando…" : "Crear cuenta"}
      </Button>
    </form>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-base font-semibold">{label}</Label>
      {children}
    </div>
  );
}
