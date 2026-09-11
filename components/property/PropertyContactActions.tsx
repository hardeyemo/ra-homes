import { MessageCircle, Phone, CalendarClock } from "lucide-react";
import { AGENCY_PHONE_INTL, whatsappLink, propertyWhatsappMessage } from "@/lib/constants";

interface Props {
  propertyTitle: string;
  propertyLocation: string;
  className?: string;
  onScheduleClick?: () => void;
  scheduleHref?: string;
  variant?: "default" | "management";
  scheduleLabel?: string;
}

export const PropertyContactActions = ({
  propertyTitle,
  propertyLocation,
  className = "",
  onScheduleClick,
  scheduleHref = "/contact",
  variant = "default",
  scheduleLabel = "Schedule Viewing",
}: Props) => {
  const message = propertyWhatsappMessage(propertyTitle, propertyLocation);
  const isManagement = variant === "management";
  const whatsappClassName = isManagement
    ? "rounded-lg border-2 border-[#128C7E] bg-[#25D366] text-white shadow-[0_4px_0_#128C7E] hover:-translate-y-0.5 hover:bg-[#20bd5b] hover:shadow-[0_6px_0_#128C7E]"
    : "bg-[#25D366] text-white hover:opacity-90";
  const callClassName = isManagement
    ? "rounded-lg border border-parchment/30 bg-parchment text-ink hover:-translate-y-0.5 hover:bg-gold"
    : "bg-ink text-parchment hover:bg-clay";
  const scheduleClassName = isManagement
    ? "rounded-lg border border-parchment/45 text-parchment hover:-translate-y-0.5 hover:border-gold hover:bg-parchment/10"
    : "border border-ink text-ink hover:bg-ink hover:text-parchment";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex h-12 items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${whatsappClassName}`}
      >
        <MessageCircle className="w-4 h-4" /> WhatsApp RA Homes
      </a>
      <a
        href={`tel:+${AGENCY_PHONE_INTL}`}
        className={`flex h-12 items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${callClassName}`}
      >
        <Phone className="w-4 h-4" /> Call RA Homes
      </a>
      {onScheduleClick ? (
        <button
          onClick={onScheduleClick}
          className={`flex h-12 items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${scheduleClassName}`}
        >
          <CalendarClock className="w-4 h-4" /> {scheduleLabel}
        </button>
      ) : (
        <a
          href={scheduleHref}
          className={`flex h-12 items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${scheduleClassName}`}
        >
          <CalendarClock className="w-4 h-4" /> {scheduleLabel}
        </a>
      )}
    </div>
  );
};
