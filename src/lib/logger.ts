const BASE_URL = "https://http-intake.logs.datadoghq.eu/api/v2/logs";
const BASE_PARAMS = {
  ddsource: "nodejs",
  service: "100-cims",
  ddtags: `env:${process.env.NEXT_PUBLIC_VERCEL_ENV}`,
  ...ifDefined("next_deployment_id", process.env.NEXT_DEPLOYMENT_ID),
};

export function createLogger(module: string) {
  return new Logger(module);
}

enum LOG_LEVEL {
  INFO = "info",
  ERROR = "error",
}

class Logger {
  constructor(private readonly module: string) {}

  private async log(level: LOG_LEVEL, message: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console[level](`[${this.module}]`, message, ...args);

    return fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "dd-api-key": process.env.DATADOG_API_KEY,
      },
      body: JSON.stringify(
        combine(
          {
            ...BASE_PARAMS,
            level,
            module: this.module,
            message,
          },
          args
        )
      ),
    })
      .then((res) => {
        if (!res.ok) {
          console.error("Failed to log to Datadog", res);
        }
      })
      .catch((err) => {
        console.error("Failed to log to Datadog", err);
      });
  }

  info(message: string, ...args: unknown[]) {
    return this.log(LOG_LEVEL.INFO, message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    return this.log(LOG_LEVEL.ERROR, message, ...args);
  }
}

function ifDefined(key: string, value: string | undefined) {
  return value ? { [key]: value } : {};
}

function combine(body: Record<string, unknown>, args: unknown[]) {
  for (const arg of args) {
    if (typeof arg === "object" && arg !== null) {
      Object.entries(arg).forEach(([key, value]) => {
        body[key] = value;
      });
    }
  }

  return body;
}
