# Sonar API Client

[![🏗️ CI](https://github.com/ciqol/sonarqube-api-client/actions/workflows/ci.yml/badge.svg)](https://github.com/ciqol/sonarqube-api-client/actions/workflows/ci.yml)
[![🎉 Release](https://github.com/ciqol/sonarqube-api-client/actions/workflows/release.yml/badge.svg)](https://github.com/ciqol/sonarqube-api-client/actions/workflows/release.yml)
[![NPM Version](https://img.shields.io/npm/v/sonarqube-api-client)](https://www.npmjs.com/package/sonarqube-api-client)
[![NPM Downloads](https://img.shields.io/npm/dm/sonarqube-api-client)](https://www.npmjs.com/package/sonarqube-api-client)

A JavaScript/TypeScript client for interacting with the SonarQube Web API.
This package provides an easy-to-use interface for requesting various SonarQube API endpoints, such as managing projects, quality gates, and other SonarQube features.

## Features

- **Simple Client Creation**: Easily create a client instance to interact with the SonarQube API.
- **Supports ES Modules and CommonJS**: Load the client using either ES Modules or CommonJS.
- **Built-in API Methods**: Includes methods for interacting with the following SonarQube endpoints:
  - Projects
  - Quality Gates
  - ALM Settings
  - Project Branches
  - Project Badges
  - More…

## Installation

### NPM

```shell
npm install sonar-api-client
```

### Yarn

```shell
yarn add sonar-api-client
```

## Usage

### Create a SonarQube Client

```javascript
import { createClient } from 'sonar-api-client';

const sonar = createClient({
  baseURL: 'https://sonarqube.example.com',
  token: 'your-sonarqube-token',
});

// Example API usage
const projects = await sonar.api.projects.search({ q: 'my-project' });
console.log(projects);
```

### API Limit

We can use the `wrap` option to wrap around API requests to limit their number.

For example, using [`p-limit`](https://www.npmjs.com/package/p-limit) to limit the number of concurrent requests:

```javascript
import pLimit from 'p-limit';
import { createClient } from 'sonar-api-client';

const sonar = createClient({
  baseURL: 'https://sonarqube.example.com',
  token: 'your-sonarqube-token',
  wrap: pLimit(1), // Limit to 1 concurrent request
});
```

### `createClient()` Options

| Name      | Required | Description                                                                                                                                                                                    |
| --------- | :------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseURL` |    ✓     | The base URL for the SonarQube instance. This should be the root URL without any trailing slashes. Example: `'https://sonarqube.example.com'`                                                  |
| `token`   |    ✓     | The authentication token for your SonarQube instance.                                                                                                                                          |
| `wrap`    |    ✖    | A function that wraps around the API requests. Can be used to limit the API requests or add custom logic around it. If not provided, the default behavior is simply to invoke the API request. |

### API Methods

For more details on the API endpoints, visit the [SonarQube Web API documentation](https://next.sonarqube.com/sonarqube/web_api/api/).

> [!important]
> This library is simply a client for interacting with the SonarQube API. It does not provide any functionality for running SonarQube itself.
> This library is not maintained by SonarQube and is not an official SonarQube client.
>
> The currently available functions are based on a few use cases.
> To support the rest, please open a new PR or issue.

To interact with an API that has not been implemented yet, you can use the `request()` method to make a custom request to the SonarQube API.
For example:

```javascript
sonar.request('GET', 'projects/search', { q: 'sonar' }, 'json');
```

### NestJS Example

**sonar-client.provider.ts**

```typescript
import { ConfigService, type FactoryProvider } from '@nestjs/config';
import { createClient } from 'sonarqube-api-client';

export const SONAR_CLIENT_TOKEN = 'SONAR_CLIENT_TOKEN';

export const SonarClientProvider: FactoryProvider = {
  provide: SONAR_CLIENT_TOKEN,
  inject: [ConfigService],
  useFactory: (conf: ConfigService) => {
    const token = conf.getOrThrow('SONAR_API_TOKEN');
    const baseURL = conf.get('SONAR_API_BASE_URL', 'https://sonarqube.example.com');
    const concurrency = conf.get('SONAR_API_CONCURRENCY', 3);

    return createClient({ token, baseURL, wrap: pLimit(concurrency) });
  },
};
```

**sonar-client.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SonarClientProvider } from './sonar-client.provider';

@Module({
  imports: [ConfigModule],
  providers: [SonarClientProvider],
  exports: [SonarClientProvider],
})
export class SonarClientModule {}
```

**your.controller.ts** (or any other injectable)

```typescript
@Controller()
export class YourController {
  constructor(@Inject(SONAR_CLIENT_TOKEN) private readonly sonar: SonarClient) {}

  @Get()
  async getProjects() {
    return this.sonar.api.projects.search({ q: 'sonar' });
  }
}
```
