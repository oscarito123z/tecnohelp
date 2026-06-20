import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import {
  DISTRITOS_MANAGUA,
  RECARGOS_DISTRITO,
  URGENCIA_RECARGO,
} from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/calculadora")({
  head: () => ({
    meta: [
      { title: "Calculadora de precio · TecnoHelp" },
      { name: "description", content: "Estima cuánto costará tu visita técnica antes de agendar." },
    ],
  }),
  component: CalculadoraPage,
});

function CalculadoraPage() {
  const { data: servicios = [] } = useQuery({
    queryKey: ["servicios-calc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicios")
        .select("id, nombre, precio_base")
        .eq("activo", true)
        .order("nombre");
      if (error) throw error;
      return data;
    },
  });

  const [servicioId, setServicioId] = useState("");
  const [distrito, setDistrito] = useState("");
  const [urgencia, setUrgencia] = useState("normal");

  const servicio = servicios.find((s) => s.id === servicioId);
  const total = useMemo(() => {
    if (!servicio) return null;
    const base = Number(servicio.precio_base);
    const recargoDist = RECARGOS_DISTRITO[distrito] ?? 0;
    const recargoUrg = URGENCIA_RECARGO[urgencia] ?? 0;
    return { base, recargoDist, recargoUrg, total: base + recargoDist + recargoUrg };
  }, [servicio, distrito, urgencia]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1 container-page py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline mb-6">
          <ArrowLeft className="size-5" /> Inicio
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent text-accent-foreground mb-4">
              <Calculator className="size-9" strokeWidth={2.2} />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Calculadora de precio</h1>
            <p className="text-lg text-muted-foreground">
              Estima cuánto pagarás antes de agendar. Sin compromiso.
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_320px] gap-6">
            <div className="rounded-2xl bg-card border border-border p-6 shadow-soft space-y-5">
              <div>
                <Label htmlFor="serv" className="text-base font-semibold mb-1.5 block">Servicio</Label>
                <Select value={servicioId} onValueChange={setServicioId}>
                  <SelectTrigger id="serv" className="h-12 text-base">
                    <SelectValue placeholder="Elige el servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-base">
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dist" className="text-base font-semibold mb-1.5 block">Distrito</Label>
                <Select value={distrito} onValueChange={setDistrito}>
                  <SelectTrigger id="dist" className="h-12 text-base">
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
                <Label className="text-base font-semibold mb-1.5 block">Urgencia</Label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { id: "normal", label: "Esta semana", sub: "Sin recargo" },
                    { id: "24h", label: "En 24h", sub: "+C$100" },
                    { id: "urgente", label: "Hoy", sub: "+C$250" },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgencia(u.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        urgencia === u.id
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <p className="font-bold text-base">{u.label}</p>
                      <p className="text-sm text-muted-foreground">{u.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="rounded-2xl bg-primary text-primary-foreground p-6 shadow-card-hover h-fit">
              <h2 className="font-display text-xl font-bold mb-4">Estimación</h2>
              {total ? (
                <>
                  <Linea label="Tarifa base" value={`C$ ${total.base}`} />
                  {total.recargoDist > 0 && <Linea label="Distancia" value={`+C$ ${total.recargoDist}`} />}
                  {total.recargoUrg > 0 && <Linea label="Urgencia" value={`+C$ ${total.recargoUrg}`} />}
                  <div className="border-t border-primary-foreground/20 mt-4 pt-4">
                    <p className="text-sm opacity-80">Total estimado</p>
                    <p className="font-display text-4xl font-extrabold text-accent">C$ {total.total}</p>
                    <p className="text-xs opacity-80 mt-1">Pago al finalizar la visita</p>
                  </div>
                  <Button asChild size="lg" variant="accent" className="w-full mt-6">
                    <Link to="/reservar">
                      Agendar esta visita <ArrowRight />
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-base opacity-90">
                  Selecciona un servicio para ver tu estimación.
                </p>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Linea({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 text-base border-b border-primary-foreground/15 last:border-0">
      <span className="opacity-80">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
