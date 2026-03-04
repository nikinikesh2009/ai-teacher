/**
 * Seed test users into the `users` table.
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts [count] [emailPrefix] [password]
 *
 * Defaults:
 *   count: 100
 *   emailPrefix: "testuser"
 *   password: "password123"
 *
 * Examples:
 *   npx tsx scripts/seed-test-users.ts
 *   npx tsx scripts/seed-test-users.ts 50 demo userpass
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const countArg = process.argv[2];
  const prefixArg = process.argv[3];
  const passwordArg = process.argv[4];

  const count = Number.isFinite(Number(countArg)) && Number(countArg) > 0 ? Number(countArg) : 100;
  const emailPrefix = prefixArg && prefixArg.trim().length > 0 ? prefixArg.trim().toLowerCase() : "testuser";
  const password = passwordArg && passwordArg.length > 0 ? passwordArg : "password123";

  const { sql } = await import("../lib/db");
  const { hashPassword } = await import("../lib/auth");

  const password_hash = await hashPassword(password);

  console.log(`Seeding ${count} test users with email prefix "${emailPrefix}"...`);

  for (let i = 1; i <= count; i += 1) {
    const suffix = String(i).padStart(3, "0");
    const email = `${emailPrefix}${suffix}@example.com`;

    await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${password_hash})
      ON CONFLICT (email) DO NOTHING
    `;

    console.log(`✓ User ${i}/${count}: ${email}`);
  }

  console.log("Done seeding test users.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

