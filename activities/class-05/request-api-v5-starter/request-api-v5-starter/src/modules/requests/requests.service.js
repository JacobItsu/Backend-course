// ============================================================================
// Stations 6 and 7.
//
//   * every exported operation receives the actor first:
//       listRequests(actor, filters) · getRequest(actor, id)
//       createRequest(actor, input) · patchRequest(actor, id, body)
//       getHistory(actor, id)
//   * reject server-controlled fields explicitly (400 SERVER_CONTROLLED_FIELD):
//       id, createdBy, createdAt, updatedAt, changedBy — and status on POST;
//   * createRequest: createdBy = actor.userId (never from the body); the
//     birth history records the creator as changed_by;
//   * listRequests: requester -> scope with { createdBy: actor.userId } in
//     the store call; agent -> everything;
//   * getRequest/getHistory: a foreign request answers the SAME 404 as a
//     missing one (do not reveal existence);
//   * patchRequest: apply the policy BEFORE writing, all-or-nothing (a
//     mixed body with a forbidden field changes NOTHING -> 403), and pass
//     actor.userId as changedBy to insertStatusHistory;
//   * the class 3-4 rules stay: terminal states and transitions keep
//     answering 409 — for every role.
// ============================================================================

import { withTransaction } from '../../database/transaction.js';
import {
  findAll,
  findById,
  insertRequest,
  updateRequest,
  insertStatusHistory,
  findHistory
} from './requests.store.js';
import { mapRequestRow, mapHistoryRow } from './request.mapper.js';
import { STATUSES, isValidStatus, isTerminal, canTransition } from './request-status.js';
import {
  canListAllRequests,
  canViewRequest,
  canViewHistory,
  canCreateRequest,
  canEditContent,
  canChangePriority,
  canChangeStatus
} from './request.policy.js';
import { AppError } from '../../app-error.js';

const PRIORITIES = ['low', 'medium', 'high'];
const UPDATABLE_FIELDS = ['title', 'description', 'priority', 'status'];

// Fields the server owns. If any arrives in a body, the request is rejected
// explicitly — never silently ignored.
const CREATE_SERVER_CONTROLLED = ['id', 'createdBy', 'createdAt', 'updatedAt', 'changedBy', 'status'];
const PATCH_SERVER_CONTROLLED = ['id', 'createdBy', 'createdAt', 'updatedAt', 'changedBy'];

function assertValidPriority(priority) {
  if (!PRIORITIES.includes(priority)) {
    throw new AppError('contract', 'INVALID_PRIORITY',
      `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }
}

function assertNoServerControlledFields(body, controlledFields) {
  for (const field of controlledFields) {
    if (body?.[field] !== undefined) {
      throw new AppError('contract', 'SERVER_CONTROLLED_FIELD',
        `Field "${field}" is controlled by the server.`);
    }
  }
}

export async function listRequests(actor, filters) {
  if (filters.status !== undefined && !isValidStatus(filters.status)) {
    throw new AppError('contract', 'INVALID_FILTER',
      `Unknown status "${filters.status}". Valid values: ${STATUSES.join(', ')}.`);
  }
  if (filters.priority !== undefined && !PRIORITIES.includes(filters.priority)) {
    throw new AppError('contract', 'INVALID_FILTER',
      `Unknown priority "${filters.priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }

  // The ownership scope lives in SQL: requester sees only what they own;
  // agent sees the whole collection (legacy rows included).
  const scope = canListAllRequests(actor)
    ? {}
    : { createdBy: actor.userId };
  const rows = await findAll({ ...filters, ...scope });
  return rows.map(mapRequestRow);
}

export async function getRequest(actor, id) {
  const row = await findById(id);
  // A foreign request answers exactly like a missing one — same code, same
  // message — so the API never reveals that the resource exists.
  if (!row) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }
  const representation = mapRequestRow(row);
  if (!canViewRequest(actor, representation)) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }
  return representation;
}

