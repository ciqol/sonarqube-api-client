import { createError } from './sonar.error';
import type { CreateClientOptions, PathToObject, SonarClient, SonarQubeWebApi, WrapRequestFunction } from './types';

export function createClient({ baseURL, token, wrap }: CreateClientOptions): SonarClient {
  const sonarAPI = baseURL.replace(/\/$/, '');
  const headers: RequestInit['headers'] = token ? { Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}` } : {};

  return new SonarQubeClient(sonarAPI, headers, wrap ?? (async (invoke) => invoke()));
}

class SonarQubeClient implements SonarClient {
  constructor(
    private readonly baseURL: string,
    private readonly headers: RequestInit['headers'],
    private readonly wrap: WrapRequestFunction,
  ) {}

  async request(method: 'POST', apiPath: string, queryParams: object): Promise<void>;
  async request(method: 'GET', apiPath: string, queryParams: object, type: 'text'): Promise<string>;
  async request<T extends string>(method: 'GET', apiPath: T, queryParams: object, type: 'json'): Promise<Awaited<ReturnType<PathToObject<T>>>>;
  async request<T>(method: 'POST' | 'GET', apiPath: string, queryParams: object, type?: 'json' | 'text'): Promise<T | undefined> {
    const api = `${this.baseURL}/api/${apiPath}`;
    const searchParams = new URLSearchParams(Object.entries(queryParams)).toString();
    const { href: url } = new URL(`${api}?${searchParams}`);
    // todo: debug? debug(`${method} /${apiPath}?${searchParams}`);
    const invoke = () =>
      fetch(url, { method, headers: this.headers }).then(async (res) => {
        if (!res.ok) {
          throw await createError(res);
        }

        if (type && type in res) {
          return res[type]() as Promise<T>;
        }
      });

    return this.wrap(invoke);
  }

  api: SonarQubeWebApi = {
    alm_settings: {
      get_binding: (params) => this.request('GET', 'alm_settings/get_binding', params, 'json'),
      list: (params) => this.request('GET', 'alm_settings/list', params, 'json'),
      set_github_binding: (params) => this.request('POST', 'alm_settings/set_github_binding', params),
    },
    project_badges: {
      measure: (params) => this.request('GET', 'project_badges/measure', params, 'text'),
      quality_gate: (params) => this.request('GET', 'project_badges/quality_gate', params, 'text'),
      renew_token: (params) => this.request('POST', 'project_badges/renew_token', params),
      token: (params) => this.request('GET', 'project_badges/token', params, 'json'),
    },
    project_branches: {
      delete: (params) => this.request('POST', 'project_branches/delete', params),
      list: (params) => this.request('GET', 'project_branches/list', params, 'json'),
      rename: (params) => this.request('POST', 'project_branches/rename', params),
      set_automatic_deletion_protection: (params) => this.request('POST', 'project_branches/set_automatic_deletion_protection', params),
      set_main: (params) => this.request('POST', 'project_branches/set_main', params),
    },
    projects: {
      search: (params) => this.request('GET', 'projects/search', params, 'json'),
      update_key: (params) => this.request('POST', 'projects/update_key', params),
      update_visibility: (params) => this.request('POST', 'projects/update_visibility', params),
    },
    qualitygates: {
      select: (params) => this.request('POST', 'qualitygates/select', params),
    },
    qualityprofiles: {
      add_project: (params) => this.request('POST', 'qualityprofiles/add_project', params),
    },
    server: {
      version: () => this.request('GET', 'server/version', {}, 'text'),
    },
  };
}
