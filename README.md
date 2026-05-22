# codex-hooks-ts

Type-safe hooks for the OpenAI Codex CLI, written in TypeScript. Define a hook with
`defineHook`, hand it to `runHook`, and the library handles stdin parsing, runtime
validation via [valibot](https://valibot.dev/), and the stdout / exit-code conventions
documented by Codex.

The shape of every Codex hook event (input + output) is kept in sync with the upstream
JSON Schemas at
[`openai/codex/codex-rs/hooks/schema/generated`](https://github.com/openai/codex/tree/main/codex-rs/hooks/schema/generated)
through a code-generation step that produces a regression test against the library's
hand-written types.

## Install

```sh
pnpm add codex-hooks-ts
```

The package ships as ESM and targets Node.js 22+.

## Quick start

```ts
// session-start.ts
import { defineHook, runHook } from "codex-hooks-ts";

const hook = defineHook({
  trigger: { SessionStart: true },
  run: (context) => {
    return context.success({
      additionalContext: `Session ${context.input.session_id} started from ${context.input.source}.`,
    });
  },
});

await runHook(hook);
```

Wire it up in `~/.codex/hooks.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "node ./session-start.ts"
          }
        ]
      }
    ]
  }
}
```

Codex calls the command with one JSON object on stdin. The library reads it, validates
it, then invokes the handler. The `additionalContext` you return is written to stdout
and added as extra developer context for the current session.

## Block a tool call

`PreToolUse`, `PostToolUse`, and `PermissionRequest` are tool-aware events. Narrow the
trigger to a tool name and the input is typed accordingly:

```ts
import { defineHook, runHook } from "codex-hooks-ts";

const guard = defineHook({
  trigger: { PreToolUse: { Bash: true } },
  run: (context) => {
    // context.input.tool_input is typed as BashToolInput.
    const { command } = context.input.tool_input;

    if (/rm\s+-rf\s+\//.test(command)) {
      return context.json({
        event: "PreToolUse",
        output: {
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: "Refusing destructive rm command.",
          },
        },
      });
    }

    return context.success();
  },
});

await runHook(guard);
```

You can also use the shorter `context.blockingError("...")` form, which exits with
code 2 and writes the reason to stderr — Codex feeds that back to the model.

## Add MCP tool types

`ToolSchema` is an interface, so you can extend it via declaration merging to teach the
library about MCP tools or any custom Codex tool you expose:

```ts
declare module "codex-hooks-ts" {
  interface ToolSchema {
    mcp__filesystem__read_file: {
      input: { path: string };
      response: { content: string };
    };
  }
}

const hook = defineHook({
  trigger: { PreToolUse: { mcp__filesystem__read_file: true } },
  run: (context) => {
    // context.input.tool_input is { path: string }
    const { path } = context.input.tool_input;
    return context.success();
  },
});
```

## Response helpers

`HookContext` exposes four helpers that map onto Codex's exit-code / stdout protocol:

| Helper                               | Exit code | stdout / stderr                                                                   |
| ------------------------------------ | --------- | --------------------------------------------------------------------------------- |
| `context.success(payload?)`          | `0`       | Plain text on stdout for `SessionStart` and `UserPromptSubmit`, ignored otherwise |
| `context.blockingError(reason)`      | `2`       | `reason` on stderr; Codex feeds it back to the model                              |
| `context.nonBlockingError(message?)` | `1`       | `message` on stderr; Codex continues normally                                     |
| `context.json(payload)`              | `0`       | Structured JSON on stdout (the typed `output` of the subscribed event)            |

The `decision: "block"` / `reason` legacy form is also supported by `context.json` for
events where Codex accepts it.

## Following upstream

The Codex JSON Schemas evolve. The repository keeps the upstream snapshot under
`vendor/codex-hooks-schemas/` (gitignored) and a generated TypeScript mirror under
`src/generated/upstream.ts` (also gitignored). The regression test in
`src/hooks/input/schemas.test-d.ts` and `src/hooks/output/index.test-d.ts` compares the
hand-written types against this mirror, so any upstream change shows up as a type
error rather than silently rotting.

To refresh the snapshot locally:

```sh
pnpm sync-upstream         # fetch + generate
pnpm sync-upstream:fetch   # only refetch the JSON Schemas
pnpm sync-upstream:generate # only regenerate src/generated/upstream.ts
```

By default the fetcher pulls from the `main` branch of `openai/codex`. Set
`CODEX_REF` to pin a different ref (tag, branch, or SHA):

```sh
CODEX_REF=v0.0.0 pnpm sync-upstream:fetch
```

## Quality gate

```sh
pnpm run check  # format check + lint + tests (incl. .test-d.ts typecheck) + build
```

## License

MIT
