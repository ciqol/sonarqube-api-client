# Contributing

Thank you for considering contributing to this project!
The following guidelines will help you get started quickly and ensure that your contributions are effective and consistent with the project's standards.

## Getting Started

### Prerequisites

- [NVM - Node Version Manager](https://github.com/nvm-sh/nvm#readme)

### Setup

```shell
git clone https://github.com/ciqol/sonarqube-api-client.git
cd sonarqube-api-client
nvm use || nvm i
npm ci
```

## SDLC

### Build

```shell
npm run build
```

### Code Style

Automatically fix linting issues where possible:

```shell
npm run lint
```

Ensure the codebase is properly formatted:

```shell
npm run format
```

### Testing

Run the project’s unit tests (with coverage):

```shell
npm test
```

### End-to-End (E2E)

The E2E test exercises the **packaged** client against a real SonarQube instance. A `docker-compose.yml` is provided to spin one up locally:

```shell
# Elasticsearch requires a higher mmap limit (Linux hosts)
sudo sysctl -w vm.max_map_count=262144

# Start SonarQube (http://localhost:9000) and wait until it reports status UP
docker compose up --detach

# Build and pack the client, then run the E2E against the packed artifact
npm run build
npm pack ./dist --pack-destination "$PWD"
work="$(mktemp -d)" && cp test/e2e.mjs "$work"/ && cd "$work"
npm init -y >/dev/null && npm install "$OLDPWD"/sonarqube-api-client-*.tgz
node e2e.mjs

# Tear it down
cd "$OLDPWD" && docker compose down --volumes
```

The `e2e` job in the CI workflow runs this automatically (against the uploaded package tarball) on every pull request and on pushes to `main`.

### Releases

Releases are fully automated by [semantic-release](https://semantic-release.gitbook.io/) — **do not** bump the `version` in `package.json` manually.

- On every push to `main`, the `release` job (gated on `ci`, `smoke`, and `e2e`) analyzes the [Conventional Commits](https://www.conventionalcommits.org/) since the last release to decide the next version (`fix:` → patch, `feat:` → minor, `feat!:`/`BREAKING CHANGE` → major).
- It then publishes the package (from `dist/`) to npm and creates the matching GitHub release.
- Publishing uses **npm [trusted publishing](https://docs.npmjs.com/trusted-publishers) via GitHub Actions OIDC** — there is no `NPM_TOKEN`. The workflow's `id-token: write` permission lets npm exchange a short-lived OIDC token, and each release is published with signed [provenance](https://docs.npmjs.com/generating-provenance-statements). The trusted publisher is configured on the npm package settings (repo + `ci.yml` workflow).

For a deeper explanation of the build pipeline, the generated `dist/` manifest, and why the root `package.json` is `private: true`, see [Build & Publishing](docs/build-and-publishing.md).

## Need Help?

If you encounter any issues or need clarification, feel free to open an issue or reach out to the maintainers.

Happy Coding! 🎉
