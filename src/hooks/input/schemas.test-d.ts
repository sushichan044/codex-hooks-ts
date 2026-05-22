import type * as v from "valibot";
import { describe, expectTypeOf, it } from "vitest";

import type { UpstreamHookInputs } from "../../generated/upstream.ts";
import type { HookInputSchemas } from "./schemas.ts";

// Normalize schemas with Readonly<T> to prevent causing errors by `as const`.
type Ours = Readonly<{
  [K in keyof typeof HookInputSchemas]: v.InferOutput<(typeof HookInputSchemas)[K]>;
}>;

type Theirs = Readonly<{
  [K in keyof UpstreamHookInputs]: UpstreamHookInputs[K];
}>;

describe("HookInputSchemas", () => {
  it("matches the upstream types", () => {
    expectTypeOf<Ours>().toEqualTypeOf<Theirs>();
  });
});
