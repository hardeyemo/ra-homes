import { MessageCircle, Phone, CalendarClock } from "lucide-react";
import { AGENCY_PHONE_INTL, whatsappLink, propertyWhatsappMessage } from "@/lib/constants";

interface Props {
  propertyTitle: string;
  propertyLocation: string;
  className?: string;
  onScheduleClick?: () => void;
  scheduleHref?: string;
}

export const PropertyContactActions = ({
  propertyTitle,
  propertyLocation,
  className = "",
  onScheduleClick,
  scheduleHref = "/contact",
}: Props) => {
  const message = propertyWhatsappMessage(propertyTitle, propertyLocation);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 h-12 bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <MessageCircle className="w-4 h-4" /> WhatsApp RA Homes
      </a>
      <a
        href={`tel:+${AGENCY_PHONE_INTL}`}
        className="flex items-center justify-center gap-2 h-12 bg-ink text-parchment text-sm font-medium hover:bg-clay transition-colors"
      >
        <Phone className="w-4 h-4" /> Call RA Homes
      </a>
      {onScheduleClick ? (
        <button
          onClick={onScheduleClick}
          className="flex items-center justify-center gap-2 h-12 border border-ink text-ink text-sm font-medium hover:bg-ink hover:text-parchment transition-colors"
        >
          <CalendarClock className="w-4 h-4" /> Schedule Viewing
        </button>
      ) : (
        <a
          href={scheduleHref}
          className="flex items-center justify-center gap-2 h-12 border border-ink text-ink text-sm font-medium hover:bg-ink hover:text-parchment transition-colors"
        >
          <CalendarClock className="w-4 h-4" /> Schedule Viewing
        </a>
      )}
    </div>
  );
};
