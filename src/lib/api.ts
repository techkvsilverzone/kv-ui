import { isMobileApp, TOKEN_STORAGE_KEY } from './platform';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const UNAUTHORIZED_EVENT = 'kv-auth-unauthorized';

class ApiError extends Error {
  /** `field` names the input at fault when the server knows it (e.g. 'weight'). */
  constructor(public statusCode: number, message: string, public field?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** What to tell the user when the response isn't the API's own JSON error (proxy pages, outages). */
export const fallbackErrorMessage = (status: number): string => {
  if (status === 413) return 'This is too large to upload. Use smaller photos (or fewer at once) and try again.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return "You don't have permission to do this.";
  if (status === 404) return 'Not found. It may have been removed. Refresh and try again.';
  if (status === 429) return 'Too many attempts. Please wait a minute and try again.';
  if (status >= 500) return 'The server is having trouble right now. Please try again in a minute.';
  return `Request failed (error ${status}). Please try again.`;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  // On the mobile (Capacitor) build the WebView origin can't share the web's
  // httpOnly auth cookie, so we authenticate with a Bearer token instead.
  // The web build leaves this untouched and stays cookie-based.
  if (isMobileApp()) {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Auth is carried by an httpOnly cookie set by the server; `credentials: 'include'`
  // ensures the cookie is sent on every request (including cross-origin).
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    // fetch only throws when no readable response arrived. A proxy's "too large" page has no CORS
    // headers, so a big upload rejected by nginx also lands here; the body size tells them apart.
    if (typeof options.body === 'string' && options.body.length > 1_000_000) {
      throw new ApiError(413, fallbackErrorMessage(413));
    }
    throw new ApiError(
      0,
      navigator.onLine === false
        ? "You're offline. Check your internet connection and try again."
        : "Couldn't reach the server. Check your connection and try again in a minute.",
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || errorData.error?.message || fallbackErrorMessage(response.status),
      typeof errorData.field === 'string' ? errorData.field : undefined,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export { UNAUTHORIZED_EVENT };
export { ApiError };

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body: any, options?: RequestInit) => 
    request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: any, options?: RequestInit) => 
    request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'DELETE' }),
};
