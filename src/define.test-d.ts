import { describe, expectTypeOf, it } from "vitest";

import { defineHook } from "./define.ts";

type BashToolInput = { command: string };
type ApplyPatchToolInput = { patch: string };

declare module "./index.ts" {
  interface ToolSchema {
    Bash: {
      input: BashToolInput;
      response: unknown;
    };
    apply_patch: {
      input: ApplyPatchToolInput;
      response: unknown;
    };
  }
}

describe("defineHook input narrowing", () => {
  it("narrows PreToolUse tool_input to BashToolInput when triggered by Bash", () => {
    defineHook({
      run: (context) => {
        expectTypeOf(context.input.tool_input).toEqualTypeOf<BashToolInput>();
        expectTypeOf(context.input.tool_name).toEqualTypeOf<"Bash">();
        return context.success();
      },
      trigger: { PreToolUse: { Bash: true } },
    });
  });

  it("narrows PreToolUse tool_input to ApplyPatchToolInput when triggered by apply_patch", () => {
    defineHook({
      run: (context) => {
        expectTypeOf(context.input.tool_input).toEqualTypeOf<ApplyPatchToolInput>();
        expectTypeOf(context.input.tool_name).toEqualTypeOf<"apply_patch">();
        return context.success();
      },
      trigger: { PreToolUse: { apply_patch: true } },
    });
  });

  it("unions tool inputs when multiple tools are triggered", () => {
    defineHook({
      run: (context) => {
        expectTypeOf(context.input.tool_input).toEqualTypeOf<ApplyPatchToolInput | BashToolInput>();
        return context.success();
      },
      trigger: { PreToolUse: { Bash: true, apply_patch: true } },
    });
  });

  it("falls back to unknown tool_input when subscribing to the whole PreToolUse event", () => {
    defineHook({
      run: (context) => {
        expectTypeOf(context.input.tool_input).toBeUnknown();
        return context.success();
      },
      trigger: { PreToolUse: true },
    });
  });

  it("types SessionStart input without tool-specific keys", () => {
    defineHook({
      run: (context) => {
        expectTypeOf(context.input.source).toEqualTypeOf<
          "startup" | "resume" | "clear" | "compact"
        >();
        expectTypeOf(context.input.hook_event_name).toEqualTypeOf<"SessionStart">();
        return context.success({ additionalContext: "hello" });
      },
      trigger: { SessionStart: true },
    });
  });
});

describe("defineHook json output narrowing", () => {
  it("constrains json payload event to the subscribed events", () => {
    defineHook({
      run: (context) => {
        return context.json({
          event: "PreToolUse",
          output: {
            hookSpecificOutput: {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: "blocked",
            },
          },
        });
      },
      trigger: { PreToolUse: { Bash: true } },
    });
  });
});
