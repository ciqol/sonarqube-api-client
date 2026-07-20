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

  it('should fetch the system health as JSON', async () => {
    const mockResponse = { health: 'GREEN', causes: [] };
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResponse) });

    const client = createClient(defaultOptions);
    const result = await client.api.system.health();

    expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/system/health?`, expect.any(Object));
    expect(result).toEqual(mockResponse);
  });

  it('should ping the server returning plain text', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: jest.fn().mockResolvedValueOnce('pong') });

    const client = createClient(defaultOptions);
    const result = await client.api.system.ping();

    expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/system/ping?`, {
      method: 'GET',
      headers: { Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}` },
    });
    expect(result).toBe('pong');
  });

  it('should fetch the system status as JSON', async () => {
    const mockResponse = { id: 'AU-Tpxb--iU5OvuD2FLy', version: '6.3.0.1234', status: 'UP' };
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResponse) });

    const client = createClient(defaultOptions);
    const result = await client.api.system.status();

    expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/system/status?`, expect.any(Object));
    expect(result).toEqual(mockResponse);
  });

  it('should fetch component measures as JSON', async () => {
    const mockResponse = {
      component: { key: 'my_project', name: 'My Project', qualifier: 'TRK', measures: [{ metric: 'ncloc', value: '114', bestValue: false }] },
      metrics: [{ key: 'ncloc', name: 'Lines of Code', type: 'INT' }],
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResponse) });

    const client = createClient(defaultOptions);
    const result = await client.api.measures.component({ component: 'my_project', metricKeys: 'ncloc,complexity' });

    expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/measures/component?component=my_project&metricKeys=ncloc%2Ccomplexity`, {
      method: 'GET',
      headers: { Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}` },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should fetch a component tree with measures as JSON', async () => {
    const mockResponse = {
      paging: { pageIndex: 1, pageSize: 100, total: 1 },
      baseComponent: { key: 'my_project', name: 'My Project', qualifier: 'TRK', measures: [] },
      components: [{ key: 'my_project:Foo.java', name: 'Foo.java', qualifier: 'FIL', measures: [{ metric: 'ncloc', value: '120' }] }],
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResponse) });

    const client = createClient(defaultOptions);
    const result = await client.api.measures.component_tree({ component: 'my_project', metricKeys: 'ncloc', strategy: 'leaves', ps: 20 });

    expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/measures/component_tree?component=my_project&metricKeys=ncloc&strategy=leaves&ps=20`, {
      method: 'GET',
      headers: { Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}` },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should fetch measures history as JSON', async () => {
    const mockResponse = {
      paging: { pageIndex: 1, pageSize: 100, total: 2 },
      measures: [
        {
          metric: 'ncloc',
          history: [
            { date: '2017-01-01T00:00:00+0200', value: '100' },
            { date: '2017-02-01T00:00:00+0200', value: '110' },
          ],
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResponse) });

    const client = createClient(defaultOptions);
    const result = await client.api.measures.search_history({ component: 'my_project', metrics: 'ncloc', from: '2017-01-01' });

    expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/measures/search_history?component=my_project&metrics=ncloc&from=2017-01-01`, {
      method: 'GET',
      headers: { Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}` },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should remove trailing slashes from baseURL', () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    const client = createClient({ ...defaultOptions, baseURL: 'https://sonarqube.example.com/' });
    client.api.projects.search({});

    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/https:\/\/sonarqube\.example\.com\/api\//), expect.any(Object));
  });
});
