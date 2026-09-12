export const PASSWORD_REQUIREMENTS = "Use at least 8 characters, including uppercase, lowercase, a number, and a special character.";

export function isValidPassword(password: string) {
  return password.length >= 8
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}
