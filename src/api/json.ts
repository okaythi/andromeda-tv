export type JsonObject = Record<string, unknown>;

export class PayloadError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'PayloadError';
  }
}

export function asRecord(value: unknown, context: string): JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new PayloadError(`${context} must be an object.`);
  }
  return value as JsonObject;
}

export function asArray(value: unknown, context: string): unknown[] {
  if (!Array.isArray(value)) throw new PayloadError(`${context} must be an array.`);
  return value;
}

export function requiredString(record: JsonObject, key: string, context: string): string {
  const value = record[key];
  if (typeof value !== 'string') throw new PayloadError(`${context}.${key} must be a string.`);
  return value;
}

export function nullableString(record: JsonObject, key: string, context: string): string | null {
  const value = record[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw new PayloadError(`${context}.${key} must be a string or null.`);
  return value;
}

export function requiredNumber(record: JsonObject, key: string, context: string): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new PayloadError(`${context}.${key} must be a finite number.`);
  }
  return value;
}

export function nullableNumber(record: JsonObject, key: string, context: string): number | null {
  const value = record[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new PayloadError(`${context}.${key} must be a finite number or null.`);
  }
  return value;
}

export function requiredBoolean(record: JsonObject, key: string, context: string): boolean {
  const value = record[key];
  if (typeof value !== 'boolean') throw new PayloadError(`${context}.${key} must be a boolean.`);
  return value;
}
