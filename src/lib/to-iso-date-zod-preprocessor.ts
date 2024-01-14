export function toIsoDate(value: unknown) {
  return value instanceof Date ? value.toISOString() : value;
}
