# AGENTS.md

Guidance for AI coding agents working in this repository. Humans should read
[`CONTRIBUTING.md`](./CONTRIBUTING.md); this file gives agents the extra context
needed to make correct, consistent changes quickly.

## Project overview

`sonarqube-api-client` is a community TypeScript/JavaScript client for the
[SonarQube Web API](https://next.sonarqube.com/sonarqube/web_api/api/). It is a
thin, fully-typed wrapper around `fetch`: callers create a client and invoke
strongly-typed methods that map 1:1 to SonarQube endpoints.

- Language: **TypeScript** (ES2022, `module: NodeNext`), shipped as both ESM and CJS.
- Runtime: **Node `>=18`** (`engines`). No runtime dependencies — `p-limit` is an
  optional peer used only in examples via the `wrap` option.
- Bundler: **Rollup** → `dist/` (`index.esm.js`, `index.cjs.js`, `index.d.ts`).
- The package is published from `dist/` by **semantic-release**.

## Setup & common commands

Use the Node version pinned in `.nvmrc` (`lts/*`).

```shell
nvm use || nvm i      # match the repo Node version
npm ci                # install (clean)

npm run build         # rimraf dist && rollup -c  → dist/
npm test              # jest --coverage (only src/**/*.spec.ts)
npm run lint          # eslint --fix
npm run lint:check    # eslint, no fix (use this to verify)
npm run format        # prettier --write
npm run format:check  # prettier, no write (use this to verify)
```

Before opening a PR, an agent **must** pass: `npm run lint:check`,
`npm run format:check`, `npm test`, and `npm run build`.

## Architecture

The entire public surface is two exports from `src/index.ts`:

- `createClient(options)` → a `SonarClient`.
- types `SonarClient` and `SonarError`.

Key files:

| File                      | Responsibility                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.ts`            | Public entry point (re-exports only — excluded from coverage).                                                                        |
| `src/lib/types.ts`        | **The typed API contract.** `SonarQubeWebApi` interface, `CreateClientOptions`, `WrapRequestFunction`, `PathToObject`, `SonarClient`. |
| `src/lib/sonar-client.ts` | `createClient` + `SonarQubeClient` implementation of the `api` object and the generic `request()` method.                             |
| `src/lib/sonar.error.ts`  | `SonarError` construction from non-OK responses.                                                                                      |
| `test/`                   | `e2e.mjs` (real dockerised SonarQube), `smoke.{mjs,cjs}` (packaged-artifact consumability). **Not** run by `npm test`.                |

A client is `{ request, api }`. `request(method, apiPath, params, type?)` does the
actual `fetch`; each entry in `api` is a typed shortcut that calls `request` with a
fixed path. The `wrap` option wraps every invocation (e.g. `p-limit` for
concurrency control). Auth is HTTP Basic with the token as username
(`Authorization: Basic base64(token:)`).

## How to add a new API endpoint (the most common task)

Endpoints live in **two** places that must stay in sync:

1. **`src/lib/types.ts`** — add the group/method to the `SonarQubeWebApi`
   interface. Follow the existing JSDoc style precisely: a description, required
   permissions, `@since`, a `@see` link to the official endpoint docs, document
   every param with units/defaults, and give the return shape. Mark inputs
   `readonly`. `POST` actions usually return `Promise<void>`; `GET` reads return a
   typed object (`json`) or `string` (`text`).
2. **`src/lib/sonar-client.ts`** — add the matching implementation in the `api`
   object: `name: (params) => this.request('GET'|'POST', 'group/endpoint', params, 'json'|'text'?)`.
   - `GET` returning data → pass `'json'` (or `'text'` for plain-text endpoints).
   - `POST` actions → omit the `type` argument (returns `void`).
   - Keep groups and methods in **alphabetical order** to match the file.
3. **Add a test** in `src/lib/sonar-client.spec.ts` mocking `fetch` and asserting
   the URL, method, query string, and parsed result.

Keep the path string in the implementation identical to the literal used in the
type — `PathToObject<T>` infers the return type from that string, so a typo breaks
typing silently.

## Code style

- **Prettier + ESLint** are authoritative; run them rather than hand-formatting.
  `lint-staged` (via Husky) auto-fixes staged files on commit.
- Only add comments that clarify non-obvious intent. The type definitions carry
  JSDoc; implementation code stays terse.
- Prefer `readonly` for inputs and avoid introducing runtime dependencies.

## Commits, branches & PRs

- **Conventional Commits** are enforced by commitlint (`@commitlint/config-conventional`).
  Examples: `feat: support languages/list api`, `fix(type): correct page size`,
  `ci: …`, `docs: …`, `test: …`, `chore: …`.
- For non-dev-dependency changes, use the `fix` type/prefix.
- Husky runs `commit-msg` (commitlint) and `pre-commit` (lint-staged) hooks.
- Versioning/publishing is automated by **semantic-release** from commit messages —
  do **not** bump `version` in `package.json` manually. Publishing uses npm **OIDC
  trusted publishing** (no `NPM_TOKEN`) with signed provenance.
- Work on a topic branch and open a focused PR; keep changes small and reviewable.

## CI expectations

`.github/workflows/ci.yml` runs on PRs and pushes to `main`:

- `ci`: install, audit, lint, format check, test (with coverage), build, `npm pack`
  the `dist/` artifact, and upload it.
- `smoke`: installs the packed tarball across an LTS Node matrix and runs
  `test/smoke.{mjs,cjs}`.
- `e2e`: boots SonarQube via `docker-compose.yml` and runs `test/e2e.mjs` against
  the packed tarball.
- `release`: runs only on push to `main`, gated on `ci`, `smoke`, and `e2e`. Publishes
  to npm via OIDC trusted publishing (token-free) with provenance.

A change is not "done" until CI would pass. Validate locally with the commands in
the Setup section before pushing.
