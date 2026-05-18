// https://github.com/openai/codex/tree/main/codex-rs/hooks/schema/generated
export const SUPPORTED_SCHEMA_FILES = [
  "permission-request.command.input.schema.json",
  "permission-request.command.output.schema.json",
  "post-compact.command.input.schema.json",
  "post-compact.command.output.schema.json",
  "post-tool-use.command.input.schema.json",
  "post-tool-use.command.output.schema.json",
  "pre-compact.command.input.schema.json",
  "pre-compact.command.output.schema.json",
  "pre-tool-use.command.input.schema.json",
  "pre-tool-use.command.output.schema.json",
  "session-start.command.input.schema.json",
  "session-start.command.output.schema.json",
  "stop.command.input.schema.json",
  "stop.command.output.schema.json",
  "user-prompt-submit.command.input.schema.json",
  "user-prompt-submit.command.output.schema.json",
] as const;

export type SupportedHookEvent =
  | "PermissionRequest"
  | "PostCompact"
  | "PostToolUse"
  | "PreCompact"
  | "PreToolUse"
  | "SessionStart"
  | "Stop"
  | "UserPromptSubmit";

export const SCHEMA_FILE_TO_EVENT = {
  "permission-request.command.input.schema.json": "PermissionRequest",
  "permission-request.command.output.schema.json": "PermissionRequest",
  "post-compact.command.input.schema.json": "PostCompact",
  "post-compact.command.output.schema.json": "PostCompact",
  "post-tool-use.command.input.schema.json": "PostToolUse",
  "post-tool-use.command.output.schema.json": "PostToolUse",
  "pre-compact.command.input.schema.json": "PreCompact",
  "pre-compact.command.output.schema.json": "PreCompact",
  "pre-tool-use.command.input.schema.json": "PreToolUse",
  "pre-tool-use.command.output.schema.json": "PreToolUse",
  "session-start.command.input.schema.json": "SessionStart",
  "session-start.command.output.schema.json": "SessionStart",
  "stop.command.input.schema.json": "Stop",
  "stop.command.output.schema.json": "Stop",
  "user-prompt-submit.command.input.schema.json": "UserPromptSubmit",
  "user-prompt-submit.command.output.schema.json": "UserPromptSubmit",
} as const satisfies Record<(typeof SUPPORTED_SCHEMA_FILES)[number], SupportedHookEvent>;
