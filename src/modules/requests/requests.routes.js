// HTTP layer of the requests module: it extracts path, query, body and
// the authenticated actor, invokes the operation and answers. It contains
// no SQL and no domain rules — with ONE exception that the team inherited
// and nobody has dared to touch: the history handler grew until it did
// everything by itself. It works. Every test passes. And still, something
// is wrong with it — that is this week's conversation.

import express from 'express';
import {
  listRequests,
  getRequest,
  getRequestHistory,
  createRequest,
  patchRequest,
  claimRequest
} from './requests.service.js';
import { parseIdParam } from '../../http/parse-id.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { status, priority } = req.query;
  res.status(200).json(await listRequests(req.auth, { status, priority }));
});

router.get('/:id', async (req, res) => {
  const id = parseIdParam(req.params.id);
  res.status(200).json(await getRequest(req.auth, id));
});

// Refactored from the "handler that did EVERYTHING": the route now only
// validates the path parameter, delegates to the service and answers. The
// visibility rule, the SQL and the mapping live in their own layers.
router.get('/:id/history', async (req, res) => {
  const id = parseIdParam(req.params.id);
  res.status(200).json(await getRequestHistory(req.auth, id));
});

// FEATURE-801 — the new business action. Thin route: validate the id,
// read the authenticated actor, call the service, answer 200.
router.post('/:id/claim', async (req, res) => {
  const id = parseIdParam(req.params.id);
  res.status(200).json(await claimRequest(req.auth, id, req.body));
});

router.post('/', async (req, res) => {
  res.status(201).json(await createRequest(req.auth, req.body));
});

router.patch('/:id', async (req, res) => {
  const id = parseIdParam(req.params.id);
  res.status(200).json(await patchRequest(req.auth, id, req.body));
});

export default router;
