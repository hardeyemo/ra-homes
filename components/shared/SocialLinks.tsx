import { SOCIAL_LINKS } from "@/lib/constants";

const links = [
  {
    label: "Instagram",
    href: SOCIAL_LINKS.instagram,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" /></svg>,
  },
  {
    label: "Facebook",
    href: SOCIAL_LINKS.facebook,
    icon: <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V10H7.8v3h2.7v8h3.2Z" /></svg>,
  },
  {
    label: "X",
    href: SOCIAL_LINKS.x,
    icon: <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.9 3H22l-6.8 7.8L23 21h-6.1l-4.8-6.2L6.7 21H3.6l7.3-8.4L3.4 3h6.2l4.3 5.6L18.9 3Zm-1.1 16h1.7L8.7 4.9H6.9L17.8 19Z" /></svg>,
  },
];

export function SocialLinks({ dark = false }: { dark?: boolean }) {
  const buttonClass = dark
    ? "border-parchment/20 text-parchment/75 hover:border-gold hover:text-gold"
    : "border-line text-ink/65 hover:border-gold hover:text-gold-dark";

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`RA Homes on ${link.label}`} title={link.label} className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${buttonClass}`}>
          <span className="h-4 w-4">{link.icon}</span>
        </a>
      ))}
    </div>
  );
}
