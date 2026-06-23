import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
import { DISTRITOS_MANAGUA, HORARIOS } from "@/lib/constants";

export const Route = createFileRoute("/reservar")({
  head: () => ({
    meta: [
      { title: "Agendar visita técnica · TecnoHelp" },
      { name: "description", content: "Elige fecha, hora y distrito. Te confirmamos la visita en menos de 24 horas." },
    ],
  }),
  component: ReservarPage,
});

const reservaSchema = z.object({
  servicio_id: z.string().uuid("Selecciona un servicio"),
  fecha: z.date({ message: "Selecciona una fecha" }),
  hora: z.string().min(1, "Selecciona una hora"),
  distrito: z.string().min(3, "Selecciona tu distrito"),
  direccion: z.string().trim().min(5, "Indica la dirección").max(300),
  telefono: z.string().trim().min(8, "Teléfono de contacto").max(20),
  descripcion: z.string().trim().max(500).optional(),
});

function ReservarPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Inicia sesión para agendar tu visita");
      navigate({ to: "/auth" });
    }
  }, [authLoading, user, navigate]);

  const { data: servicios = [] } = useQuery({
    queryKey: ["servicios-activos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicios")
        .select("id, nombre, precio_base")
        .eq("activo", true)
        .order("precio_base");
      if (error) throw error;
      return data;
    },
  });

  const [servicioId, setServicioId] = useState<string>("");
  const [fecha, setFecha] = useState<Date | undefined>();
  const [hora, setHora] = useState<string>("");
  const [distrito, setDistrito] = useState<string>("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = reservaSchema.safeParse({
      servicio_id: servicioId,
      fecha,
      hora,
      distrito,
      direccion,
      telefono,
      descripcion,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const servicio = servicios.find((s) => s.id === servicioId);
    setSubmitting(true);
    const { error } = await supabase.from("reservas").insert({
      cliente_id: user.id,
      servicio_id: parsed.data.servicio_id,
      fecha_programada: format(parsed.data.fecha, "yyyy-MM-dd"),
      hora_programada: parsed.data.hora,
      distrito: parsed.data.distrito,
      direccion: parsed.data.direccion,
      telefono_contacto: parsed.data.telefono,
      descripcion_problema: parsed.data.descripcion ?? null,
      precio_estimado: servicio?.precio_base ?? null,
      estado: "pendiente",
    });
    setSubmitting(false);
    if (error) {
      toast.error("No pudimos guardar la reserva: " + error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["mis-reservas"] });
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1 container-page py-16">
          <div className="max-w-xl mx-auto text-center rounded-3xl bg-card border border-border p-10 shadow-soft">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-success text-success-foreground mb-6">
              <CheckCircle2 className="size-12" strokeWidth={2.5} />
            </div>
            <h1 className="font-display text-3xl font-bold mb-3">¡Reserva recibida!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Te confirmaremos por WhatsApp en menos de 24 horas. Puedes ver el
              estado de tu visita en "Mis reservas".
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="xl">
                <Link to="/mis-reservas">Ver mis reservas</Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link to="/">Volver al inicio</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1 container-page py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline mb-6">
          <ArrowLeft className="size-5" /> Inicio
        </Link>
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Agendar visita técnica</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Elige el servicio, fecha y hora. Te respondemos en menos de 24 horas.
            </p>

            <form onSubmit={onSubmit} className="space-y-8">
              {/* Servicio */}
              <Section title="1. ¿Qué necesitas?">
                <Label htmlFor="servicio" className="text-base font-semibold">Servicio</Label>
                <Select value={servicioId} onValueChange={setServicioId}>
                  <SelectTrigger id="servicio" className="h-12 text-base">
                    <SelectValue placeholder="Elige un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-base">
                        {s.nombre} — desde C$ {s.precio_base}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Section>

              {/* Fecha y hora */}
              <Section title="2. ¿Cuándo te visitamos?">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Fecha</Label>
                    <div className="rounded-xl border border-border p-2 bg-card">
                      <Calendar
                        mode="single"
                        selected={fecha}
                        onSelect={setFecha}
                        locale={es}
                        disabled={(d) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return d < today || d.getDay() === 0;
                        }}
                        className="pointer-events-auto"
                      />
                    </div>
                    {fecha && (
                      <p className="mt-2 text-sm text-primary font-semibold">
                        {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="hora" className="text-base font-semibold mb-2 block">Hora</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {HORARIOS.map((h) => (
                        <button
                          type="button"
                          key={h}
                          onClick={() => setHora(h)}
                          className={`h-12 rounded-lg border-2 font-semibold text-sm transition-all ${
                            hora === h
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              {/* Ubicación */}
              <Section title="3. ¿A dónde llegamos?">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="distrito" className="text-base font-semibold">Distrito</Label>
                    <Select value={distrito} onValueChange={setDistrito}>
                      <SelectTrigger id="distrito" className="h-12 text-base">
                        <SelectValue placeholder="Selecciona tu distrito" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISTRITOS_MANAGUA.map((d) => (
                          <SelectItem key={d} value={d} className="text-base">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="direccion" className="text-base font-semibold">Dirección exacta y referencia</Label>
                    <Textarea
                      id="direccion"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Ej: De la Iglesia X, 2 cuadras al sur, casa portón verde"
                      className="text-base min-h-24"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono" className="text-base font-semibold">Teléfono de contacto</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      inputMode="tel"
                      placeholder="8888-8888"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>
              </Section>

              {/* Descripción */}
              <Section title="4. Cuéntanos más (opcional)">
                <Label htmlFor="desc" className="text-base font-semibold">¿Qué problema tiene tu equipo?</Label>
                <Textarea
                  id="desc"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: La laptop está muy lenta y a veces se apaga sola"
                  className="text-base min-h-28"
                  maxLength={500}
                />
              </Section>

              <Button type="submit" size="xl" className="w-full" disabled={submitting}>
                <CalendarIcon /> {submitting ? "Guardando…" : "Confirmar reserva"}
              </Button>
            </form>
          </div>

          {/* Resumen */}
          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="rounded-2xl bg-primary text-primary-foreground p-6 shadow-card-hover">
              <h2 className="font-display text-xl font-bold mb-4">Tu reserva</h2>
              <ResumenItem label="Servicio" value={servicios.find((s) => s.id === servicioId)?.nombre ?? "—"} />
              <ResumenItem label="Fecha" value={fecha ? format(fecha, "PPP", { locale: es }) : "—"} />
              <ResumenItem label="Hora" value={hora || "—"} />
              <ResumenItem label="Distrito" value={distrito || "—"} />
              <div className="mt-4 pt-4 border-t border-primary-foreground/20">
                <p className="text-sm opacity-80">Precio estimado</p>
                <p className="font-display text-3xl font-bold text-accent">
                  C$ {servicios.find((s) => s.id === servicioId)?.precio_base ?? "—"}
                </p>
                <p className="text-xs opacity-80 mt-1">Pago al finalizar la visita</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
      <h2 className="font-display text-xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ResumenItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-2 text-base border-b border-primary-foreground/15 last:border-0">
      <span className="opacity-80">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}
