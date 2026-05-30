const assert = require('node:assert/strict');
const { createClient } = require('sonarqube-api-client');

assert.equal(typeof createClient, 'function', 'createClient must be exported as a function');

const client = createClient({ baseURL: 'http://sonarqube.example/', token: 'smoke-token' });

assert.equal(typeof client, 'object', 'createClient must return a client object');
assert.equal(typeof client.request, 'function', 'client must expose a request() method');
assert.equal(typeof client.api, 'object', 'client must expose an api surface');

console.log(`CJS smoke passed on Node ${process.version}`);
