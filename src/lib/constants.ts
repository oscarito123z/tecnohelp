export const DISTRITOS_MANAGUA = [
  "Distrito I — Centro Histórico",
  "Distrito II — Bolonia / Martha Quezada",
  "Distrito III — Linda Vista / Las Brisas",
  "Distrito IV — Bello Horizonte / Villa Venezuela",
  "Distrito V — Altamira / Los Robles",
  "Distrito VI — Las Américas / Villa Libertad",
  "Distrito VII — Tipitapa (área metropolitana)",
  "Ciudad Sandino",
  "Otro / Fuera de Managua",
] as const;

export const HORARIOS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
] as const;

export const WHATSAPP_NUMBER = "50584592904";
export const WHATSAPP_DEFAULT_MSG =
  "Hola, vengo del sitio TecnoHelp y necesito ayuda con mi computadora.";

export function whatsappLink(message: string = WHATSAPP_DEFAULT_MSG) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Distritos con recargo por distancia */
export const RECARGOS_DISTRITO: Record<string, number> = {
  "Distrito VII — Tipitapa (área metropolitana)": 150,
  "Ciudad Sandino": 100,
  "Otro / Fuera de Managua": 250,
};

export const URGENCIA_RECARGO: Record<string, number> = {
  normal: 0,
  "24h": 100,
  urgente: 250,
};
