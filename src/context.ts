import type { ExtractSyncHookOutput, SupportedHookEvent } from "./hooks/index.ts";
import type { ExtractTriggeredHookInput, HookTrigger } from "./types.ts";

export interface HookContext<THookTrigger extends HookTrigger> {
  /**
   * Block the current operation by exiting with code 2.
   *
   * Codex feeds the message back to the model via stderr so the model can react to the failure.
   *
   * @example
   *   const hook = defineHook({
   *     trigger: { PreToolUse: { Bash: true } },
   *     run: (context) => {
   *       if (/rm\s+-rf\s+\//.test(context.input.tool_input.command)) {
   *         return context.blockingError("Refusing destructive rm command");
   *       }
   *       return context.success();
   *     },
   *   });
   */
  blockingError: (error: string) => HookResponseBlockingError;

  input: ExtractTriggeredHookInput<THookTrigger>;

  /**
   * Emit a structured JSON response on stdout and exit with code 0.
   *
   * Use this when you need fine-grained control over Codex behavior such as denying a permission
   * decision, returning additional developer context, or replacing tool output.
   *
   * @example
   *   const hook = defineHook({
   *     trigger: { PreToolUse: { Bash: true } },
   *     run: (context) => {
   *       return context.json({
   *         event: "PreToolUse",
   *         output: {
   *           hookSpecificOutput: {
   *             hookEventName: "PreToolUse",
   *             permissionDecision: "deny",
   *             permissionDecisionReason: "Blocked by repository policy.",
   *           },
   *         },
   *       });
   *     },
   *   });
   */
  json: (payload: SyncHookResultJSON<THookTrigger>) => HookResponseSyncJSON<THookTrigger>;

  /**
   * Emit a non-blocking error on stderr and exit with code 1. Codex shows the message to the user
   * but continues normal processing.
   */
  nonBlockingError: (message?: string) => HookResponseNonBlockingError;

  /**
   * Exit with code 0.
   *
   * For `SessionStart` and `UserPromptSubmit`, the optional `additionalContext` payload is written
   * to stdout and consumed by Codex as extra developer context. Other events ignore the payload, so
   * callers can pass it unconditionally without effect.
   */
  success: (payload?: HookSuccessPayload) => HookResponseSuccess;
}

export function createContext<THookTrigger extends HookTrigger>(
  input: ExtractTriggeredHookInput<THookTrigger>,
): HookContext<THookTrigger> {
  return {
    blockingError: (error) => ({
      kind: "blocking-error",
      payload: error,
    }),

    input,

    json: (payload) => ({
      kind: "json-sync",
      payload,
    }),

    nonBlockingError: (message) => ({
      kind: "non-blocking-error",
      payload: message,
    }),

    success: (result) => ({
      kind: "success",
      payload: {
        additionalContext: result?.additionalContext,
      },
    }),
  };
}

export type HookResponse<THookTrigger extends HookTrigger> =
  | HookResponseBlockingError
  | HookResponseNonBlockingError
  | HookResponseSuccess
  | HookResponseSyncJSON<THookTrigger>;

type HookResponseBlockingError = {
  kind: "blocking-error";
  payload: string;
};

type HookResponseNonBlockingError = {
  kind: "non-blocking-error";
  payload?: string;
};

type HookResponseSuccess = {
  kind: "success";
  payload: HookSuccessPayload;
};

type HookResponseSyncJSON<TTrigger extends HookTrigger> = {
  kind: "json-sync";
  payload: SyncHookResultJSON<TTrigger>;
};

type HookSuccessPayload = {
  /**
   * Extra developer context delivered via stdout. Only `SessionStart` and `UserPromptSubmit` read
   * stdout — other events ignore the payload.
   */
  additionalContext?: string | undefined;
};

type SyncHookResultJSON<TTrigger extends HookTrigger> = {
  [EventKey in keyof TTrigger]: EventKey extends SupportedHookEvent
    ? TTrigger[EventKey] extends true | Record<PropertyKey, true>
      ? {
          /** Event name discriminator required for proper inference of `output`. */
          event: EventKey;

          /** Hook output payload for the event. */
          output: ExtractSyncHookOutput<EventKey>;
        }
      : never
    : never;
}[keyof TTrigger];
