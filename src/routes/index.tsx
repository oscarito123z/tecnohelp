import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  GraduationCap,
  Wrench,
  Wifi,
  HardDrive,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import heroImg from "@/assets/hero-tecnohelp.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TecnoHelp · Tranquilidad digital a domicilio en Managua" },
      {
        name: "description",
        content:
          "Servicio amable de soporte técnico, mantenimiento de computadoras y clases de computación a domicilio en Managua. Desde C$ 400. Respuesta en menos de 24 horas.",
      },
      { property: "og:title", content: "TecnoHelp · Soporte técnico a domicilio en Managua" },
      {
        property: "og:description",
        content: "Soporte presencial, paciente y a precio justo. Pensado para adultos mayores y microempresas.",
      },
    ],
  }),
  component: HomePage,
});

const SERVICIOS = [
  { icon: Sparkles, nombre: "Mantenimiento", desc: "Limpieza y optimización", precio: 400 },
  { icon: Wrench, nombre: "Reparación", desc: "Diagnóstico y arreglo de fallas", precio: 600 },
  { icon: HardDrive, nombre: "Formateo", desc: "Instalación Windows + programas", precio: 700 },
  { icon: Wifi, nombre: "Redes y WiFi", desc: "Routers, impresoras, conexión", precio: 500 },
  { icon: GraduationCap, nombre: "Clases a domicilio", desc: "Aprende a tu ritmo", precio: 400 },
  { icon: Lightbulb, nombre: "Asesoría digital", desc: "Correo, WhatsApp, banca", precio: 400 },
];

const FUNDADORES = [
  {
    nombre: "Oscar Silva",
    rol: "Co-fundador · Soporte y operaciones",
    iniciales: "OS",
    bio: "Apasionado por enseñar tecnología sin tecnicismos. Lidera la atención al cliente.",
  },
  {
    nombre: "Christopher Ortega",
    rol: "Co-fundador · Técnico especialista",
    iniciales: "CO",
    bio: "Experto en reparación de equipos, redes y mantenimiento preventivo.",
  },
  {
    nombre: "Adrián Martínez",
    rol: "Co-fundador · Educación digital",
    iniciales: "AM",
    bio: "Diseña los talleres y micro-cursos para que todos aprendan sin miedo.",
  },
];

function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main id="contenido" className="flex-1">
        {/* HERO */}
        <section className="gradient-hero text-primary-foreground">
          <div className="container-page py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-4 py-1.5 text-sm font-bold mb-6">
                <Clock className="size-4" /> Respuesta en menos de 24 horas
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
                Tranquilidad digital, a domicilio en Managua.
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-xl">
                Reparamos su computadora, le enseñamos a usar el internet y resolvemos
                sus dudas con paciencia. Sin tecnicismos. Llegamos hasta su casa.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="xl" variant="accent">
                  <Link to="/reservar">
                    <Calendar /> Agendar visita
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline-on-dark">
                  <Link to="/calculadora">Ver precio</Link>
                </Button>
              </div>
              <p className="mt-6 text-base text-primary-foreground/85">
                Desde <span className="font-bold text-accent">C$ 400</span> · Pago al finalizar la visita
              </p>
            </div>
            <div className="relative">
              <img
                src={heroImg}
                alt="Técnico de TecnoHelp ayudando con paciencia a una señora con su laptop en su sala de estar"
                className="rounded-3xl shadow-card-hover w-full"
                width={1536}
                height={1024}
              />
            </div>
          </div>
        </section>

        {/* VALORES */}
        <section className="py-16 md:py-20" aria-labelledby="por-que">
          <div className="container-page">
            <h2 id="por-que" className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              ¿Por qué elegir TecnoHelp?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: HeartHandshake, t: "Trato humano", d: "Le hablamos en su idioma. Sin palabras raras ni prisas." },
                { icon: ShieldCheck, t: "Servicio confiable", d: "Técnicos verificados. Su equipo y datos están seguros." },
                { icon: Clock, t: "Llegamos rápido", d: "Visita programada en menos de 24 horas dentro de Managua." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
                  <div className="grid size-14 place-items-center rounded-xl bg-primary-soft text-primary mb-4">
                    <Icon className="size-7" strokeWidth={2.2} aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{t}</h3>
                  <p className="text-base text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section className="py-16 md:py-20 bg-secondary" aria-labelledby="servicios">
          <div className="container-page">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 id="servicios" className="font-display text-3xl md:text-4xl font-bold mb-3">
                Nuestros servicios
              </h2>
              <p className="text-lg text-muted-foreground">
                Precios claros desde el inicio. Sin sorpresas.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SERVICIOS.map(({ icon: Icon, nombre, desc, precio }) => (
                <div
                  key={nombre}
                  className="rounded-2xl bg-card border border-border p-6 shadow-soft transition-all hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-foreground">
                      <Icon className="size-7" strokeWidth={2.2} aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold mb-1">{nombre}</h3>
                      <p className="text-base text-muted-foreground mb-3">{desc}</p>
                      <p className="font-display text-2xl font-bold text-primary">
                        Desde C$ {precio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button asChild size="xl">
                <Link to="/reservar">
                  Agendar ahora <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* PROCESO */}
        <section className="py-16 md:py-20" aria-labelledby="proceso">
          <div className="container-page">
            <h2 id="proceso" className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              Así de fácil es
            </h2>
            <ol className="grid md:grid-cols-4 gap-6">
              {[
                "Cuéntenos su problema en el formulario",
                "Elija fecha y hora que le convenga",
                "Le confirmamos en menos de 24 horas",
                "Llegamos a su casa y resolvemos",
              ].map((paso, i) => (
                <li key={i} className="relative rounded-2xl bg-card border border-border p-6 shadow-soft">
                  <div className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground font-display text-xl font-bold mb-4">
                    {i + 1}
                  </div>
                  <p className="text-base font-semibold">{paso}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* SOBRE NOSOTROS */}
        <section className="py-16 md:py-20 bg-secondary" aria-labelledby="sobre-nosotros">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 id="sobre-nosotros" className="font-display text-3xl md:text-4xl font-bold mb-3">
                Conozca al equipo
              </h2>
              <p className="text-lg text-muted-foreground">
                Tres nicaragüenses con un mismo propósito: que la tecnología deje de ser un problema.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {FUNDADORES.map((f) => (
                <article key={f.nombre} className="rounded-2xl bg-card border border-border p-8 shadow-soft text-center">
                  <div
                    className="mx-auto grid size-24 place-items-center rounded-full bg-primary text-primary-foreground font-display text-3xl font-bold mb-4"
                    aria-hidden="true"
                  >
                    {f.iniciales}
                  </div>
                  <h3 className="font-display text-xl font-bold">{f.nombre}</h3>
                  <p className="text-sm font-semibold text-primary mt-1 mb-3">{f.rol}</p>
                  <p className="text-base text-muted-foreground">{f.bio}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-16 md:py-20">
          <div className="container-page">
            <div className="gradient-hero rounded-3xl p-10 md:p-16 text-center text-primary-foreground shadow-card-hover">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                ¿Listo para resolver su problema?
              </h2>
              <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Agende ahora o escríbanos por WhatsApp. Le respondemos personalmente.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="xl" variant="accent">
                  <Link to="/reservar"><Calendar /> Agendar visita</Link>
                </Button>
                <Button asChild size="xl" variant="outline-on-dark">
                  <Link to="/diagnostico">Hacer pre-diagnóstico</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
