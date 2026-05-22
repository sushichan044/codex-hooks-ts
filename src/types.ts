import type {
  ExtractAllHookInputsForEvent,
  ExtractExtendedSpecificKeys,
  ExtractSpecificHookInputForEvent,
  ExtractSyncHookOutput,
  SupportedHookEvent,
} from "./hooks/index.ts";

/**
 * Trigger declaration for `defineHook`. Each event can be subscribed wholesale with `true`, or
 * narrowed to one or more tool names for the three tool-aware events (`PreToolUse`, `PostToolUse`,
 * `PermissionRequest`).
 */
export type HookTrigger = Partial<{
  [TEvent in SupportedHookEvent]:
    | true
    | Partial<{
        [SchemaKey in ExtractExtendedSpecificKeys<TEvent>]?: true;
      }>;
}>;

/**
 * Narrowed input type derived from a `HookTrigger`. The union spans every event/tool combination
 * that the trigger subscribes to.
 */
export type ExtractTriggeredHookInput<TTrigger extends HookTrigger> = {
  [EventKey in keyof TTrigger]: EventKey extends SupportedHookEvent
    ? TTrigger[EventKey] extends true
      ? ExtractAllHookInputsForEvent<EventKey>
      : TTrigger[EventKey] extends Record<PropertyKey, true>
        ? {
            [SpecificKey in keyof TTrigger[EventKey]]: SpecificKey extends ExtractExtendedSpecificKeys<EventKey>
              ? ExtractSpecificHookInputForEvent<EventKey, SpecificKey>
              : never;
          }[keyof TTrigger[EventKey]]
        : never
    : never;
}[keyof TTrigger];

/**
 * Output type union derived from a `HookTrigger`. Used by `context.json` to constrain the
 * structured payload to events the hook actually subscribes to.
 */
export type ExtractTriggeredHookOutput<TTrigger extends HookTrigger> = {
  [EventKey in keyof TTrigger]: EventKey extends SupportedHookEvent
    ? ExtractSyncHookOutput<EventKey>
    : never;
}[keyof TTrigger];
