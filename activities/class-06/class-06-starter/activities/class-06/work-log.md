# Class 06 work log

## Environment

What did I configure?
- `DATABASE_URL`: copied from the Supabase Connect dialog (Session pooler
  string, `aws-0-us-east-1.pooler.supabase.com`). Never typed by hand.
- `JWT_SECRET`: generated with `npm run generate:secret` and pasted into `.env`.
- `PORT=3000`.
- Both secrets live only in `.env` (gitignored); the doctor and the tests
  load them through `dotenv`.

Which command confirmed that it worked?
- `npm run class-06:doctor` → 10/10 PASS, "Environment ready."
- First run (before migrations) showed the connection worked but the schema
  was missing; after `db:migrate` + `db:seed` everything turned green.

## Request flow

Where does the request enter?
- Express app in `src/app.js`, which mounts middlewares and the module
  routers. Requests for `/requests/*` pass through `corsPolicy →
  express.json → authenticate → requestsRoutes`.

Where is authentication checked?
- In `src/middleware/authenticate.js`: it requires a `Bearer` token, verifies
  it with `jose` (signature, issuer, audience, expiry), and builds
  `req.auth = { userId, role }`. The whole `/requests` router sits behind it.

Where is authorization checked?
- In `src/modules/requests/request.policy.js`: pure functions that decide WHAT
  an actor may do (`canViewRequest`, `canCreateRequest`, `canChangeStatus`,
  ...). The service calls them. For FEATURE-206 the history falls under the
  same visibility rule as viewing the request itself.

Where is PostgreSQL accessed?
- `src/database/pool.js` owns the single shared pool; `requests.store.js` and
  `users.store.js` run parameterized queries. Users.getRequestHistory reads
  through `findHistory` in the requests store.

## Bug fixed

What was happening?
- `GET /requests?status=closed` (a valid filter with no matches) answered
  `404 REQUEST_NOT_FOUND`. `listRequests` threw an AppError when the query
  returned zero rows.

What should happen?
- A valid collection filter with no matches answers `200 OK` with `[]`. An
  empty collection is not a missing resource; `404` is only for an individual
  request that does not exist (or must not be revealed).

Which file did I modify?
- `src/modules/requests/requests.service.js`: removed the
  `if (rows.length === 0) throw ...` branch in `listRequests`.

Which test protects the behavior?
- `test/requests.test.js` → "a valid filter with no matches answers 200 with
  an empty array (BUG-106)": a fresh user with an open request filters by
  `status=closed` and asserts `200` + `[]`.

## Feature implemented

What does GET /requests/:id/history do?
- Returns the history of a request as a JSON array with one object per event:
  `type` (`status_changed` / `priority_changed`), the relevant
  `from*`/`to*` fields for that type, and `createdAt`. Each event exposes only
  its own fields; `changed_by` never leaves the store layer.

Who can use it?
- Any authenticated user. A requester can read the history of their OWN
  requests (verified in the service against the request owner). A foreign
  request answers the same `404 REQUEST_NOT_FOUND` as a missing one, exactly
  like `GET /requests/:id`. An agent can read any history.

How is the result ordered?
- Oldest first. The SQL orders by `created_at, id` — the `id` is the stable
  tie-breaker when two events share the same timestamp (index
  `idx_request_history_request_order` matches this access pattern).

## Test explained

Chosen test: "history events are ordered oldest first".

What data does it prepare?
- A requester (owner) and an agent (role promoted to 'agent' on their own
  synthetic user). The owner creates a request (birth event), the agent then
  PATCHes `status: in_progress` and `priority: high` (two more events).

What action does it perform?
- `GET /requests/:id/history` with the owner's token.

What does it check?
- Length 3; event[0] is the birth `status_changed` with `fromStatus: null`;
  event[1] is the status change; event[2] is `priority_changed` with
  `toPriority: 'high'`. It also converts `createdAt` to epoch and asserts the
  array is sorted ascending.

Which rule does it protect?
- Ticket rule 7: events are ordered oldest first with a stable rule on equal
  timestamps — the history reads as the story of the request.

## AI assistance

What did AI help me understand?
- The layering of the codebase (routes→service→policy→store→DB) and that the
  history endpoint should reuse the EXISTING visibility policy instead of
  inventing a new rule.
- Which pieces already existed before the ticket: `canViewHistory`,
  `findHistory` and `mapHistoryEventRow` were already in the code, so the
  feature was mostly wiring plus the route.

What code did it help produce?
- The `getRequestHistory` service function, the `/:id/history` route, and the
  feature tests. It also fixed the Windows-only `npm test` glob by removing
  the single quotes so the Node 24 test runner expands `test/*.test.js`.

What did I verify myself?
- The HTTP statuses and error codes in the ticket (401/404/200), the
  ownership rule, the ordering, the `[]` case for an event-less request, and
  that `PATCH` records the events the history depends on.

What suggestion was incorrect or incomplete?
- An initial test for "request without events" created the request via the
  API, which ALWAYS records a birth event — so the history was never empty.
  I rewrote it to insert the request directly in SQL, which yields a genuinely
  empty history and asserts `200 []`.

## Remaining doubt

What part do I still not understand?
- The exact Express 5 routing precedence for `/:id` vs `/:id/history` in
  every edge case: I declared the history route first to be safe, but I would
  like to confirm whether order matters with path-to-regexp v8 in Express 5
  for overlap like `/1/history` vs `/1`.