import type * as v from "valibot";

import type { ToolSchema } from "../../index.ts";
import type { SupportedHookEvent } from "../event.ts";
import type { HookInputSchemas } from "./schemas.ts";

/**
 * Internal type that combines base hook inputs with tool-specific inputs for tool-aware events. For
 * all other events, this is equivalent to BaseHookInputs.
 *
 * @example
 *   type PreToolUseInputs = HookInput["PreToolUse"];
 *   // Result: Base inputs + { Bash: SpecifiedToolUseInput<"Bash">, apply_patch: SpecifiedToolUseInput<"apply_patch"> }
 *
 * @package
 */
export type HookInput = {
  [EventKey in SupportedHookEvent]: EventKey extends "PreToolUse"
    ? ToolSpecificPreToolUseInput & {
        default: BaseHookInputs["PreToolUse"];
      }
    : EventKey extends "PostToolUse"
      ? ToolSpecificPostToolUseInput & {
          default: BaseHookInputs["PostToolUse"];
        }
      : EventKey extends "PermissionRequest"
        ? ToolSpecificPermissionRequestInput & {
            default: BaseHookInputs["PermissionRequest"];
          }
        : {
            default: BaseHookInputs[EventKey];
          };
};

/**
 * Extracts all possible hook input types for a specific event type. For non-tool-specific events,
 * this returns only the default input type. For tool-specific events, this returns a union of all
 * possible inputs including default and tool-specific variants.
 *
 * @example
 *   // For non-tool-specific events
 *   type SessionStartInputs = ExtractAllHookInputsForEvent<"SessionStart">;
 *
 *   // For tool-specific events
 *   type PreToolUseInputs = ExtractAllHookInputsForEvent<"PreToolUse">;
 *   // Result: Union of default input + all tool-specific inputs (Bash, apply_patch, etc.)
 *
 * @package
 */
export type ExtractAllHookInputsForEvent<TEvent extends SupportedHookEvent> = {
  [K in keyof HookInput[TEvent]]: HookInput[TEvent][K];
}[keyof HookInput[TEvent]];

/**
 * Extracts the hook input type for a specific tool within a given event type.
 *
 * @example
 *   type BashPreInput = ExtractSpecificHookInputForEvent<"PreToolUse", "Bash">;
 *   // tool_input is typed as BashToolInput, tool_name is "Bash"
 *
 *   // Type error: "Bash" is not a valid key for non-tool-specific events
 *   type Invalid = ExtractSpecificHookInputForEvent<"SessionStart", "Bash">;
 *
 * @package
 */
export type ExtractSpecificHookInputForEvent<
  TEvent extends SupportedHookEvent,
  TSpecificKey extends ExtractExtendedSpecificKeys<TEvent>,
> = TSpecificKey extends keyof HookInput[TEvent] ? HookInput[TEvent][TSpecificKey] : never;

/** @package */
export type ExtractExtendedSpecificKeys<TEvent extends SupportedHookEvent> = Exclude<
  keyof HookInput[TEvent],
  "default"
>;

type BaseHookInputs = {
  [EventKey in SupportedHookEvent]: v.InferOutput<(typeof HookInputSchemas)[EventKey]>;
};

type ToolSpecificPreToolUseInput = {
  [K in keyof ToolSchema]: Omit<BaseHookInputs["PreToolUse"], "tool_input" | "tool_name"> & {
    tool_input: ToolSchema[K]["input"];
    tool_name: K;
  };
};

type ToolSpecificPostToolUseInput = {
  [K in keyof ToolSchema]: Omit<
    BaseHookInputs["PostToolUse"],
    "tool_input" | "tool_name" | "tool_response"
  > & {
    tool_input: ToolSchema[K]["input"];
    tool_name: K;
    tool_response: ToolSchema[K]["response"];
  };
};

type ToolSpecificPermissionRequestInput = {
  [K in keyof ToolSchema]: Omit<BaseHookInputs["PermissionRequest"], "tool_input" | "tool_name"> & {
    tool_input: ToolSchema[K]["input"];
    tool_name: K;
  };
};
