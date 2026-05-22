import { describe, expectTypeOf, it } from "vitest";

import type { UpstreamHookInputs, UpstreamHookOutputs } from "../generated/upstream.ts";
import type { SupportedHookEvent } from "./event.ts";

describe("SupportedHookEvent", () => {
  it("covers all hook events emitted by the upstream schemas", () => {
    expectTypeOf<SupportedHookEvent>().toEqualTypeOf<keyof UpstreamHookInputs>();
    expectTypeOf<SupportedHookEvent>().toEqualTypeOf<keyof UpstreamHookOutputs>();
  });
});
