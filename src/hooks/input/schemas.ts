import * as v from "valibot";

import type { ValibotSchemaLike } from "../../utils/valibot.ts";
import type { SupportedHookEvent } from "../event.ts";

const codexCommonBase = v.object({
  cwd: v.string(),
  model: v.string(),
  session_id: v.string(),
  transcript_path: v.nullable(v.string()),
});

const codexTurnScopedBase = v.object({
  ...codexCommonBase.entries,
  turn_id: v.string(),
});

const codexPermissionAwareBase = v.object({
  ...codexTurnScopedBase.entries,
  permission_mode: v.picklist(["default", "acceptEdits", "plan", "dontAsk", "bypassPermissions"]),
});

const codexSessionStartBase = v.object({
  ...codexCommonBase.entries,
  permission_mode: v.picklist(["default", "acceptEdits", "plan", "dontAsk", "bypassPermissions"]),
});

const agentMetadataEntries = {
  agent_id: v.optional(v.string()),
  agent_type: v.optional(v.string()),
};

function buildHookInputSchema<
  TBase extends v.ObjectEntries,
  TName extends string,
  TEntries extends v.ObjectEntries,
>(baseEntries: TBase, hook_event_name: TName, entries: TEntries) {
  return v.object({
    ...baseEntries,
    hook_event_name: v.literal(hook_event_name),
    ...entries,
  });
}

/** @package */
export const HookInputSchemas = {
  PermissionRequest: buildHookInputSchema(codexPermissionAwareBase.entries, "PermissionRequest", {
    ...agentMetadataEntries,
    tool_input: v.unknown(),
    tool_name: v.string(),
  }),

  PostCompact: buildHookInputSchema(codexTurnScopedBase.entries, "PostCompact", {
    ...agentMetadataEntries,
    trigger: v.picklist(["manual", "auto"]),
  }),

  PostToolUse: buildHookInputSchema(codexPermissionAwareBase.entries, "PostToolUse", {
    ...agentMetadataEntries,
    tool_input: v.unknown(),
    tool_name: v.string(),
    tool_response: v.unknown(),
    tool_use_id: v.string(),
  }),

  PreCompact: buildHookInputSchema(codexTurnScopedBase.entries, "PreCompact", {
    ...agentMetadataEntries,
    trigger: v.picklist(["manual", "auto"]),
  }),

  PreToolUse: buildHookInputSchema(codexPermissionAwareBase.entries, "PreToolUse", {
    ...agentMetadataEntries,
    tool_input: v.unknown(),
    tool_name: v.string(),
    tool_use_id: v.string(),
  }),

  SessionStart: buildHookInputSchema(codexSessionStartBase.entries, "SessionStart", {
    source: v.picklist(["startup", "resume", "clear", "compact"]),
  }),

  Stop: buildHookInputSchema(codexPermissionAwareBase.entries, "Stop", {
    last_assistant_message: v.nullable(v.string()),
    stop_hook_active: v.boolean(),
  }),

  UserPromptSubmit: buildHookInputSchema(codexPermissionAwareBase.entries, "UserPromptSubmit", {
    ...agentMetadataEntries,
    prompt: v.string(),
  }),
} as const satisfies Record<SupportedHookEvent, ValibotSchemaLike>;
