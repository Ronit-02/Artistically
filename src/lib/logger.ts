type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;
const SENSITIVE_KEY = /authorization|cookie|password|token|secret|credential|database_url|connection|string|body/i;

function serializeError(error: unknown) {
  return error instanceof Error ? { name: error.name } : { name: "UnknownError" };
}

function redact(value: unknown, key = ""): unknown {
  if (SENSITIVE_KEY.test(key)) return "[REDACTED]";
  if (Array.isArray(value)) return value.map((entry) => redact(entry));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [entryKey, redact(entryValue, entryKey)]));
  return value;
}

function writeLog(level: LogLevel, event: string, context: LogContext = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...redact(context) as LogContext,
    ...(context.error !== undefined && {
      error: serializeError(context.error),
    }),
  });

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warn") {
    console.warn(entry);
    return;
  }

  console.info(entry);
}

export const logger = {
  info: (event: string, context?: LogContext) => writeLog("info", event, context),
  warn: (event: string, context?: LogContext) => writeLog("warn", event, context),
  error: (event: string, context?: LogContext) => writeLog("error", event, context),
};
