/**
 * Tool-specific input/response schema map for Codex tools.
 *
 * Users can extend this interface via declaration merging to add custom tool definitions, including
 * MCP tools whose names follow the `mcp__<server>__<tool>` convention.
 *
 * @example
 *   declare module "codex-hooks-ts" {
 *     interface ToolSchema {
 *       mcp__filesystem__read_file: {
 *         input: { path: string };
 *         response: { content: string };
 *       };
 *     }
 *   }
 *
 *   const hook = defineHook({
 *     trigger: { PreToolUse: { mcp__filesystem__read_file: true } },
 *     run: (context) => {
 *       // context.input.tool_input is typed as { path: string }
 *       const { path } = context.input.tool_input;
 *       return context.success();
 *     },
 *   });
 */
// oxlint-disable-next-line typescript/no-empty-object-type
export interface ToolSchema {
  mcp__filesystem__read_file: {
    input: { path: string };
    response: { content: string };
  };
}

export { defineHook } from "./define.ts";

export { runHook } from "./run.ts";

export type {
  ExtractAllHookInputsForEvent,
  ExtractSpecificHookInputForEvent,
} from "./hooks/index.ts";
