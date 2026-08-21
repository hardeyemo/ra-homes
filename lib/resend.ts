import { Resend } from "resend";
import { AGENCY_EMAIL, AGENCY_PHONE_LOCAL, SITE_NAME } from "@/lib/constants";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL || "inquiries@rahomesproperties.com";

const wrap = (body: string) => `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; line-height: 1.6; color:#1B241F; max-width: 560px;">
    ${body}
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e0d4;" />
    <p style="font-size: 12px; color: #8a8578;">${SITE_NAME} · ${AGENCY_PHONE_LOCAL}</p>
  </div>
`;

// ---------- Property inquiries ----------

export async function sendInquiryNotification({
  agentEmail,
  propertyTitle,
  propertyReference,
  name,
  email,
  phone,
  message,
}: {
  agentEmail: string;
  propertyTitle: string;
  propertyReference: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: agentEmail,
    replyTo: email,
    subject: `New inquiry — ${propertyReference} ${propertyTitle}`,
    html: wrap(`
      <p><strong>New inquiry for ${propertyReference} — ${propertyTitle}</strong></p>
      <p><strong>Name:</strong> ${name}<br/>
      <strong>Email:</strong> ${email}<br/>
      <strong>Phone:</strong> ${phone || "—"}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `),
  });
}

export async function sendInquiryConfirmation({
  toEmail,
  toName,
  propertyTitle,
  propertyReference,
}: {
  toEmail: string;
  toName: string;
  propertyTitle: string;
  propertyReference: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `We received your inquiry — ${propertyReference}`,
    html: wrap(`
      <p>Hi ${toName},</p>
      <p>Thanks for your interest in <strong>${propertyTitle}</strong> (${propertyReference}). An RA Homes agent
      will follow up with you shortly by phone, WhatsApp, or email.</p>
      <p>If it's urgent, feel free to call or WhatsApp us at ${AGENCY_PHONE_LOCAL}.</p>
    `),
  });
}

// ---------- Viewing requests ----------

export async function sendViewingAgentNotification({
  agentEmail,
  propertyTitle,
  propertyReference,
  name,
  email,
  phone,
  preferredDate,
  notes,
}: {
  agentEmail: string;
  propertyTitle: string;
  propertyReference: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  notes?: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: agentEmail,
    replyTo: email,
    subject: `New viewing request — ${propertyReference} ${propertyTitle}`,
    html: wrap(`
      <p><strong>New viewing request for ${propertyReference} — ${propertyTitle}</strong></p>
      <p><strong>Name:</strong> ${name}<br/>
      <strong>Email:</strong> ${email}<br/>
      <strong>Phone:</strong> ${phone}<br/>
      <strong>Preferred date:</strong> ${preferredDate}</p>
      ${notes ? `<p><strong>Notes:</strong><br/>${notes}</p>` : ""}
    `),
  });
}

export async function sendViewingConfirmation({
  toEmail,
  propertyTitle,
  propertyReference,
  preferredDate,
}: {
  toEmail: string;
  propertyTitle: string;
  propertyReference: string;
  preferredDate: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Viewing request received — ${propertyReference}`,
    html: wrap(`
      <p>We received your viewing request for <strong>${propertyTitle}</strong> (${propertyReference}) on <strong>${preferredDate}</strong>.</p>
      <p>An agent will confirm your appointment shortly by phone or WhatsApp (${AGENCY_PHONE_LOCAL}).</p>
    `),
  });
}

// ---------- List Your Property submissions ----------

export async function sendSubmissionNotification({
  ownerName,
  email,
  phone,
  address,
  city,
  state,
  propertyType,
  listingType,
  askingPrice,
  preferredContact,
  notes,
}: {
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  listingType: string;
  askingPrice?: number;
  preferredContact: string;
  notes?: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: process.env.AGENCY_INBOX_EMAIL || AGENCY_EMAIL,
    replyTo: email,
    subject: `New property submission — ${address}, ${city}`,
    html: wrap(`
      <p><strong>${ownerName}</strong> submitted a property for review.</p>
      <p>${address}, ${city}, ${state}</p>
      <p>Type: ${propertyType} · Listing: ${listingType}${askingPrice ? ` · Asking ₦${askingPrice.toLocaleString()}` : ""}</p>
      <p>Preferred contact method: <strong>${preferredContact}</strong></p>
      <p>Contact: ${email} / ${phone}</p>
      ${notes ? `<p>${notes}</p>` : ""}
    `),
  });
}

export async function sendSubmissionConfirmation({
  toEmail,
  toName,
  address,
}: {
  toEmail: string;
  toName: string;
  address: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: "We received your property submission",
    html: wrap(`
      <p>Hi ${toName},</p>
      <p>Thanks for submitting <strong>${address}</strong> to RA Homes & Properties. Our team will review
      the details and reach out using your preferred contact method.</p>
    `),
  });
}

// ---------- General contact form ----------

export async function sendContactNotification({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: process.env.AGENCY_INBOX_EMAIL || AGENCY_EMAIL,
    replyTo: email,
    subject: `New contact message${subject ? `: ${subject}` : ""}`,
    html: wrap(`
      <p><strong>${name}</strong> sent a message via the contact form.</p>
      <p><strong>Email:</strong> ${email}<br/><strong>Phone:</strong> ${phone || "—"}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `),
  });
}

export async function sendContactConfirmation({ email, name }: { email: string; name: string }) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "We received your message",
    html: wrap(`
      <p>Hi ${name},</p>
      <p>Thanks for reaching out to RA Homes & Properties. We've received your message and will respond shortly.</p>
    `),
  });
}
