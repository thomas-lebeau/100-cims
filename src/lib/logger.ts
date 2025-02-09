import { createLogger, format, transports } from "winston";

const DATADOG_API_KEY = process.env.DATADOG_API_KEY;
const APPLICATION_NAME = "100-cims";

export const logger = createLogger({
  level: "info",
  exitOnError: false,
  format: format.json(),
  transports: [
    new transports.Console({
      format: format.simple(),
    }),
  ],
});

if (DATADOG_API_KEY) {
  logger.add(
    new transports.Http({
      host: "http-intake.logs.datadoghq.eu",
      path: `/api/v2/logs?dd-api-key=${DATADOG_API_KEY}&ddsource=nodejs&service=${APPLICATION_NAME}`,
      ssl: true,
    })
  );
}
