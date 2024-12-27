# Sonar API Client

A JavaScript/TypeScript client for interacting with the SonarQube Web API.
This package provides an easy-to-use interface for making requests to various SonarQube API endpoints, such as managing projects, quality gates, and other SonarQube features.

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
const projects = await sonar.api.projects.search({ query: 'my-project' });
console.log(projects);
```

### API Limit

To limit the number of API requests, you can use the `wrap` option to wrap around the API requests.

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
> The current available functions are based on a few use cases.
> To support the rest, please open a new PR or issue.

To interact with an API that not implemented yet, you can use the `request()` method to make a custom request to the SonarQube API.
For example:

```javascript
sonar.request('GET', 'projects/search', { q: 'sonar' }, 'json');
```

## Contributing

Check out our [`CONTRIBUTING.md`](CONTRIBUTING.md) page!
