import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { JSONSchema } from "json-schema-to-typescript";
import { compile } from "json-schema-to-typescript";
import { SCHEMA_FILE_TO_EVENT } from "../../data/upstream.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoRoot = resolve(__dirname, "..", "..");
const schemasDir = join(repoRoot, "vendor", "codex-hooks-schemas");
const outputFile = join(repoRoot, "src", "generated", "upstream.ts");

interface SchemaEntry {
  event: string;
  kind: "input" | "output";
  typeName: string;
  schema: JSONSchema;
}

const files = (await readdir(schemasDir)).filter((name) => name.endsWith(".schema.json"));

const entries: SchemaEntry[] = [];
await Promise.all(
  files.map(async (name) => {
    const event = SCHEMA_FILE_TO_EVENT[name as keyof typeof SCHEMA_FILE_TO_EVENT];
    if (!event) {
      throw new Error(`unsupported schema file (no matching event): ${name}`);
    }
    const kind = name.endsWith(".input.schema.json")
      ? "input"
      : name.endsWith(".output.schema.json")
        ? "output"
        : null;
    if (!kind) {
      throw new Error(`unsupported schema file (unrecognized kind): ${name}`);
    }

    const raw = await readFile(join(schemasDir, name), "utf8");
    const schema = JSON.parse(raw) as JSONSchema;
    const typeName = `${event}Command${kind === "input" ? "Input" : "Output"}`;
    entries.push({ event, kind, typeName, schema });
  }),
);

entries.sort((a, b) => a.typeName.localeCompare(b.typeName));

const compiled: string[] = [];
const seenDeclarations = new Set<string>();
await Promise.all(
  entries.map(async (entry) => {
    const ts = await compile(entry.schema, entry.typeName, {
      additionalProperties: false,
      bannerComment: "",
      declareExternallyReferenced: true,
      style: { semi: true },
      unknownAny: true,
    });
    for (const block of splitTopLevelBlocks(ts.trim())) {
      const name = extractDeclarationName(block);
      if (name != null && seenDeclarations.has(name)) {
        continue;
      }
      if (name != null) {
        seenDeclarations.add(name);
      }
      compiled.push(block);
    }
  }),
);

function splitTopLevelBlocks(source: string): string[] {
  const lines = source.split("\n");
  const blocks: string[] = [];
  let depth = 0;
  let buffer: string[] = [];
  const flush = () => {
    const block = buffer.join("\n").trim();
    if (block !== "") blocks.push(block);
    buffer = [];
  };
  for (const line of lines) {
    const isDeclStart = depth === 0 && /^\s*(export\s+)?(interface|type)\s/.test(line);
    if (isDeclStart && buffer.length > 0) {
      flush();
    }
    buffer.push(line);
    for (const char of line) {
      if (char === "{") depth++;
      else if (char === "}") depth--;
    }
  }
  flush();
  return blocks;
}

function extractDeclarationName(block: string): string | null {
  const match = block.match(/^export (?:interface|type) (\w+)/m);
  return match?.[1] ?? null;
}

const inputMembers = entries
  .filter((e) => e.kind === "input")
  .sort((a, b) => a.event.localeCompare(b.event))
  .map((e) => `  ${e.event}: ${e.typeName};`)
  .join("\n");

const outputMembers = entries
  .filter((e) => e.kind === "output")
  .sort((a, b) => a.event.localeCompare(b.event))
  .map((e) => `  ${e.event}: ${e.typeName};`)
  .join("\n");

const lines = [
  "// THIS FILE IS GENERATED — DO NOT EDIT.",
  "// Run `pnpm generate-upstream` after `pnpm sync-upstream` to refresh.",
  "/* eslint-disable */",
  "",
  compiled.join("\n\n"),
  "",
  "/**",
  " * Map of input payload types per Codex hook event, derived from the",
  " * vendored upstream JSON Schemas. The regression test compares this against",
  " * the library's hand-written types so any upstream change is surfaced as a",
  " * type error without requiring new tests.",
  " */",
  "export interface UpstreamHookInputs {",
  inputMembers,
  "}",
  "",
  "export interface UpstreamHookOutputs {",
  outputMembers,
  "}",
  "",
];

await writeFile(outputFile, lines.join("\n"));

console.log(`wrote ${outputFile} (${entries.length} schemas)`);
