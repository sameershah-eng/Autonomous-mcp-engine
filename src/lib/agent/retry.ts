export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  onRetry?: (attempt: number, error: string) => void;
}

export async function executeWithRetryAndTimeout<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<{ result: T; attempts: number }> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 400;
  const timeoutMs = options.timeoutMs ?? 10000;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Create timeout promise
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`Tool execution timed out after ${timeoutMs / 1000}s.`));
        }, timeoutMs);
      });

      const result = await Promise.race([
        fn().finally(() => {
          if (timeoutHandle) clearTimeout(timeoutHandle);
        }),
        timeoutPromise,
      ]);

      return { result, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (options.onRetry) {
          options.onRetry(attempt + 1, errorMsg);
        }
        // Exponential backoff
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
