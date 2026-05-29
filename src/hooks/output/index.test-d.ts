import { describe, expectTypeOf, it } from "vitest";

import type { UpstreamHookOutputs } from "../../generated/upstream.ts";
import type { HookOutput } from "./index.ts";

type Ours = {
  [K in keyof HookOutput]: HookOutput[K];
};

type Theirs = {
  [K in keyof UpstreamHookOutputs]: UpstreamHookOutputs[K];
};

describe("HookOutput", () => {
  it("is a subset of the upstream wire types", () => {
    expectTypeOf<Ours>().toEqualTypeOf<Theirs>();
  });
});

describe("HookOutput keeps hookEventName as a required literal", () => {
  it("PreToolUse.hookSpecificOutput.hookEventName is the PreToolUse literal", () => {
    expectTypeOf<
      NonNullable<HookOutput["PreToolUse"]["hookSpecificOutput"]>["hookEventName"]
    >().toEqualTypeOf<"PreToolUse">();
  });

  it("PostToolUse.hookSpecificOutput.hookEventName is the PostToolUse literal", () => {
    expectTypeOf<
      NonNullable<HookOutput["PostToolUse"]["hookSpecificOutput"]>["hookEventName"]
    >().toEqualTypeOf<"PostToolUse">();
  });

  it("PermissionRequest.hookSpecificOutput.hookEventName is the PermissionRequest literal", () => {
    expectTypeOf<
      NonNullable<HookOutput["PermissionRequest"]["hookSpecificOutput"]>["hookEventName"]
    >().toEqualTypeOf<"PermissionRequest">();
  });

  it("UserPromptSubmit.hookSpecificOutput.hookEventName is the UserPromptSubmit literal", () => {
    expectTypeOf<
      NonNullable<HookOutput["UserPromptSubmit"]["hookSpecificOutput"]>["hookEventName"]
    >().toEqualTypeOf<"UserPromptSubmit">();
  });

  it("SessionStart.hookSpecificOutput.hookEventName is the SessionStart literal", () => {
    expectTypeOf<
      NonNullable<HookOutput["SessionStart"]["hookSpecificOutput"]>["hookEventName"]
    >().toEqualTypeOf<"SessionStart">();
  });
});
