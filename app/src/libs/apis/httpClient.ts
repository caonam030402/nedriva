/**
 * Single browser `fetch` entry point for `/api/*` — add global error handling (e.g. toast) in one place.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type ApiErrorListener = (error: ApiError) => void;

let globalErrorListener: ApiErrorListener | undefined;

/**
 * Optional hook for app-wide logging / toast (register from a client provider).
 * @param listener - Called after `ApiError` is constructed; or `undefined` to clear
 */
export function setApiErrorListener(listener: ApiErrorListener | undefined): void {
  globalErrorListener = listener;
}

function errorMessageFromBody(body: unknown, fallback: string): string {
  if (
    body !== null
    && typeof body === 'object'
    && 'error' in body
    && typeof (body as { error: unknown }).error === 'string'
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}

/**
 * JSON `fetch` for same-origin API routes. Sends cookies (Clerk session).
 * @param input - Relative URL (e.g. `/api/enhancer/history?limit=30`)
 * @param init - Optional `fetch` init (method, body, headers)
 */
export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...normalizeHeaders(init?.headers),
    },
  });

  if (!res.ok) {
    let body: unknown;
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        body = await res.json();
      } catch {
        body = null;
      }
    } else {
      body = await res.text();
    }
    const message = errorMessageFromBody(body, res.statusText || 'Request failed');
    const err = new ApiError(message, res.status, body);
    globalErrorListener?.(err);
    throw err;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  return undefined as T;
}

function normalizeHeaders(h: HeadersInit | undefined): Record<string, string> {
  if (h == null) {
    return {};
  }
  if (h instanceof Headers) {
    return Object.fromEntries(h.entries());
  }
  if (Array.isArray(h)) {
    return Object.fromEntries(h);
  }
  return { ...h };
}
