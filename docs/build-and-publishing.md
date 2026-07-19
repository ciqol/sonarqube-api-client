# Build & Publishing

This document explains how `sonarqube-api-client` is built and released, and why
the repository root `package.json` is marked `"private": true`.

## Build pipeline

The build is a single command:

```shell
npm run build   # rimraf dist && rollup -c
```

Rollup (`rollup.config.mjs`) compiles `src/index.ts` with
`@rollup/plugin-typescript` (using `tsconfig.build.json`) and emits everything
that gets published into `dist/`:

- `dist/index.cjs.js` — CommonJS bundle (`require`).
- `dist/index.esm.js` — ES module bundle (`import`).
- `dist/index.d.ts` — TypeScript type declarations.
- `dist/README.md` and `dist/LICENSE` — copied via `rollup-plugin-copy`.
- `dist/package.json` — the **published** manifest, generated at build time (see below).

`p-limit` is declared as `external`, so it is never bundled — it is only an
optional peer used in examples via the `wrap` option.

## Dual ESM/CJS output

The package ships both module formats from one build. The generated
`dist/package.json` points each format at its bundle:

- `module` → `index.esm.js` (used by `import`).
- `main` → `index.cjs.js` (used by `require`).
- `types` → `index.d.ts`.

Crucially, the `modify-package-json` Rollup plugin **deletes the `type` field**
from the generated manifest so consumers can load either format without the
package being locked to `"type": "module"`. The package targets Node `>=18`.

## Why the root `package.json` is `private: true`

The root `package.json` has `"private": true` **on purpose**: it prevents an
accidental `npm publish` of the repository root. The root is a development
workspace (it carries `devDependencies`, `scripts`, Husky config, etc.), not the
shape we want on npm.

The package that actually gets published is a **separate manifest generated into
`dist/`** at build time. The `modify-package-json` plugin in
`rollup.config.mjs`:

1. Reads the root `package.json`.
2. Strips fields that must not ship: `devDependencies`, `scripts`, `type`, and —
   importantly — `private`.
3. Sets `types: index.d.ts` and wires `main`/`module` to the emitted bundles.
4. Writes the result to `dist/package.json`.

Because `private` is removed from the generated manifest, `dist/` is publishable
while the repository root is not. semantic-release publishes with
`pkgRoot: 'dist'` (see `.releaserc.mjs`), so only the clean, generated package is
ever pushed to npm.

## Automated releases (semantic-release)

Releases are fully automated by
[semantic-release](https://semantic-release.gitbook.io/) — **never** bump
`version` in `package.json` manually.

On every push to `main`, the `release` job in `.github/workflows/ci.yml` runs
**after** `ci`, `smoke`, and `e2e` all pass. semantic-release analyzes the
[Conventional Commits](https://www.conventionalcommits.org/) since the last
release to choose the next version:

| Commit type                   | Release |
| ----------------------------- | ------- |
| `fix:`                        | patch   |
| `feat:`                       | minor   |
| `feat!:` / `BREAKING CHANGE:` | major   |

It then publishes the package from `dist/` (`pkgRoot: 'dist'`) to npm and creates
the matching GitHub release with generated notes.

## OIDC trusted publishing & provenance

Publishing uses npm
[trusted publishing](https://docs.npmjs.com/trusted-publishers) via GitHub
Actions OIDC — there is **no `NPM_TOKEN`**. The `release` job requests
`id-token: write`, which lets npm exchange a short-lived OIDC token for auth, and
`NPM_CONFIG_PROVENANCE: 'true'` attaches signed
[provenance](https://docs.npmjs.com/generating-provenance-statements) to each
release. The trusted publisher (repository + `ci.yml` workflow) is configured in
the npm package settings.

## Related

- Build/test/release commands and CI expectations: [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- Config sources: [`rollup.config.mjs`](../rollup.config.mjs),
  [`.releaserc.mjs`](../.releaserc.mjs), [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
