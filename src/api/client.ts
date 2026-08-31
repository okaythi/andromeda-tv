import { PayloadError } from './json';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = configuredApiUrl
  || (import.meta.env.DEV ? window.location.origin : 'https://andromeda.nixlabs.tech');

export class ApiClientError extends Error {
  public readonly status: number | null;

  public constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

export function apiUrl(path: string, search?: URLSearchParams): string {
  const url = new URL(path, API_BASE_URL);
  if (search) url.search = search.toString();
  return url.toString();
}

export async function getJson<T>(
  path: string,
  parse: (payload: unknown) => T,
  signal?: AbortSignal,
  search?: URLSearchParams,
): Promise<T> {
  let response: Response;
  try {
    const requestInit: RequestInit = { headers: { Accept: 'application/json' } };
    if (signal) requestInit.signal = signal;
    response = await fetch(apiUrl(path, search), requestInit);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiClientError('Não foi possível conectar ao catálogo.');
  }

  if (!response.ok) {
    throw new ApiClientError(`O catálogo respondeu com erro ${response.status}.`, response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiClientError('O catálogo retornou uma resposta inválida.', response.status);
  }

  try {
    return parse(payload);
  } catch (error: unknown) {
    const message = error instanceof PayloadError || error instanceof Error
      ? error.message
      : 'O catálogo retornou dados incompatíveis.';
    throw new ApiClientError(message, response.status);
  }
}

export function createSearchParams(values: Record<string, string | number | null | undefined>): URLSearchParams {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== undefined) search.set(key, String(value));
  }
  return search;
}
