import { createClient } from './sonar-client';
import type { CreateClientOptions } from './types';

describe('createClient()', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch as unknown as typeof global.fetch;
  const baseURL = 'https://sonarqube.example.com';
  const token = 'test-sonar-token';
  const mockWrap = jest.fn((invoke) => invoke());
  const defaultOptions: CreateClientOptions = { baseURL, token, wrap: mockWrap };

  it('should create a client instance with correct properties', () => {
    const client = createClient(defaultOptions);

    expect(client).toBeDefined();
    expect(client.api).toBeDefined();
    expect(typeof client.api.projects.search).toBe('function');
  });

  it('should handle API requests successfully', async () => {
    const mockResponse = { projects: ['project1', 'project2'] };
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResponse) });

    const client = createClient(defaultOptions);
    const result = await client.api.projects.search({});

    expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/projects/search?`, {
      method: 'GET',
      headers: { Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}` },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error on failed API requests', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: jest.fn().mockResolvedValueOnce({ error: 'Invalid request' }) });

    const client = createClient(defaultOptions);

    await expect(client.api.projects.search({})).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should call the `wrap` function for API requests', async () => {
    const mockResponse = { result: 'success' };
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResponse) });

    const client = createClient(defaultOptions);
    const result = await client.api.qualitygates.select({ gateName: 'GateName', projectKey: 'sonar' });

    expect(mockWrap).toHaveBeenCalled();
    expect(result).toBeUndefined(); // `POST` request without `type` returns `undefined`
  });

  it('should handle text response type correctly', async () => {
    const mockResponseText = 'badge-value';
    mockFetch.mockResolvedValueOnce({ ok: true, text: jest.fn().mockResolvedValueOnce(mockResponseText) });

    const client = createClient(defaultOptions);
    const result = await client.api.project_badges.measure({ project: 'test', metric: 'coverage' });

    expect(mockFetch).toHaveBeenCalled();
    expect(result).toBe(mockResponseText);
  });

  it('should remove trailing slashes from baseURL', () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    const client = createClient({ ...defaultOptions, baseURL: 'https://sonarqube.example.com/' });
    client.api.projects.search({});

    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/https:\/\/sonarqube\.example\.com\/api\//), expect.any(Object));
  });
});
