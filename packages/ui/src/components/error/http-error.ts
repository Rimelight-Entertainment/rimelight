export interface HttpErrorOptions {
  /**
   * Whether `message` is safe to show to visitors in production.
   * Defaults to `true` for 4xx (errors you expected and wrote) and `false` for 5xx.
   */
  expose?: boolean;
  /**
   * Optional title override shown by `RLError`.
   */
  title?: string;
  /**
   * The underlying error, kept for logging.
   */
  cause?: unknown;
}

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
      (error as { name?: unknown }).name === "HttpError" &&
      typeof (error as { status?: unknown }).status === "number")
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
  return (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;
}
