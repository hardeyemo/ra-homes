// Keep the operational inbox configurable on the server without exposing this
// environment variable to client components that render the public contact.
import "server-only";

export const AGENCY_INBOX_EMAIL = process.env.AGENCY_INBOX_EMAIL || "info@rahomesproperties.com";
