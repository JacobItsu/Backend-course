// ============================================================================
// Stations 2, 3 and 4 live here.
//
// Contracts to honor (see docs/http-contract.md and your auth-contract.md):
//
//   register(body) -> { id, email, role: 'requester', createdAt }
//     * allowlist: only email and password may arrive. Any server-controlled
//       field present in the body (role, id, createdAt, updatedAt, createdBy,
//       passwordHash) -> AppError('contract', 'SERVER_CONTROLLED_FIELD', ...).
//       Reject explicitly — never ignore silently.
//     * email: required, basic format, normalize (trim + lowercase) BEFORE
//       storing -> AppError('contract', 'INVALID_EMAIL', ...) otherwise.
//     * password: string of 15..128 characters (Unicode and spaces allowed,
//       no arbitrary composition rules) -> AppError('contract',
//       'INVALID_PASSWORD', ...) otherwise. NEVER log it.
//     * duplicate email -> AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED',
//       'The account cannot be created with the supplied information.')
//       — generic on purpose: do not confirm that the email exists.
//       (pg raises error.code '23505' on a unique violation.)
//     * store ONLY the hash produced by hashPassword — never the password.
//
//   login(body) -> { accessToken, tokenType: 'Bearer', expiresIn: <seconds> }
//     * EVERY failure (unknown email, wrong password, anything else) answers
//       the SAME AppError('auth', 'INVALID_CREDENTIALS',
//       'Email or password is incorrect.') — identical bytes, no clues.
//     * verify with verifyPassword against the stored hash.
//
//   getCurrentUser(actor) -> { id, email, role }
//     * actor comes from req.auth (station 5). Never return password
//       material of any kind.
// ============================================================================
import { AppError } from '../../app-error.js';
import {
  hashPassword,
  verifyPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH
} from './password.js';
import { issueToken, TOKEN_TTL_SECONDS } from './token.js';
import { findByEmail, findById, insertUser } from '../users/users.store.js';
import { mapUserRow } from '../users/user.mapper.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hash of a value that no account will ever use. When the email does not
// exist, login still runs scrypt against this hash so the response timing
// does not reveal whether the account exists.
const DUMMY_HASH_PROMISE = hashPassword('__never-matches-any-account__');

export async function register(body) {
  const input = body ?? {};

  // Allowlist: only email and password may arrive. Everything else is
  // server-controlled and rejected explicitly — never ignored silently.
  for (const field of Object.keys(input)) {
    if (field !== 'email' && field !== 'password') {
      throw new AppError('contract', 'SERVER_CONTROLLED_FIELD',
        `Field "${field}" is controlled by the server.`);
    }
  }

  const { email, password } = input;
  const normalizedEmail = typeof email === 'string'
    ? email.trim().toLowerCase()
    : '';

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new AppError('contract', 'INVALID_EMAIL',
      'A valid email is required.');
  }

  const length = typeof password === 'string' ? Array.from(password).length : 0;
  if (length < PASSWORD_MIN_LENGTH || length > PASSWORD_MAX_LENGTH) {
    throw new AppError('contract', 'INVALID_PASSWORD',
      `The password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`);
  }

  // Never store what the user typed: only the derived hash.
  const passwordHash = await hashPassword(password);

  let row;
  try {
    row = await insertUser({ email: normalizedEmail, passwordHash });
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED',
        'The account cannot be created with the supplied information.');
    }
    throw error;
  }
  return mapUserRow(row);
}

export async function login(body) {
  const { email, password } = body ?? {};
  const normalizedEmail = typeof email === 'string'
    ? email.trim().toLowerCase()
    : '';

  const row = await findByEmail(normalizedEmail);

  // One verification path for every case: an unknown email still pays the
  // same scrypt cost as a wrong password, so the answer is indistinguishable.
  const verified = await verifyPassword(
    typeof password === 'string' ? password : '',
    row?.password_hash ?? (await DUMMY_HASH_PROMISE)
  );

  if (!row || !verified) {
    throw new AppError('auth', 'INVALID_CREDENTIALS',
      'Email or password is incorrect.');
  }

  const accessToken = await issueToken(mapUserRow(row));
  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: TOKEN_TTL_SECONDS
  };
}

export async function getCurrentUser(actor) {
  const row = await findById(actor.userId);
  if (!row) {
    throw new AppError('auth', 'INVALID_TOKEN',
      'The token does not match an existing account.');
  }
  return {
    id: row.id,
    email: row.email,
    role: row.role
  };
}