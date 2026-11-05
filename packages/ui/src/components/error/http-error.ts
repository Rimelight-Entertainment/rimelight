import type { HttpErrorOptions } from "./error.types";

/**
 * An error carrying an HTTP status code. Throw it from a loader or component and the
 * nearest `RLErrorBoundary` renders the matching error page.
 *
 * @example
 * throw new HttpError(404, "This post doesn't exist");
 * throw new HttpError(403, "Only editors can view drafts");
 */
export class HttpError extends Error {
  readonly status: number;
  readonly expose: boolean;
  readonly title: string | undefined;

  constructor(status: number, message?: string, options: HttpErrorOptions = {}) {
    super(message ?? "", options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "HttpError";
    this.status = status;
    this.expose = options.expose ?? status < 500;
    this.title = options.title;
  }
}

/**
 * Duck-typed check so errors created by a different copy of the package still match.
 */
export function isHttpError(error: unknown): error is HttpError {
  return (
    error instanceof HttpError ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "HttpError" &&
      "status" in error &&
      typeof error.status === "number")
  );
}

/**
 * Status code for any thrown value: the `HttpError` status, otherwise 500.
 */
export function getErrorStatus(error: unknown): number {
  return isHttpError(error) ? error.status : 500;
}

/**
 * True in Vite dev builds. Error details (message + stack) are only shown when this is true.
 */
export function isDevEnvironment(): boolean {
  // Vite injects `import.meta.env` at build time; its type is not declared in this package.
  const env: { DEV?: boolean } | undefined = (import.meta as { env?: { DEV?: boolean } }).env;
  return env?.DEV === true;
}
