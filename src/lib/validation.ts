const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function isValidPhone(value: string): boolean {
  return /^\+?[0-9\s()-]{5,40}$/.test(value);
}

export function isInternationalPhone(value: string): boolean {
  return /^\+[1-9]\d{0,2}[\s-]?[\d\s-]{5,16}$/.test(value.trim());
}

export function isFilled(value: string, min: number, max: number): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}
