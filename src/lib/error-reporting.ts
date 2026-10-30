/**
 * Generic application error reporting utility.
 *
 * Captures errors that originate inside React error boundaries and forwards
 * them to the browser console. Swap in your own monitoring SDK (e.g. Sentry,
 * Datadog) by replacing the body of `reportError` below.
 */

const MAX_SERIALIZED_LENGTH = 2_000;

/**
 * Produce a human-readable string from anything that might be thrown.
 *
 * Handles Error objects, plain strings, Response objects (from TanStack
 * loaders/server functions), and arbitrary JSON-serialisable values.
 */
function describeThrown(error: unknown): string {
  if (error instanceof Response) {
    return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  const { message } = (error ?? {}) as { message?: unknown };
  if (typeof message === "string" && message.length > 0) return message;

  try {
    return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
  } catch {
    return String(error);
  }
}

/**
 * Report an error that was caught by a React error boundary.
 *
 * @param error   - The thrown value (usually an Error instance).
 * @param context - Optional key/value pairs for extra diagnostic context.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}): void {
  // Guard: no-op in SSR environments where `window` is unavailable.
  if (typeof window === "undefined") return;

  // Log a structured entry so DevTools show the full stack trace.
  console.error("[ErrorBoundary]", describeThrown(error), { context, error });
}
