/**
 * Lightweight server logger — no imports from index.ts to avoid circular deps.
 */
export function log(message: string, source: string = "server"): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level: "info",
    source,
    message,
  };
  console.log(JSON.stringify(entry));
}

export function logError(message: string, source: string = "server"): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level: "error",
    source,
    message,
  };
  console.error(JSON.stringify(entry));
}
