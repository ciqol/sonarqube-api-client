---
name: add-sonarqube-endpoint
description: Add a new SonarQube Web API endpoint to this client. Use when a caller needs a group/method that isn't in the api object yet, or asks to "support the X endpoint".
---

# Add a SonarQube Web API endpoint

This client is a thin, fully-typed wrapper around `fetch`. Every endpoint is
declared in **two files that must stay in sync**, then covered by a test. Getting
the path string identical in both files is critical: `PathToObject<T>` infers the
return type from the literal string, so a typo silently breaks typing.

Read the target files before editing so the addition matches their conventions:

- `src/lib/types.ts` — the typed API contract (`SonarQubeWebApi` interface).
- `src/lib/sonar-client.ts` — the `api` object implementation.
- `src/lib/sonar-client.spec.ts` — `fetch`-mocked unit tests.

## Steps

### 1. Declare the method in `src/lib/types.ts`

Add the group/method to the `SonarQubeWebApi` interface. Match the existing JSDoc
style exactly:

- A one-line description (plus extra paragraphs if the API docs warrant).
- Required permissions.
- `@since <version>`.
- `@see` link to the official endpoint docs
  (`https://next.sonarqube.com/sonarqube/web_api/api/<group>?query=<method>`).
- Document **every** param with units/defaults (`@default`, `@example`).
- Mark all inputs `readonly`.
- Return type:
  - `POST` actions → `Promise<void>`.
  - `GET` reads → a typed object (fetched as `json`) or `string` (fetched as `text`).

Keep groups and methods in **alphabetical order**. If the group already exists,
add the method in order within it; otherwise add a new `readonly <group>: { ... }`
block in the right alphabetical position, with its own group-level JSDoc.

### 2. Wire the implementation in `src/lib/sonar-client.ts`

Add the matching entry to the `api` object:

```ts
name: (params) => this.request('GET' | 'POST', 'group/endpoint', params, 'json' | 'text'?),
```

- `GET` returning data → pass `'json'` (or `'text'` for plain-text endpoints).
- `POST` actions → omit the `type` argument (returns `void`).
- Endpoints with no required params (e.g. optional-only) → use `params ?? {}`.
- The path string **must** be byte-for-byte identical to the literal used in the
  type, so `PathToObject<T>` resolves the return type.
- Keep groups **and** methods in alphabetical order, matching the interface.

### 3. Add a test in `src/lib/sonar-client.spec.ts`

Mock `fetch` and assert the URL (including query string), method, and parsed
result. Follow the existing cases:

- `json` reads: `mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResponse) })`.
- `text` reads: use `text:` instead of `json:` and assert the string.
- `POST` actions: assert the result is `undefined`.

### 4. Validation gate (all must pass)

```shell
npm run lint:check
npm run format:check
npm test
npm run build
```

If lint/format complain, run `npm run lint` and `npm run format` to auto-fix, then
re-run the `:check` variants.

## Worked example: `languages/list`

**`src/lib/types.ts`** — new group (alphabetically after `alm_settings`):

```ts
/**
 * Get the list of programming languages supported in this instance.
 * @see https://next.sonarqube.com/sonarqube/web_api/api/languages
 */
readonly languages: {
  /**
   * List supported programming languages.
   * @since 5.1
   * @see https://next.sonarqube.com/sonarqube/web_api/api/languages?query=list
   */
  list(params?: {
    /**
     * The size of the list to return, 0 for all languages.
     * @default 0
     * @example 25
     */
    readonly ps?: number;

    /**
     * A pattern to match language keys/names against.
     * @example 'java'
     */
    readonly q?: string;
  }): Promise<{ readonly languages: { readonly key: string; readonly name: string }[] }>;
};
```

**`src/lib/sonar-client.ts`** — matching entry in the `api` object:

```ts
languages: {
  list: (params) => this.request('GET', 'languages/list', params ?? {}, 'json'),
},
```

**`src/lib/sonar-client.spec.ts`** — a `fetch`-mocked test:

```ts
it('should list supported languages as JSON', async () => {
  const mockResponse = { languages: [{ key: 'java', name: 'Java' }] };
  mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValueOnce(mockResponse) });

  const client = createClient(defaultOptions);
  const result = await client.api.languages.list({ q: 'java', ps: 25 });

  expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/languages/list?q=java&ps=25`, {
    method: 'GET',
    headers: { Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}` },
  });
  expect(result).toEqual(mockResponse);
});
```

## Checklist

- [ ] Method declared in `src/lib/types.ts` with full JSDoc and `readonly` inputs.
- [ ] Implementation added to `src/lib/sonar-client.ts` with the identical path string.
- [ ] Groups and methods kept in alphabetical order in both files.
- [ ] `POST` → `Promise<void>` / no `type`; `GET` → `json` or `text`.
- [ ] Test added asserting URL, method, query string, and parsed result.
- [ ] `npm run lint:check`, `npm run format:check`, `npm test`, `npm run build` all pass.
