import { describe, expectTypeOf, it } from "vitest";

import type { HookInput } from "./types.ts";

describe("HookInput default fallback", () => {
  it("typed tool_input as unknown for PreToolUse default", () => {
    expectTypeOf<HookInput["PreToolUse"]["default"]["tool_input"]>().toBeUnknown();
  });

  it("preserves session-only shape for SessionStart", () => {
    expectTypeOf<HookInput["SessionStart"]["default"]["source"]>().toEqualTypeOf<
      "startup" | "resume" | "clear" | "compact"
    >();
  });

  it("treats PreCompact / PostCompact as default-only without permission_mode", () => {
    expectTypeOf<keyof HookInput["PreCompact"]>().toEqualTypeOf<"default">();
    expectTypeOf<HookInput["PreCompact"]["default"]>().not.toHaveProperty("permission_mode");
  });
});

declare module "../../index.ts" {
  interface ToolSchema {
    MyTool: {
      input: { foo: string };
      response: { bar: number };
    };
  }
}

describe("HookInput tool-specific narrowing", () => {
  it("narrows PreToolUse tool_input to MyTool schema", () => {
    expectTypeOf<HookInput["PreToolUse"]["MyTool"]["tool_input"]>().toEqualTypeOf<{
      foo: string;
    }>();
    expectTypeOf<HookInput["PreToolUse"]["MyTool"]["tool_name"]>().toEqualTypeOf<"MyTool">();
  });

  it("narrows PostToolUse tool_response to MyTool schema", () => {
    expectTypeOf<HookInput["PostToolUse"]["MyTool"]["tool_response"]>().toEqualTypeOf<{
      bar: number;
    }>();
    expectTypeOf<HookInput["PostToolUse"]["MyTool"]["tool_name"]>().toEqualTypeOf<"MyTool">();
  });

  it("narrows PermissionRequest tool_input to MyTool schema", () => {
    expectTypeOf<HookInput["PermissionRequest"]["MyTool"]["tool_input"]>().toEqualTypeOf<{
      foo: string;
    }>();
    expectTypeOf<HookInput["PermissionRequest"]["MyTool"]["tool_name"]>().toEqualTypeOf<"MyTool">();
  });
});
