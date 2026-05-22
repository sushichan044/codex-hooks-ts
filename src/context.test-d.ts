import { describe, expectTypeOf, it } from "vitest";

import { createContext } from "./context.ts";
import type { ExtractTriggeredHookInput } from "./types.ts";

type SessionStartTrigger = { SessionStart: true };

describe("HookContext result helpers", () => {
  it("returns a discriminated success payload from context.success", () => {
    const ctx = createContext<SessionStartTrigger>(
      {} as ExtractTriggeredHookInput<SessionStartTrigger>,
    );
    expectTypeOf(ctx.success({ additionalContext: "ctx" })).toExtend<{
      kind: "success";
    }>();
  });

  it("returns a blocking-error payload from context.blockingError", () => {
    const ctx = createContext<SessionStartTrigger>(
      {} as ExtractTriggeredHookInput<SessionStartTrigger>,
    );
    expectTypeOf(ctx.blockingError("nope")).toExtend<{
      kind: "blocking-error";
      payload: string;
    }>();
  });

  it("returns a json-sync payload from context.json", () => {
    const ctx = createContext<SessionStartTrigger>(
      {} as ExtractTriggeredHookInput<SessionStartTrigger>,
    );
    expectTypeOf(
      ctx.json({
        event: "SessionStart",
        output: {
          hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "ctx" },
        },
      }),
    ).toExtend<{ kind: "json-sync" }>();
  });

  it("returns a non-blocking-error payload from context.nonBlockingError", () => {
    const ctx = createContext<SessionStartTrigger>(
      {} as ExtractTriggeredHookInput<SessionStartTrigger>,
    );
    expectTypeOf(ctx.nonBlockingError()).toExtend<{ kind: "non-blocking-error" }>();
  });
});
