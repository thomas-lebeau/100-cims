import {
  createLogger as createWinstonLogger,
  format,
  transports,
} from "winston";

const DATADOG_API_KEY = process.env.DATADOG_API_KEY;
const APPLICATION_NAME = "100-cims";

const logger = createWinstonLogger({
  level: "info",
  exitOnError: false,
  format: format.json(),
  defaultMeta: { env: process.env.NODE_ENV },
  transports: [
    new transports.Http({
      host: "http-intake.logs.datadoghq.eu",
      path: `/api/v2/logs?dd-api-key=${DATADOG_API_KEY}&ddsource=nodejs&service=${APPLICATION_NAME}`,
      ssl: true,
    }),
    new transports.Console({
      format: format.combine(format.colorize({ level: true }), format.simple()),
    }),
  ],
});

export function createLogger(module: string) {
  return logger.child({ module });
}
