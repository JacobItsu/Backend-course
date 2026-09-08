// ============================================================================
// Station 5.
//
// Authentication middleware: establishes WHO the actor is, nothing more.
// What the actor may DO is authorization and lives in the module policies.
//
// Contract:
//   * read the Authorization header; require exactly the Bearer scheme
//     ("Basic ...", a bare token or an empty Bearer are not identities)
//     -> AppError('auth', 'AUTHENTICATION_REQUIRED', ...);
//   * verify the token with verifyToken (never just decode it);
//     any verification failure (altered, expired, wrong issuer/audience)
//     -> AppError('auth', 'INVALID_TOKEN', ...) — one same answer, the
//     response never explains which check failed;
//   * on success, build the ONLY trusted source of identity:
//       req.auth = { userId: payload.sub, role: payload.role }
//     and call next().
//
// Errors are answered here with respondError (middlewares do not reach the
// router's try/catch).
// ============================================================================
import { AppError } from '../app-error.js';
import { respondError } from '../http/respond-error.js';
import { verifyToken } from '../modules/auth/token.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  // Exactly "Bearer <token>": scheme + a single non-empty token. Anything
  // else (Basic, a bare token, an empty Bearer) is not an identity.
  if (typeof header !== 'string') {
    return respondError(res, new AppError('auth', 'AUTHENTICATION_REQUIRED',
      'A Bearer token is required.'));
  }
  const [scheme, token, ...rest] = header.split(' ');
  if (scheme !== 'Bearer' || !token || rest.length > 0) {
    return respondError(res, new AppError('auth', 'AUTHENTICATION_REQUIRED',
      'A Bearer token is required.'));
  }

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    // One generic answer: the response never explains which check failed.
    return respondError(res, new AppError('auth', 'INVALID_TOKEN',
      'The token is invalid or expired.'));
  }

  req.auth = { userId: payload.sub, role: payload.role };
  return next();
}