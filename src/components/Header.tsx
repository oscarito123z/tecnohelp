import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogIn, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/reservar", label: "Agendar visita" },
  { to: "/diagnostico", label: "Pre-diagnóstico" },
  { to: "/calculadora", label: "Calculadora" },
  { to: "/educacion", label: "Aprender" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  useEffect(() => setOpen(false), []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" aria-label="TecnoHelp inicio">
          <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-xl">
            T
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-xl font-bold text-foreground">TecnoHelp</span>
            <span className="text-xs text-muted-foreground">Managua, Nicaragua</span>
          </div>
        </Link>

        <nav aria-label="Menú principal" className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 rounded-lg text-base font-semibold text-foreground hover:bg-primary-soft transition-colors"
              activeProps={{ className: "bg-primary-soft text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="outline" size="lg">
                <Link to="/mis-reservas">
                  <UserCircle2 /> Mis reservas
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => supabase.auth.signOut()}
                aria-label="Cerrar sesión"
              >
                Salir
              </Button>
            </>
          ) : (
            <Button asChild size="lg" variant="default">
              <Link to="/auth">
                <LogIn /> Iniciar sesión
              </Link>
            </Button>
          )}
        </div>

        <button
          className="lg:hidden grid size-12 place-items-center rounded-lg border border-border"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Menú móvil" className="lg:hidden border-t border-border bg-background">
          <div className="container-page py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-lg font-semibold hover:bg-primary-soft"
                activeProps={{ className: "bg-primary-soft text-primary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/mis-reservas" onClick={() => setOpen(false)}>
                      Mis reservas
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => {
                      supabase.auth.signOut();
                      setOpen(false);
                    }}
                  >
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <Button asChild size="lg">
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    Iniciar sesión
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
