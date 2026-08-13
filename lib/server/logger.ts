const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  grey: '\x1b[90m',
} as const;

// Only emit ANSI codes on a real terminal (not when piped/logged to a file)
const USE_COLOR = process.env.NO_COLOR === undefined && !!process.stdout.isTTY;

function color(code: string, text: string): string {
  return USE_COLOR ? `${code}${text}${COLORS.reset}` : text;
}

const METHOD_COLORS: Record<string, string> = {
  GET: COLORS.blue,
  POST: COLORS.yellow,
  PUT: COLORS.cyan,
  PATCH: COLORS.magenta,
  DELETE: COLORS.red,
};

function statusColor(status: number): string {
  if (status >= 500) return COLORS.red;
  if (status >= 400) return COLORS.yellow;
  if (status >= 300) return COLORS.cyan;
  return COLORS.green;
}

function timestamp(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

interface ApiLogDetails {
  status?: number;
  userId?: string | null;
  durationMs: number;
  error?: unknown;
}

export function logApiRequest(
  request: Request,
  startTime: number,
  details: Partial<Omit<ApiLogDetails, 'durationMs'>> = {},
): void {
  const url = new URL(request.url);
  const durationMs = Date.now() - startTime;
  const time = color(COLORS.dim, timestamp());
  const tag = color(COLORS.bold + COLORS.cyan, '[API]');
  const method = color(METHOD_COLORS[request.method] ?? COLORS.grey, request.method);
  const path = url.pathname;
  const meta = color(COLORS.dim, `${durationMs}ms`);

  if (details.error) {
    const msg = details.error instanceof Error ? details.error.message : String(details.error);
    console.error(
      `${time} ${tag} ${method} ${path} ${color(COLORS.red, 'FAILED')} ${meta} ${color(COLORS.red, msg)}`,
    );
    return;
  }

  const status = details.status ? color(statusColor(details.status), String(details.status)) : '';
  console.log(`${time} ${tag} ${method} ${path} ${status} ${meta}`);
}

export function withApiLogging<Args extends unknown[]>(
  handler: (request: Request, ...args: Args) => Promise<Response>,
): (request: Request, ...args: Args) => Promise<Response> {
  return async (request, ...args) => {
    const startTime = Date.now();
    try {
      const response = await handler(request, ...args);
      logApiRequest(request, startTime, { status: response.status });
      return response;
    } catch (error) {
      logApiRequest(request, startTime, { error });
      throw error;
    }
  };
}
