import type { HookContext, HookResponse } from "./context.ts";
import type { HookTrigger } from "./types.ts";
import type { Awaitable } from "./utils/types.ts";

/**
 * Define a type-safe Codex hook.
 *
 * `trigger` declares which events (and optionally which tool names for the three tool-aware events)
 * this hook subscribes to. `run` receives a strongly-typed `HookContext` and returns one of the
 * response variants produced by `context.success`, `context.blockingError`,
 * `context.nonBlockingError`, or `context.json`.
 *
 * @example
 *   import { defineHook } from "codex-hooks-ts";
 *
 *   const hook = defineHook({
 *     trigger: { SessionStart: true },
 *     run: (context) =>
 *       context.success({ additionalContext: `Session ${context.input.session_id} started.` }),
 *   });
 *
 * @example
 *   // Tool-specific PreToolUse hook with narrowed input
 *   const guard = defineHook({
 *     trigger: { PreToolUse: { Bash: true } },
 *     run: (context) => {
 *       const { command } = context.input.tool_input;
 *       if (/rm\s+-rf\s+\//.test(command)) {
 *         return context.json({
 *           event: "PreToolUse",
 *           output: {
 *             hookSpecificOutput: {
 *               hookEventName: "PreToolUse",
 *               permissionDecision: "deny",
 *               permissionDecisionReason: "Refusing destructive rm command",
 *             },
 *           },
 *         });
 *       }
 *       return context.success();
 *     },
 *   });
 */
export function defineHook<THookTrigger extends HookTrigger = HookTrigger>(
  definition: HookDefinition<THookTrigger>,
): HookDefinition<THookTrigger> {
  return definition;
}

export type HookDefinition<THookTrigger extends HookTrigger = HookTrigger> = {
  /**
   * Hook handler. Receives a typed `HookContext` and returns one of the four response variants.
   * Async handlers are supported even though Codex itself does not yet honor `async: true` at the
   * configuration level — the handler simply runs to completion before the process exits.
   */
  run: HookHandler<THookTrigger>;

  /** Event / tool subscription map. */
  trigger: THookTrigger;
};

type HookHandler<THookTrigger extends HookTrigger> = (
  context: HookContext<THookTrigger>,
) => Awaitable<HookResponse<THookTrigger>>;
