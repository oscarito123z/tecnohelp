import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { DISTRITOS_MANAGUA, whatsappLink } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Pre-diagnóstico · TecnoHelp" },
      { name: "description", content: "Cuéntanos qué le pasa a tu equipo para enviar al técnico mejor preparado." },
    ],
  }),
  component: DiagnosticoPage,
});

const TIPOS_EQUIPO = [
  { id: "laptop", label: "💻 Laptop" },
  { id: "escritorio", label: "🖥️ Computadora de escritorio" },
  { id: "impresora", label: "🖨️ Impresora" },
  { id: "wifi", label: "📡 Internet / WiFi" },
  { id: "celular", label: "📱 Celular o tableta" },
  { id: "otro", label: "❓ Otro" },
];

const SINTOMAS: Record<string, string[]> = {
  laptop: ["No enciende", "Muy lenta", "Pantalla negra", "No carga la batería", "Hace ruidos extraños", "Virus o pop-ups", "No conecta a internet"],
  escritorio: ["No enciende", "Muy lenta", "Pantalla en blanco", "Hace ruido", "Se reinicia sola", "Virus", "Quiero formatearla"],
  impresora: ["No imprime", "Atasco de papel", "Tinta o tóner", "Inalámbrica sin conexión", "Configurar nueva"],
  wifi: ["Internet lento", "Se desconecta", "Configurar router nuevo", "No tengo señal en una habitación"],
  celular: ["Configurar correo", "Configurar WhatsApp", "Pasar contactos", "Liberar espacio", "Clase de uso básico"],
  otro: ["Necesito asesoría general"],
};

const URGENCIA = [
  { id: "normal", label: "📅 Esta semana está bien" },
  { id: "24h", label: "⏰ Lo antes posible (24h)" },
  { id: "urgente", label: "🚨 Urgente, lo necesito hoy" },
];

function DiagnosticoPage() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [equipo, setEquipo] = useState("");
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [distrito, setDistrito] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [detalles, setDetalles] = useState("");

  const total = 5;
  const progreso = (paso / total) * 100;

  function toggleSintoma(s: string) {
    setSintomas((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function continuarReserva() {
    navigate({ to: "/reservar" });
  }

  function enviarWhatsApp() {
    const msg = `Hola, completé el pre-diagnóstico de TecnoHelp:
• Equipo: ${equipo}
• Síntomas: ${sintomas.join(", ") || "—"}
• Distrito: ${distrito}
• Urgencia: ${urgencia}
• Detalles: ${detalles || "—"}`;
    window.open(whatsappLink(msg), "_blank");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1 container-page py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline mb-6">
          <ArrowLeft className="size-5" /> Inicio
        </Link>

        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 text-center">
            Pre-diagnóstico rápido
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            Responde 5 preguntas. Te toma menos de 2 minutos.
          </p>

          {/* Progreso */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>Paso {paso} de {total}</span>
              <span className="text-primary">{Math.round(progreso)}%</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border p-8 shadow-soft min-h-[400px]">
            {paso === 1 && (
              <Step title="¿Qué equipo tiene problemas?">
                <div className="grid sm:grid-cols-2 gap-3">
                  {TIPOS_EQUIPO.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setEquipo(t.id); setSintomas([]); }}
                      className={`p-5 rounded-xl border-2 text-left text-lg font-semibold transition-all min-h-16 ${
                        equipo === t.id
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Step>
            )}

            {paso === 2 && (
              <Step title="¿Qué problema notas?" subtitle="Puedes elegir varios">
                <div className="grid gap-2">
                  {(SINTOMAS[equipo] ?? []).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSintoma(s)}
                      className={`p-4 rounded-xl border-2 text-left text-base font-semibold transition-all flex items-center gap-3 ${
                        sintomas.includes(s)
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <span className={`grid size-7 place-items-center rounded-md border-2 ${
                        sintomas.includes(s) ? "bg-primary border-primary text-primary-foreground" : "border-border"
                      }`}>
                        {sintomas.includes(s) && <CheckCircle2 className="size-5" />}
                      </span>
                      {s}
                    </button>
                  ))}
                </div>
              </Step>
            )}

            {paso === 3 && (
              <Step title="¿En qué distrito de Managua estás?">
                <Label htmlFor="dis" className="sr-only">Distrito</Label>
                <Select value={distrito} onValueChange={setDistrito}>
                  <SelectTrigger id="dis" className="h-14 text-base">
                    <SelectValue placeholder="Selecciona tu distrito" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRITOS_MANAGUA.map((d) => (
                      <SelectItem key={d} value={d} className="text-base py-3">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Step>
            )}

            {paso === 4 && (
              <Step title="¿Qué tan urgente es?">
                <div className="grid gap-3">
                  {URGENCIA.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgencia(u.label)}
                      className={`p-5 rounded-xl border-2 text-left text-lg font-semibold transition-all min-h-16 ${
                        urgencia === u.label
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </Step>
            )}

            {paso === 5 && (
              <Step title="¿Quieres contarnos algo más?" subtitle="Opcional. Ayuda a nuestro técnico a llegar preparado.">
                <Textarea
                  value={detalles}
                  onChange={(e) => setDetalles(e.target.value)}
                  placeholder="Ej: La computadora la usa mi mamá, casi no se usa para juegos, solo para WhatsApp Web…"
                  className="text-base min-h-32"
                  maxLength={500}
                />
                <div className="mt-6 rounded-xl bg-success/10 border-2 border-success/30 p-5">
                  <p className="font-display text-lg font-bold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="size-6 text-success" /> ¡Pre-diagnóstico listo!
                  </p>
                  <p className="text-base text-muted-foreground">
                    Ahora puedes agendar tu visita técnica o enviarnos los datos por WhatsApp.
                  </p>
                </div>
              </Step>
            )}
          </div>

          {/* Navegación */}
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => setPaso((p) => Math.max(1, p - 1))}
              disabled={paso === 1}
            >
              <ArrowLeft /> Atrás
            </Button>
            {paso < total ? (
              <Button
                type="button"
                size="lg"
                onClick={() => setPaso((p) => p + 1)}
                disabled={
                  (paso === 1 && !equipo) ||
                  (paso === 2 && sintomas.length === 0) ||
                  (paso === 3 && !distrito) ||
                  (paso === 4 && !urgencia)
                }
              >
                Continuar <ArrowRight />
              </Button>
            ) : (
              <div className="flex gap-2 flex-wrap justify-end">
                <Button size="lg" variant="outline" onClick={enviarWhatsApp}>
                  Enviar por WhatsApp
                </Button>
                <Button size="lg" onClick={continuarReserva}>
                  Agendar visita <ArrowRight />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-1">{title}</h2>
      {subtitle && <p className="text-base text-muted-foreground mb-5">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}
