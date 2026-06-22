import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted">
      <div className="container-page py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground font-display font-bold">
              T
            </div>
            <span className="font-display text-lg font-bold">TecnoHelp</span>
          </div>
          <p className="text-base text-muted-foreground max-w-xs">
            Tranquilidad digital para todos. Soporte técnico, mantenimiento y
            enseñanza a domicilio en Managua.
          </p>
        </div>

        <div>
          <h3 className="font-display text-base font-bold mb-3">Explorar</h3>
          <ul className="space-y-2 text-base">
            <li><Link to="/reservar" className="hover:text-primary">Agendar visita</Link></li>
            <li><Link to="/diagnostico" className="hover:text-primary">Pre-diagnóstico</Link></li>
            <li><Link to="/calculadora" className="hover:text-primary">Calculadora de precio</Link></li>
            <li><Link to="/educacion" className="hover:text-primary">Aprender computación</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-bold mb-3">Contacto</h3>
          <ul className="space-y-2 text-base">
            <li className="flex items-center gap-2">
              <Phone className="size-5 text-primary" aria-hidden="true" />
              <a href="tel:+50584592904" className="hover:text-primary">+505 8459 2904</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" aria-hidden="true" />
              Managua, Nicaragua
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TecnoHelp · Fundado por Oscar Silva, Christopher Ortega y Adrián Martínez
      </div>
    </footer>
  );
}
