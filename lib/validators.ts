export function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

export function normalizePhone(phone: string) {
  const onlyDigits = phone.replace(/\D/g, "");
  return onlyDigits;
}

export function isOnlyDigits(input: string) {
  return /^\d+$/.test(input);
}

export function requireNonEmpty(str: string) {
  return str.trim().length > 0;
}

