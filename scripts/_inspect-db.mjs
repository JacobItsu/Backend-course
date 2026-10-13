import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const localEnv = path.resolve(process.cwd(), '.env');
const fallback = path.resolve(process.cwd(), '../class-05/request-api-v5-starter/request-api-v5-starter/.env');
dotenv.config({ path: fs.existsSync(localEnv) ? localEnv : fallback });
console.log('ENV_SOURCE', fs.existsSync(localEnv) ? 'class-08-starter/.env' : 'class-05 fallback');

const original = process.env.DATABASE_URL;
const url = new URL(original);
const candidates = [];
candidates.push(['original', original]);
// Same host, session port 5432 (pooler) with the same user.
const session = new URL(original); session.port = '5432';
candidates.push(['pooler-5432', session.toString()]);
// Direct host (db.<ref>.supabase.co) built from the pooler user ref.
const ref = url.username.split('.')[1];
if (ref) {
  const direct = new URL(original);
  direct.hostname = `db.${ref}.supabase.co`;
  direct.port = '5432';
  direct.username = 'postgres';
  candidates.push(['direct-5432', direct.toString()]);
}

const pg = (await import('pg')).default;
for (const [label, conn] of candidates) {
  const client = new pg.Client({ connectionString: conn, connectionTimeoutMillis: 12000 });
  try {
    await client.connect();
    const info = await client.query(
      `SELECT to_regclass('public.schema_migrations') AS ledger,
              to_regclass('public.users') AS users,
              to_regclass('public.requests') AS requests,
              to_regclass('public.request_history') AS history`
    );
    let migrations = [];
    if (info.rows[0].ledger) {
      migrations = (await client.query('SELECT name FROM schema_migrations ORDER BY name')).rows.map((r) => r.name);
    }
    let cols = [];
    if (info.rows[0].requests) {
      cols = (await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name='requests' ORDER BY ordinal_position`
      )).rows.map((r) => r.column_name);
    }
    console.log(label, 'OK');
    console.log(JSON.stringify({ info: info.rows[0], migrations, requestColumns: cols }, null, 2));
    await client.end();
    process.exit(0);
  } catch (error) {
    console.log(label, 'FAIL', error.code || '', error.message || '');
    try { await client.end(); } catch {}
  }
}
process.exit(1);