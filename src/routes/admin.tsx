import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Phone, ShieldCheck, ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  const qc = useQueryClient();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.info("Inicia sesión para acceder");
      navigate({ to: "/auth" });
    } else if (!isAdmin) {
      toast.error("Acceso restringido al equipo técnico");
      navigate({ to: "/" });
    }
  }, [loading, user, isAdmin, navigate]);

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ["admin-reservas"],
    enabled: !!user && isAdmin,
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
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1 container-page py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline mb-4">
          <ArrowLeft className="size-5" /> Inicio
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Panel Técnico</h1>
            <p className="text-base text-muted-foreground">Gestión de todas las reservas del sistema.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
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
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
