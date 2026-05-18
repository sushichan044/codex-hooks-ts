import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_SCHEMA_FILES } from "../../data/upstream.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoRoot = resolve(__dirname, "..", "..");
const cacheDir = join(repoRoot, "vendor", "codex-hooks-schemas");

const ref = process.env["CODEX_REF"] ?? "main";
const baseUrl = `https://raw.githubusercontent.com/openai/codex/${ref}/codex-rs/hooks/schema/generated/`;

await mkdir(cacheDir, { recursive: true });

let fetched = 0;
let failed = 0;

await Promise.all(
  SUPPORTED_SCHEMA_FILES.map(async (name) => {
    try {
      const response = await fetch(baseUrl + name);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const body = await response.text();
      await writeFile(join(cacheDir, name), body);
      fetched++;
    } catch (error) {
      failed++;
      console.error(`[error] ${name}: ${describe(error)}`);
    }
  }),
);

console.log(`\ncodex-hooks schemas — fetched: ${fetched}, failed: ${failed} (ref: ${ref})`);

if (failed > 0) {
  process.exit(1);
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
