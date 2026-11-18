import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './api';

const respond = (status: number, body: string, contentType = 'application/json') =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(body, { status, headers: { 'Content-Type': contentType } }));

describe('api error messages', () => {
  afterEach(() => vi.restoreAllMocks());

  it("passes the server's message and field through", async () => {
    respond(400, JSON.stringify({ message: 'weight must be a positive number', field: 'weight' }));
    await expect(api.post('/admin/products', {})).rejects.toMatchObject({ statusCode: 400, message: 'weight must be a positive number', field: 'weight' });
  });

  it('explains a proxy 413 page instead of "unexpected error"', async () => {
    respond(413, '<html>413 Request Entity Too Large</html>', 'text/html');
    await expect(api.post('/admin/products', {})).rejects.toThrow(/too large to upload/);
  });

  it('explains a 502 from the proxy', async () => {
    respond(502, '<html>Bad Gateway</html>', 'text/html');
    await expect(api.get('/products')).rejects.toThrow(/server is having trouble/);
  });

  it('a big upload that fails without a readable response is reported as too large', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(api.post('/admin/products', { image: 'x'.repeat(1_100_000) })).rejects.toMatchObject({ statusCode: 413 });
  });

  it('a small request that fails without a response is a connection problem', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const err = (await api.get('/products').catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toMatch(/offline|reach the server/);
  });
});
