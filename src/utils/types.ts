export type Awaitable<T> = PromiseLike<T> | T;

/**
 * Allow string literal completions for an enum-like type while still accepting arbitrary strings —
 * useful for fields like `tool_name` where well-known values are documented but the upstream schema
 * is `string`. Implemented as `Record<string, never> & TKnown` so the type stays assignable to
 * `string` while keeping IDE auto-completion biased toward the known literals.
 */
export type AutoComplete<TKnown extends string> = Record<string, never> & TKnown;
