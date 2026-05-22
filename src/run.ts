import process from "node:process";

import getStdin from "get-stdin";
import * as v from "valibot";

import type { HookResponse } from "./context.ts";
import { createContext } from "./context.ts";
import type { HookDefinition } from "./define.ts";
import type { SupportedHookEvent } from "./hooks/index.ts";
import { HookInputSchemas } from "./hooks/index.ts";
import type { ExtractTriggeredHookInput, HookTrigger } from "./types.ts";
import { isNonEmptyString } from "./utils/string.ts";

/**
 * Run a Codex hook end-to-end. Reads JSON from stdin, validates it against the trigger's Valibot
 * schema, invokes the handler, and translates the result into the appropriate stdout / stderr /
 * exit code combination defined by the Codex hooks protocol.
 *
 * @example
 *   import { defineHook, runHook } from "codex-hooks-ts";
 *
 *   const hook = defineHook({
 *     trigger: { Stop: true },
 *     run: (context) => context.success(),
 *   });
 *
 *   await runHook(hook);
 */
export async function runHook<THookTrigger extends HookTrigger = HookTrigger>(
  def: HookDefinition<THookTrigger>,
): Promise<void> {
  const { run, trigger } = def;

  // null means we never reached a parsed event name (failed before parsing).
  let eventName: SupportedHookEvent | null = null;

  try {
    const stdin = await getStdin();

    const inputSchema = extractInputSchemaFromTrigger(trigger);
    const parsed = v.parse(inputSchema, JSON.parse(stdin)) as {
      hook_event_name: SupportedHookEvent;
    };
    eventName = parsed.hook_event_name;

    const context = createContext(parsed as ExtractTriggeredHookInput<THookTrigger>);

    const result = await run(context);

    return handleHookResult(eventName, result);
  } catch (error) {
    return handleHookResult(eventName, {
      kind: "non-blocking-error",
      payload: `Error in hook: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

function handleHookResult<THookTrigger extends HookTrigger>(
  eventName: SupportedHookEvent | null,
  hookResult: HookResponse<THookTrigger>,
): void {
  switch (hookResult.kind) {
    case "blocking-error": {
      if (isNonEmptyString(hookResult.payload)) {
        console.error(hookResult.payload);
      }
      return process.exit(2);
    }

    case "json-sync": {
      console.log(JSON.stringify(hookResult.payload.output));
      return process.exit(0);
    }

    case "non-blocking-error": {
      if (isNonEmptyString(hookResult.payload)) {
        console.error(hookResult.payload);
      }
      return process.exit(1);
    }

    case "success": {
      // Codex reads plain text on stdout only for SessionStart and UserPromptSubmit.
      // Other events ignore plain stdout (Stop treats it as invalid), so we emit nothing.
      if (eventName === "SessionStart" || eventName === "UserPromptSubmit") {
        if (isNonEmptyString(hookResult.payload.additionalContext)) {
          console.log(hookResult.payload.additionalContext);
        }
      }
      return process.exit(0);
    }

    default: {
      throw new Error(`Unknown hook result kind: ${JSON.stringify(hookResult satisfies never)}`);
    }
  }
}

function extractInputSchemaFromTrigger(trigger: HookTrigger) {
  const schemas = Object.keys(trigger).map((hookEvent) => {
    return HookInputSchemas[hookEvent as SupportedHookEvent];
  });

  return v.union(schemas);
}
