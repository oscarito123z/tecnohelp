import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/constants";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp con TecnoHelp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-4 text-white shadow-card-hover transition-transform hover:scale-105 focus-visible:scale-105 min-h-14"
    >
      <MessageCircle className="size-7" aria-hidden="true" strokeWidth={2.5} />
      <span className="hidden sm:inline font-bold text-base">WhatsApp</span>
    </a>
  );
}
