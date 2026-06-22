import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Phone, ShieldCheck, ArrowLeft, Users, ClipboardList, UserPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Panel Técnico · TecnoHelp" }],
  }),
  component: AdminPage,
});

const ESTADOS = [
  { value: "pendiente", label: "Pendiente", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
  { value: "asignado", label: "Asignado", cls: "bg-primary-soft text-primary border-primary/30" },
  { value: "completado", label: "Completado", cls: "bg-success/15 text-success border-success/40" },
  { value: "cancelado", label: "Cancelado", cls: "bg-destructive/10 text-destructive border-destructive/40" },
] as const;

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.info("Inicia sesión como trabajador");
      navigate({ to: "/login-trabajadores" });
    } else if (!isAdmin) {
      toast.error("Acceso restringido al equipo técnico");
      navigate({ to: "/" });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1 container-page py-10">
          <p className="text-lg text-muted-foreground">Verificando acceso…</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1 container-page py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline mb-4">
          <ArrowLeft className="size-5" /> Inicio
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Panel Técnico</h1>
            <p className="text-base text-muted-foreground">Reservas y gestión del equipo TecnoHelp.</p>
          </div>
        </div>

        <Tabs defaultValue="reservas">
          <TabsList className="h-12 mb-6">
            <TabsTrigger value="reservas" className="text-base gap-2">
              <ClipboardList className="size-4" /> Reservas
            </TabsTrigger>
            <TabsTrigger value="equipo" className="text-base gap-2">
              <Users className="size-4" /> Gestión de Equipo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservas">
            <ReservasTab />
          </TabsContent>
          <TabsContent value="equipo">
            <EquipoTab />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function ReservasTab() {
  const qc = useQueryClient();
  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ["admin-reservas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservas")
        .select("*, servicios(nombre, precio_base)")
        .order("fecha_programada", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function cambiarEstado(id: string, estado: string) {
    const { error } = await supabase
      .from("reservas")
      .update({ estado: estado as never })
      .eq("id", id);
    if (error) toast.error("No se pudo actualizar: " + error.message);
    else {
      toast.success("Estado actualizado");
      qc.invalidateQueries({ queryKey: ["admin-reservas"] });
    }
  }

  const totales = ESTADOS.map((e) => ({
    ...e,
    count: reservas.filter((r) => r.estado === e.value).length,
  }));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {totales.map((t) => (
          <div key={t.value} className={`rounded-2xl border p-4 ${t.cls}`}>
            <p className="text-sm font-semibold opacity-80">{t.label}</p>
            <p className="font-display text-3xl font-bold">{t.count}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <p className="text-lg text-muted-foreground">Cargando reservas…</p>
      ) : reservas.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border p-12 text-center shadow-soft">
          <Calendar className="mx-auto size-16 text-muted-foreground mb-4" strokeWidth={1.5} />
          <h2 className="font-display text-2xl font-bold">Aún no hay reservas en el sistema</h2>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservas.map((r) => {
            const est = ESTADOS.find((e) => e.value === r.estado) ?? ESTADOS[0];
            return (
              <article key={r.id} className="rounded-2xl bg-card border border-border p-6 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="font-display text-xl font-bold">
                      {(r as any).servicios?.nombre ?? "Servicio"}
                    </h2>
                    <p className="text-base text-muted-foreground mt-0.5">
                      {format(parseISO(r.fecha_programada), "EEEE d 'de' MMMM yyyy", { locale: es })} · {r.hora_programada}
                    </p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${est.cls}`}>
                    {est.label}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-base">
                  <p className="flex items-start gap-2">
                    <MapPin className="size-5 text-primary mt-0.5 shrink-0" />
                    <span><strong>{r.distrito}</strong><br />{r.direccion}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-5 text-primary" /> {r.telefono_contacto}
                  </p>
                </div>
                {r.descripcion_problema && (
                  <p className="text-base text-muted-foreground mt-3 border-t border-border pt-3">
                    "{r.descripcion_problema}"
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
                  <p className="font-display text-xl font-bold text-primary">
                    C$ {r.precio_estimado ?? "—"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ESTADOS.filter((e) => e.value !== r.estado).map((e) => (
                      <Button
                        key={e.value}
                        size="sm"
                        variant={e.value === "completado" ? "default" : e.value === "cancelado" ? "destructive" : "outline"}
                        onClick={() => cambiarEstado(r.id, e.value)}
                      >
                        Marcar {e.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

type StaffRow = { id: string; nombre: string; email: string; role: "admin" | "tecnico" };

function EquipoTab() {
  const qc = useQueryClient();
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_staff_list");
      if (error) throw error;
      return (data ?? []) as StaffRow[];
    },
  });

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"tecnico" | "admin">("tecnico");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nombre.trim().length < 2) return toast.error("Ingresa un nombre válido");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Correo no válido");
    if (password.length < 4) return toast.error("La contraseña debe tener al menos 4 caracteres");

    setSubmitting(true);
    const { error } = await (supabase as any).rpc("create_staff_user", {
      p_nombre: nombre.trim(),
      p_email: email.trim().toLowerCase(),
      p_password: password,
      p_role: role,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${nombre} fue agregado al equipo`);
    setNombre(""); setEmail(""); setPassword(""); setRole("tecnico");
    qc.invalidateQueries({ queryKey: ["staff-list"] });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6">
      <section className="rounded-2xl bg-card border border-border p-6 shadow-soft">
        <h2 className="font-display text-xl font-bold mb-4">Equipo registrado</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : staff.length === 0 ? (
          <p className="text-muted-foreground">Aún no hay trabajadores.</p>
        ) : (
          <ul className="divide-y divide-border">
            {staff.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-base">{s.nombre}</p>
                  <p className="text-sm text-muted-foreground">{s.email}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  s.role === "admin"
                    ? "bg-accent/20 text-accent-foreground border-accent/40"
                    : "bg-primary-soft text-primary border-primary/30"
                }`}>
                  {s.role === "admin" ? "Administrador" : "Técnico"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="rounded-2xl bg-card border border-border p-6 shadow-soft h-fit">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="size-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Crear trabajador</h2>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="t-nombre" className="text-base font-semibold">Nombre completo</Label>
            <Input id="t-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-email" className="text-base font-semibold">Correo</Label>
            <Input id="t-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@tecnohelp.ni" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-pass" className="text-base font-semibold">Contraseña inicial</Label>
            <Input id="t-pass" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 4 caracteres" minLength={4} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-base font-semibold">Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "tecnico" | "admin")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            <UserPlus /> {submitting ? "Creando…" : "Agregar al equipo"}
          </Button>
        </form>
      </aside>
    </div>
  );
}
