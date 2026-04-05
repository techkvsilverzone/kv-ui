const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const UNAUTHORIZED_EVENT = 'kv-auth-unauthorized';

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('kv-silver-token');
  
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    const errorData = await response.json().catch(() => ({ message: 'An unexpected error occurred' }));
    throw new ApiError(
      response.status,
      errorData.message || errorData.error?.message || response.statusText,
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
