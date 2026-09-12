import { createHash, randomBytes } from "crypto";
import { resend } from "@/lib/resend";
import { SITE_NAME } from "@/lib/constants";

const FROM = process.env.RESEND_FROM_EMAIL || "inquiries@rahomesproperties.com";
const APP_URL = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

export function createAuthToken(hours = 1) {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    hash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
  };
}

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const emailShell = (content: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1B241F; line-height: 1.6; max-width: 560px; margin: 0 auto;">
    <h1 style="font-size: 24px; margin-bottom: 16px;">${SITE_NAME}</h1>
    ${content}
  </div>
`;

export function sendVerificationEmail({ email, name, token }: { email: string; name: string; token: string }) {
  const url = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your RA Homes email address",
    html: emailShell(`
      <p>Hi ${name},</p>
      <p>Please verify your email address to activate your account.</p>
      <p><a href="${url}" style="display: inline-block; background: #1B241F; color: #F7F3E8; padding: 12px 20px; text-decoration: none; border-radius: 6px;">Verify email address</a></p>
      <p>This link expires in 24 hours.</p>
    `),
  });
}

export function sendPasswordResetEmail({ email, name, token }: { email: string; name: string; token: string }) {
  const url = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your RA Homes password",
    html: emailShell(`
      <p>Hi ${name},</p>
      <p>We received a request to reset your password.</p>
      <p><a href="${url}" style="display: inline-block; background: #1B241F; color: #F7F3E8; padding: 12px 20px; text-decoration: none; border-radius: 6px;">Reset password</a></p>
      <p>This link expires in one hour. If you did not request this, you can safely ignore this email.</p>
    `),
  });
}
