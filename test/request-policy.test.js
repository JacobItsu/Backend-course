// Policy tests. This is the payoff of the whole class: canClaimRequest
// depends on nothing, so its entire behavior matrix runs here with plain
// objects. No HTTP. No PostgreSQL. No server.
import test from 'node:test';
import assert from 'node:assert/strict';
import { canClaimRequest } from '../src/modules/requests/request.policy.js';

// Plain actors: the policy only knows the role and the user id.
const agent = { role: 'agent', userId: 'agent-id' };
const requester = { role: 'requester', userId: 'requester-id' };

// Plain request representations: exactly what the mapper produces.
function request(overrides = {}) {
  return {
    id: 1,
    status: 'open',
    assignedTo: null,
    ...overrides
  };
}

test('an agent can claim an open, unassigned request', () => {
  const result = canClaimRequest({ actor: agent, request: request() });
  assert.deepEqual(result, { allowed: true });
});

test('a requester cannot claim, even an open request', () => {
  const result = canClaimRequest({ actor: requester, request: request() });
  assert.deepEqual(result, { allowed: false, reason: 'NOT_AGENT' });
});

test('an already assigned request cannot be claimed again', () => {
  const result = canClaimRequest({
    actor: agent,
    request: request({ assignedTo: 'another-agent' })
  });
  assert.deepEqual(result, { allowed: false, reason: 'ALREADY_ASSIGNED' });
});

test('a request that is not open cannot be claimed', () => {
  for (const status of ['in_progress', 'resolved', 'closed', 'cancelled']) {
    const result = canClaimRequest({ actor: agent, request: request({ status }) });
    assert.deepEqual(result, { allowed: false, reason: 'NOT_OPEN' },
      `status "${status}" must not be claimable`);
  }
});

test('the role rule wins over the state rules', () => {
  // A requester aiming at an already assigned request must report
  // NOT_AGENT: the caller answers 403 before any state conflict.
  const result = canClaimRequest({
    actor: requester,
    request: request({ status: 'in_progress', assignedTo: 'another-agent' })
  });
  assert.deepEqual(result, { allowed: false, reason: 'NOT_AGENT' });
});