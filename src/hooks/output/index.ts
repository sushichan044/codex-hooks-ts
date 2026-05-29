import type { SupportedHookEvent } from "../event.ts";

/** @package */
export type HookOutput = {
  PermissionRequest: PermissionRequestHookOutput;

  PostCompact: CodexCommonOutput;

  PostToolUse: PostToolUseHookOutput;

  PreCompact: CodexCommonOutput;

  PreToolUse: PreToolUseHookOutput;

  SessionStart: SessionStartHookOutput;

  Stop: StopHookOutput;

  UserPromptSubmit: UserPromptSubmitHookOutput;
};

/** @package */
export type ExtractSyncHookOutput<TEvent extends SupportedHookEvent> =
  HookOutput extends Record<SupportedHookEvent, unknown> ? HookOutput[TEvent] : never;

/** Common fields supported by every Codex hook event. */
interface CodexCommonOutput {
  /**
   * If `false`, Codex marks this hook run as stopped.
   *
   * @default true
   */
  continue?: boolean;

  /**
   * Recorded as the reason for stopping. Shown to the user, not to the model.
   *
   * @remarks
   *   `PreToolUse` and `PermissionRequest` parse this field but do not act on it today.
   */
  stopReason?: string;

  /**
   * Parsed by Codex today but not yet implemented as runtime behavior.
   *
   * @default false
   */
  suppressOutput?: boolean;

  /** Optional warning message surfaced to the user. */
  systemMessage?: string;
}

/** @see {@link https://developers.openai.com/codex/hooks#pretooluse} */
interface PreToolUseHookOutput extends CodexCommonOutput {
  /**
   * Legacy block form. Prefer `hookSpecificOutput.permissionDecision = "deny"` for new code.
   *
   * @deprecated Use `hookSpecificOutput.permissionDecision` instead.
   */
  decision?: "approve" | "block";

  hookSpecificOutput?: {
    /** Adds extra developer context without blocking the tool call. */
    additionalContext?: string;

    /** Required discriminator that ties this hook-specific payload to the event. */
    hookEventName: "PreToolUse";

    permissionDecision?: "allow" | "deny" | "ask";

    /** Surfaced to the model when `permissionDecision` is `"deny"`. */
    permissionDecisionReason?: string;

    updatedInput?: {
      [k: string]: unknown;
    };
  };

  /**
   * Reason paired with the legacy `decision: "block"` form.
   *
   * @deprecated Use `hookSpecificOutput.permissionDecisionReason` instead.
   */
  reason?: string;
}

/** @see {@link https://developers.openai.com/codex/hooks#posttooluse} */
interface PostToolUseHookOutput extends CodexCommonOutput {
  /**
   * `"block"` does not undo the completed tool call. Instead, Codex records the feedback, replaces
   * the tool result with `reason`, and continues from there.
   */
  decision?: "block";

  hookSpecificOutput?: {
    /** Adds extra developer context after the tool call has run. */
    additionalContext?: string;

    /** Required discriminator that ties this hook-specific payload to the event. */
    hookEventName: "PostToolUse";

    updatedMCPToolOutput?: {
      [k: string]: unknown;
    };
  };

  /** Required when `decision` is `"block"` so the model knows why the tool result was rewritten. */
  reason?: string;
}

/** @see {@link https://developers.openai.com/codex/hooks#permissionrequest} */
interface PermissionRequestHookOutput extends CodexCommonOutput {
  hookSpecificOutput?: {
    decision?: {
      behavior: "allow" | "deny";
      interrupt?: boolean;
      message?: string;
      updatedInput?: {
        [k: string]: unknown;
      };
      updatedPermissions?: {
        [k: string]: unknown;
      };
    };

    /** Required discriminator that ties this hook-specific payload to the event. */
    hookEventName: "PermissionRequest";
  };
}

/** @see {@link https://developers.openai.com/codex/hooks#userpromptsubmit} */
interface UserPromptSubmitHookOutput extends CodexCommonOutput {
  /** `"block"` prevents the prompt from being processed. `reason` is shown to the user. */
  decision?: "block";

  hookSpecificOutput?: {
    /** Adds the string as extra developer context if the prompt is not blocked. */
    additionalContext?: string;

    /** Required discriminator that ties this hook-specific payload to the event. */
    hookEventName: "UserPromptSubmit";
  };

  /** Reason paired with `decision: "block"`. Shown to the user, not to the model. */
  reason?: string;
}

/** @see {@link https://developers.openai.com/codex/hooks#sessionstart} */
interface SessionStartHookOutput extends CodexCommonOutput {
  hookSpecificOutput?: {
    /** Added to the session as extra developer context. */
    additionalContext?: string;

    /** Required discriminator that ties this hook-specific payload to the event. */
    hookEventName: "SessionStart";
  };
}

/** @see {@link https://developers.openai.com/codex/hooks#stop} */
interface StopHookOutput extends CodexCommonOutput {
  /**
   * `"block"` does not reject the turn — it tells Codex to continue with `reason` acting as a new
   * user prompt.
   */
  decision?: "block";

  /** Reason paired with `decision: "block"`. Becomes the continuation prompt text. */
  reason?: string;
}
