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

## Need Help?

If you encounter any issues or need clarification, feel free to open an issue or reach out to the maintainers.

Happy Coding! 🎉
