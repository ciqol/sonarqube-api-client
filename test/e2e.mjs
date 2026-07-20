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

// The throwaway SonarQube instance has no analysed project, so exercise the
// measures endpoints against a component that does not exist. This validates the
// full request path (URL + query-string serialization + auth + error handling)
// end to end: the client must surface a SonarError with HTTP 404.
const missingComponent = 'sonarqube-api-client-e2e-does-not-exist';

await assert.rejects(
  () => sonar.api.measures.component({ component: missingComponent, metricKeys: 'ncloc,complexity' }),
  (err) => {
    assert.equal(err.status, 404, `expected measures/component to reject with status 404, got '${err.status}'`);
    return true;
  },
  'expected measures/component to reject for an unknown component',
);
console.log('measures/component → 404 for unknown component (as expected)');

await assert.rejects(
  () => sonar.api.measures.component_tree({ component: missingComponent, metricKeys: 'ncloc' }),
  (err) => {
    assert.equal(err.status, 404, `expected measures/component_tree to reject with status 404, got '${err.status}'`);
    return true;
  },
  'expected measures/component_tree to reject for an unknown component',
);
console.log('measures/component_tree → 404 for unknown component (as expected)');

await assert.rejects(
  () => sonar.api.measures.search_history({ component: missingComponent, metrics: 'ncloc' }),
  (err) => {
    assert.equal(err.status, 404, `expected measures/search_history to reject with status 404, got '${err.status}'`);
    return true;
  },
  'expected measures/search_history to reject for an unknown component',
);
console.log('measures/search_history → 404 for unknown component (as expected)');

console.log(`E2E passed on Node ${process.version}`);
