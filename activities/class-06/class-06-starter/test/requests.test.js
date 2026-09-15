// Requests suite: ownership, authorization and the collection contract.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { createUser, createRequestAs, createdRequestIds } from './helpers/test-data.js';
import { loginAs } from './helpers/test-auth.js';
import { cleanupCreatedData, closePool } from './helpers/cleanup.js';
import { pool } from '../src/database/pool.js';

after(async () => {
  await cleanupCreatedData();
  await closePool();
});

test('a requester can create a request and becomes its owner', async () => {
  const owner = await createUser({ name: 'owner' });
  const token = await loginAs(owner);

  const created = await createRequestAs(token, { priority: 'high' });

  assert.equal(created.createdBy, owner.id);
  assert.equal(created.status, 'open');
  assert.equal(created.priority, 'high');
});

test('the owner can read their own request', async () => {
  const owner = await createUser({ name: 'reader' });
  const token = await loginAs(owner);
  const created = await createRequestAs(token);

  const response = await request(app)
    .get(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.id, created.id);
});

test('a requester cannot access another user request', async () => {
  // Prepare
  const owner = await createUser({ name: 'victim' });
  const stranger = await createUser({ name: 'stranger' });
  const ownerToken = await loginAs(owner);
  const strangerToken = await loginAs(stranger);
  const savedRequest = await createRequestAs(ownerToken);

  // Act
  const response = await request(app)
    .get(`/requests/${savedRequest.id}`)
    .set('Authorization', `Bearer ${strangerToken}`);

  // Check
  assert.equal(response.status, 404);
});

test('a valid filter with no matches answers 200 with an empty array (BUG-106)', async () => {
  // Prepare: a fresh user with requests that are NOT closed.
  const user = await createUser({ name: 'noclosed' });
  const token = await loginAs(user);
  await createRequestAs(token, { priority: 'high' });

  // Act: filter for a status the user does not have.
  const response = await request(app)
    .get('/requests?status=closed')
    .set('Authorization', `Bearer ${token}`);

  // Check: an empty collection is NOT a missing resource.
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

test('the collection requires a Bearer token', async () => {
  const response = await request(app).get('/requests');
  assert.equal(response.status, 401);
});

test('a requester cannot change the priority, even of their own request', async () => {
  const owner = await createUser({ name: 'nopriority' });
  const token = await loginAs(owner);
  const created = await createRequestAs(token);

  const response = await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ priority: 'low' });

  assert.equal(response.status, 403);
});

test('an agent can move a request through a valid transition', async () => {
  const owner = await createUser({ name: 'transowner' });
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);

  const response = await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ status: 'in_progress' });

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'in_progress');
});

// ---------------------------------------------------------------- FEATURE-206

test('the history endpoint requires a Bearer token', async () => {
  const response = await request(app).get('/requests/1/history');
  assert.equal(response.status, 401);
});

test('the owner can read the history of their own request', async () => {
  // Prepare: the owner creates a request (a birth event is recorded).
  const owner = await createUser({ name: 'historyowner' });
  const token = await loginAs(owner);
  const created = await createRequestAs(token);

  // Act
  const response = await request(app)
    .get(`/requests/${created.id}/history`)
    .set('Authorization', `Bearer ${token}`);

  // Check
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].type, 'status_changed');
  assert.equal(response.body[0].fromStatus, null);
  assert.equal(response.body[0].toStatus, 'open');
});

test('a stranger gets the same 404 as a missing request on history', async () => {
  // Prepare
  const owner = await createUser({ name: 'histvictim' });
  const stranger = await createUser({ name: 'histstranger' });
  const ownerToken = await loginAs(owner);
  const strangerToken = await loginAs(stranger);
  const created = await createRequestAs(ownerToken);

  // Act
  const foreign = await request(app)
    .get(`/requests/${created.id}/history`)
    .set('Authorization', `Bearer ${strangerToken}`);
  const missing = await request(app)
    .get('/requests/999999999/history')
    .set('Authorization', `Bearer ${strangerToken}`);

  // Check: same shape, existence is not revealed.
  assert.equal(foreign.status, 404);
  assert.equal(missing.status, 404);
  assert.equal(foreign.body.error.code, 'REQUEST_NOT_FOUND');
  assert.equal(foreign.body.error.code, missing.body.error.code);
});

test('an agent can read the history of any request', async () => {
  // Prepare
  const owner = await createUser({ name: 'histagentowner' });
  const agent = await createUser({ name: 'histagent', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);

  // Act
  const response = await request(app)
    .get(`/requests/${created.id}/history`)
    .set('Authorization', `Bearer ${agentToken}`);

  // Check
  assert.equal(response.status, 200);
  assert.equal(response.body.length, 1);
});

test('a missing request answers 404 on history', async () => {
  const user = await createUser({ name: 'histmissing' });
  const token = await loginAs(user);

  const response = await request(app)
    .get('/requests/999999999/history')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'REQUEST_NOT_FOUND');
});

test('history events are ordered oldest first', async () => {
  // Prepare: owner creates, agent changes status then priority.
  const owner = await createUser({ name: 'historderowner' });
  const agent = await createUser({ name: 'historderagent', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);

  await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ status: 'in_progress' });
  await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ priority: 'high' });

  // Act
  const response = await request(app)
    .get(`/requests/${created.id}/history`)
    .set('Authorization', `Bearer ${ownerToken}`);

  // Check: birth first, then status, then priority; times ascending.
  assert.equal(response.body.length, 3);
  assert.equal(response.body[0].type, 'status_changed');
  assert.equal(response.body[0].fromStatus, null);
  assert.equal(response.body[1].type, 'status_changed');
  assert.equal(response.body[1].toStatus, 'in_progress');
  assert.equal(response.body[2].type, 'priority_changed');
  assert.equal(response.body[2].toPriority, 'high');

  const times = response.body.map((e) => new Date(e.createdAt).getTime());
  const sorted = [...times].sort((a, b) => a - b);
  assert.deepEqual(times, sorted);
});

test('a request without events answers 200 with []', async () => {
  // Prepare: a request inserted directly in SQL has NO birth event, so its
  // history is genuinely empty.
  const user = await createUser({ name: 'histempty' });
  const token = await loginAs(user);

  const inserted = await pool.query(
    `INSERT INTO requests (title, description, priority, status, created_by)
     VALUES ($1, NULL, 'medium', 'open', $2)
     RETURNING id`,
    ['class06-test history-empty request', user.id]
  );
  createdRequestIds.push(inserted.rows[0].id);

  // Act
  const response = await request(app)
    .get(`/requests/${inserted.rows[0].id}/history`)
    .set('Authorization', `Bearer ${token}`);

  // Check
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});
