import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, PlayCircle, BookOpen, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/educacion")({
  head: () => ({
    meta: [
      { title: "Aprender computación · TecnoHelp" },
      { name: "description", content: "Videos cortos e infografías gratis para aprender a usar tu computadora, celular e internet." },
    ],
  }),
  component: EducacionPage,
});

type Recurso = {
  id: string;
  titulo: string;
  desc: string;
  categoria: "Básico" | "Internet" | "Seguridad" | "WhatsApp" | "Correo";
  tipo: "video" | "infografía";
  duracion: string;
  youtubeId: string;
};

// IDs reales de tutoriales en español de YouTube
const RECURSOS: Recurso[] = [
  { id: "1", titulo: "Cómo encender y apagar tu computadora", desc: "El primer paso, sin miedo y bien explicado.", categoria: "Básico", tipo: "video", duracion: "3 min", youtubeId: "Cg9wOybQOpw" },
  { id: "2", titulo: "Usar el mouse y el teclado", desc: "Clic, doble clic y atajos esenciales.", categoria: "Básico", tipo: "video", duracion: "5 min", youtubeId: "1QXOd2ZQs-Q" },
  { id: "3", titulo: "Buscar información en Google", desc: "Aprende a buscar lo que necesitas y reconocer resultados confiables.", categoria: "Internet", tipo: "video", duracion: "6 min", youtubeId: "Jm-pjnIMSr4" },
  { id: "4", titulo: "Descargar archivos con seguridad", desc: "Cómo saber si un archivo es seguro antes de abrirlo.", categoria: "Seguridad", tipo: "infografía", duracion: "2 min", youtubeId: "WnyJSesQI_M" },
  { id: "5", titulo: "Enviar tu primer correo electrónico", desc: "Paso a paso para escribir, adjuntar y enviar.", categoria: "Correo", tipo: "video", duracion: "7 min", youtubeId: "byVCNagqSjY" },
  { id: "6", titulo: "Usar WhatsApp Web en tu computadora", desc: "Sincroniza tus chats y escribe más rápido.", categoria: "WhatsApp", tipo: "video", duracion: "4 min", youtubeId: "TmHmHKgvgVc" },
  { id: "7", titulo: "Reconocer estafas y mensajes falsos", desc: "Las 5 señales que indican un fraude por internet.", categoria: "Seguridad", tipo: "infografía", duracion: "3 min", youtubeId: "1JlUe0i8wzE" },
  { id: "8", titulo: "Crear tu contraseña segura", desc: "Cómo inventar contraseñas que recuerdes pero nadie adivine.", categoria: "Seguridad", tipo: "infografía", duracion: "2 min", youtubeId: "3NjQ9b3pgIg" },
  { id: "9", titulo: "Hacer videollamadas con tu familia", desc: "WhatsApp, Zoom y Google Meet, explicados con calma.", categoria: "WhatsApp", tipo: "video", duracion: "8 min", youtubeId: "8jPQjjsBbIc" },
];

const CATEGORIAS = ["Todos", "Básico", "Internet", "Correo", "WhatsApp", "Seguridad"] as const;

function EducacionPage() {
  const [busqueda, setBusqueda] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIAS)[number]>("Todos");
  const [activo, setActivo] = useState<Recurso | null>(null);

  const filtrados = useMemo(() => {
    return RECURSOS.filter((r) => {
      const matchCat = cat === "Todos" || r.categoria === cat;
      const q = busqueda.trim().toLowerCase();
      const matchQ = !q || r.titulo.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [busqueda, cat]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1 container-page py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline mb-6">
          <ArrowLeft className="size-5" /> Inicio
        </Link>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Aprender computación</h1>
          <p className="text-lg text-muted-foreground">
            Videos cortos e infografías gratis. Aprende a tu ritmo, sin miedo.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar (ej: WhatsApp, contraseña…)"
              aria-label="Buscar recursos"
              className="h-14 pl-12 text-base"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8" role="tablist" aria-label="Categorías">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`h-11 px-5 rounded-full font-semibold text-base border-2 transition-all ${
                cat === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <p className="text-center text-lg text-muted-foreground py-20">
            No encontramos recursos con esa búsqueda. Intenta otra palabra.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtrados.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl bg-card border border-border overflow-hidden shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all flex flex-col"
              >
                <button
                  onClick={() => setActivo(r)}
                  className="aspect-video bg-primary-soft grid place-items-center relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-primary"
                  aria-label={`Reproducir: ${r.titulo}`}
                >
                  <img
                    src={`https://i.ytimg.com/vi/${r.youtubeId}/hqdefault.jpg`}
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <PlayCircle className="size-20 text-white relative drop-shadow-lg" strokeWidth={1.5} />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card text-xs font-bold uppercase tracking-wide z-10">
                    {r.categoria}
                  </span>
                </button>
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="font-display text-lg font-bold mb-2 leading-snug">{r.titulo}</h2>
                  <p className="text-base text-muted-foreground mb-3 flex-1">{r.desc}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Clock className="size-4" /> {r.duracion} · {r.tipo === "video" ? "Video" : "Guía"}
                    </div>
                    <button
                      onClick={() => setActivo(r)}
                      className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                    >
                      <PlayCircle className="size-4" /> Ver
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!activo} onOpenChange={(o) => !o && setActivo(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
          <DialogTitle className="sr-only">{activo?.titulo ?? "Video"}</DialogTitle>
          <DialogDescription className="sr-only">{activo?.desc ?? ""}</DialogDescription>
          {activo && (
            <>
              <div className="aspect-video w-full bg-black">
                <iframe
                  key={activo.id}
                  src={`https://www.youtube-nocookie.com/embed/${activo.youtubeId}?autoplay=1&rel=0`}
                  title={activo.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-bold">{activo.titulo}</h3>
                <p className="text-base text-muted-foreground mt-1">{activo.desc}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
