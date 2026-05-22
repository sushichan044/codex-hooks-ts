import { describe, expectTypeOf, it } from "vitest";

import type { ExtractTriggeredHookInput, ExtractTriggeredHookOutput } from "./types.ts";

type BashToolInput = { command: string };

declare module "./index.ts" {
  interface ToolSchema {
    Bash: {
      input: BashToolInput;
      response: unknown;
    };
  }
}

describe("ExtractTriggeredHookInput", () => {
  it("returns the union of all tool-specific inputs when subscribed via true", () => {
    type Input = ExtractTriggeredHookInput<{ PreToolUse: true }>;
    // The union must include the default (unknown tool_input) variant
    expectTypeOf<Extract<Input, { tool_input: unknown }>>().not.toBeNever();
  });

  it("returns only the requested tool input when narrowed", () => {
    type Input = ExtractTriggeredHookInput<{ PreToolUse: { Bash: true } }>;
    expectTypeOf<Input["tool_input"]>().toEqualTypeOf<BashToolInput>();
    expectTypeOf<Input["tool_name"]>().toEqualTypeOf<"Bash">();
  });

  it("unions multiple events", () => {
    type Input = ExtractTriggeredHookInput<{ SessionStart: true; Stop: true }>;
    expectTypeOf<Input["hook_event_name"]>().toEqualTypeOf<"SessionStart" | "Stop">();
  });
});

describe("ExtractTriggeredHookOutput", () => {
  it("returns the output type for the subscribed event", () => {
    type Output = ExtractTriggeredHookOutput<{ Stop: true }>;
    // Stop output has no hookSpecificOutput field on the hand-written type
    expectTypeOf<Output>().not.toHaveProperty("hookSpecificOutput");
  });
});