export async function getHistory(actor, id) {
  const request = await findById(id);
  // The policy works over the mapped representation (createdBy camelCase).
  if (!request || !canViewHistory(actor, mapRequestRow(request))) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }
  const rows = await findHistory(id);
  return rows.map(mapHistoryRow);
}

export async function createRequest(actor, input) {
  assertNoServerControlledFields(input, CREATE_SERVER_CONTROLLED);

  if (!canCreateRequest(actor)) {
    throw new AppError('forbidden', 'FORBIDDEN',
      'Only requesters can create requests.');
  }

  const { title, description, priority } = input ?? {};

  if (typeof title !== 'string' || title.trim() === '') {
    throw new AppError('contract', 'TITLE_REQUIRED', 'A request needs a non-empty title.');
  }
  if (priority !== undefined) assertValidPriority(priority);

  // Creation is a unit of work: the request AND its birth history
  // (NULL -> open, changed_by = the creator) happen together or not at all.
  const row = await withTransaction(async (client) => {
    const created = await insertRequest({
      title: title.trim(),
      description: typeof description === 'string' ? description : null,
      priority: priority ?? 'medium',
      createdBy: actor.userId
    }, client);
    await insertStatusHistory(created.id, null, created.status, actor.userId, client);
    return created;
  });

  return mapRequestRow(row);
}

export async function patchRequest(actor, id, body) {
  assertNoServerControlledFields(body, PATCH_SERVER_CONTROLLED);

  const changes = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body?.[field] !== undefined) changes[field] = body[field];
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError('contract', 'NO_UPDATABLE_FIELDS',
      `The body must include at least one of: ${UPDATABLE_FIELDS.join(', ')}.`);
  }
  if (changes.title !== undefined && (typeof changes.title !== 'string' || changes.title.trim() === '')) {
    throw new AppError('contract', 'TITLE_REQUIRED', 'The title cannot be empty.');
  }
  if (changes.priority !== undefined) assertValidPriority(changes.priority);
  if (changes.status !== undefined && !isValidStatus(changes.status)) {
    throw new AppError('contract', 'INVALID_STATUS',
      `Unknown status "${changes.status}". Valid values: ${STATUSES.join(', ')}.`);
  }
  if (changes.title !== undefined) changes.title = changes.title.trim();

  // Authorization is all-or-nothing: the whole change must be allowed, or
  // none of it runs. The policy is checked before any write.
  function assertFieldsAllowed(actorForCheck, current) {
    for (const field of Object.keys(changes)) {
      let allowed = false;
      if (field === 'title' || field === 'description') {
        allowed = canEditContent(actorForCheck, current);
      } else if (field === 'priority') {
        allowed = canChangePriority(actorForCheck);
      } else if (field === 'status') {
        allowed = canChangeStatus(actorForCheck);
      }
      if (!allowed) {
        throw new AppError('forbidden', 'FORBIDDEN',
          'This change is not allowed for your role.');
      }
    }
  }

  // Read, authorize, validate against the current state, write and record
  // history — all with the same client, as one unit of work.
  const row = await withTransaction(async (client) => {
    const current = await findById(id, client);
    if (!current) {
      throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
    }

    // Policies consume the mapped representation (createdBy camelCase),
    // never the raw SQL row.
    assertFieldsAllowed(actor, mapRequestRow(current));

    if (isTerminal(current.status)) {
      throw new AppError('domain', 'REQUEST_IN_TERMINAL_STATUS',
        `Request ${id} is ${current.status} and can no longer be modified.`);
    }

    const statusChanges = changes.status !== undefined && changes.status !== current.status;
    if (statusChanges && !canTransition(current.status, changes.status)) {
      throw new AppError('domain', 'INVALID_STATUS_TRANSITION',
        `A request cannot move from ${current.status} to ${changes.status}.`);
    }

    const updated = await updateRequest(id, changes, client);
    if (statusChanges) {
      await insertStatusHistory(id, current.status, changes.status, actor.userId, client);
    }
    return updated;
  });

  return mapRequestRow(row);
}