import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Phone, Plus, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/mis-reservas")({
  head: () => ({
    meta: [{ title: "Mis reservas · TecnoHelp" }],
  }),
  component: MisReservasPage,
});

const ESTADO_LABEL: Record<string, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente de confirmación", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
  asignado: { label: "Técnico asignado", cls: "bg-primary-soft text-primary border-primary/30" },
  completado: { label: "Completado", cls: "bg-success/15 text-success border-success/40" },
  cancelado: { label: "Cancelado", cls: "bg-destructive/10 text-destructive border-destructive/40" },
};

function MisReservasPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ["mis-reservas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservas")
        .select("*, servicios(nombre, precio_base)")
        .order("fecha_programada", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function cancelar(id: string) {
    const ok = window.confirm("¿Cancelar esta reserva?");
    if (!ok) return;
    const { error } = await supabase.from("reservas").update({ estado: "cancelado" }).eq("id", id);
    if (error) toast.error("No pudimos cancelar: " + error.message);
    else {
      toast.success("Reserva cancelada");
      qc.invalidateQueries({ queryKey: ["mis-reservas"] });
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1 container-page py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Mis reservas</h1>
            <p className="text-base text-muted-foreground mt-1">Historial y estado de tus visitas técnicas.</p>
          </div>
          <Button asChild size="lg">
            <Link to="/reservar"><Plus /> Nueva reserva</Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="text-lg text-muted-foreground">Cargando…</p>
        ) : reservas.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border p-12 text-center shadow-soft">
            <Calendar className="mx-auto size-16 text-muted-foreground mb-4" strokeWidth={1.5} />
            <h2 className="font-display text-2xl font-bold mb-2">Aún no tienes reservas</h2>
            <p className="text-base text-muted-foreground mb-6">Agenda tu primera visita técnica.</p>
            <Button asChild size="xl"><Link to="/reservar">Agendar ahora</Link></Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservas.map((r) => {
              const est = ESTADO_LABEL[r.estado] ?? ESTADO_LABEL.pendiente;
              return (
                <article key={r.id} className="rounded-2xl bg-card border border-border p-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
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
                    {r.estado === "pendiente" && (
                      <Button variant="outline" onClick={() => cancelar(r.id)}>
                        <X /> Cancelar
                      </Button>
                    )}
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
