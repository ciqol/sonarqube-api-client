import assert from 'node:assert/strict';
import { createClient } from 'sonarqube-api-client';

const baseURL = process.env.SONAR_BASE_URL ?? 'http://localhost:9000';

console.log(`Running e2e against ${baseURL}`);

const sonar = createClient({ baseURL });

const ping = await sonar.request('GET', 'system/ping', {}, 'text');
assert.equal(ping.trim(), 'pong', `expected system/ping to return 'pong', got '${ping}'`);
console.log('system/ping (request) → pong');

const structuredPing = await sonar.api.system.ping();
assert.equal(structuredPing.trim(), 'pong', `expected api.system.ping() to return 'pong', got '${structuredPing}'`);
console.log('system/ping (api) → pong');

const status = await sonar.request('GET', 'system/status', {}, 'json');
assert.equal(status.status, 'UP', `expected system status 'UP', got '${status.status}'`);
assert.ok(typeof status.version === 'string' && status.version.length > 0, 'expected a non-empty version string');
console.log(`system/status → ${status.status} (SonarQube ${status.version})`);

console.log(`E2E passed on Node ${process.version}`);
