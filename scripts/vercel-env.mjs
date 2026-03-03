import { spawn } from "child_process";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

function parseEnv(content) {
  const vars = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return vars;
}

function addEnv(name, value, env) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "npx",
      ["vercel", "env", "add", name, env],
      { stdio: ["pipe", "inherit", "inherit"], shell: true }
    );
    proc.stdin.write(value);
    proc.stdin.end();
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`vercel env add ${name} ${env} exited ${code}`))
    );
  });
}

async function main() {
  let content;
  try {
    content = readFileSync(envPath, "utf-8");
  } catch {
    console.error(".env.local not found");
    process.exit(1);
  }

  const vars = parseEnv(content);
  const required = ["DATABASE_URL", "JWT_SECRET"];
  for (const name of required) {
    const value = vars[name];
    if (!value) {
      console.error(`Missing ${name} in .env.local`);
      process.exit(1);
    }
    for (const env of ["production", "preview"]) {
      console.log(`Adding ${name} (${env})...`);
      await addEnv(name, value, env);
    }
  }
  console.log("✓ Vercel env vars set");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
