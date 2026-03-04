/**
 * Seed the first admin user. Run after admin-setup.sql.
 * Usage: npx tsx scripts/seed-admin.ts [email] [password]
 * Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local.
 *
 * Loads .env.local before DB so DATABASE_URL is set.
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
  const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/seed-admin.ts <email> <password>");
    console.error("Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");
    process.exit(1);
  }

  const { sql } = await import("../lib/db");
  const { hashPassword } = await import("../lib/adminAuth");

  const trimmed = String(email).trim().toLowerCase();
  const password_hash = await hashPassword(password);

  await sql`
    INSERT INTO admins (email, password_hash, role)
    VALUES (${trimmed}, ${password_hash}, 'admin')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;
  console.log("✓ Admin user created/updated:", trimmed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
