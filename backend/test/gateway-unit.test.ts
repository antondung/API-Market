import test from 'node:test';
import assert from 'node:assert/strict';
import { matchTemplate } from '../src/gateway-service.js';

test('matchTemplate matches single path parameter', () => {
  assert.deepEqual(matchTemplate('/weather/{city}', '/weather/Hanoi'), { city: 'Hanoi' });
  assert.deepEqual(matchTemplate('/apis/{apiId}/endpoints/{endpointId}', '/apis/10/endpoints/20'), { apiId: '10', endpointId: '20' });
});

test('matchTemplate rejects mismatched paths and traversal segments', () => {
  assert.equal(matchTemplate('/weather/{city}', '/weather'), null);
  assert.equal(matchTemplate('/weather/{city}', '/other/Hanoi'), null);
  assert.equal(matchTemplate('/weather/{city}', '/weather/a/b'), null);
  assert.equal(matchTemplate('/weather/{city}', '/weather/..%2Fsecret'), null);
  assert.equal(matchTemplate('/weather/{city}', '/weather/'), null);
});
