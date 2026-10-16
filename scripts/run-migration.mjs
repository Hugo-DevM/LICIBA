// Aplica un archivo de migración SQL directo contra Supabase Postgres.
// Uso: node scripts/run-migration.mjs supabase/migrations/0012_xxx.sql
import { readFileSync } from "node:fs";
import { Client } from "pg";
// Cargar env vars con: node --env-file=.env.local scripts/run-migration.mjs ...

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/run-migration.mjs <ruta-al-archivo-sql>");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

await client.connect();
try {
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log(`Migración aplicada: ${file}`);
} catch (err) {
  await client.query("rollback");
  console.error("Error aplicando migración, se revirtió:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
