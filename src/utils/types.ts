export type Awaitable<T> = PromiseLike<T> | T;

/**
 * Allow string literal completions for an enum-like type while still accepting arbitrary strings —
 * useful for fields like `tool_name` where well-known values are documented but the upstream schema
 * is `string`.
 */
export type AutoComplete<TKnown extends string> = TKnown | Record<string, never>;
