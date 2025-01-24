import morgan from "morgan";
import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, align } = winston.format;

const dailyTransport = new winston.transports.DailyRotateFile({
  filename: "logs/monitoring-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
});

export const logger = winston.createLogger({
  level: "http",
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
    align(),
    printf(function (info) {
      return `[${info.timestamp}] ${info.level}: ${info.message}`;
    })
  ),
  transports: [dailyTransport, new winston.transports.Console()],
});

export const morganMiddleware = morgan(
  `:status :url :method :response-time ms :body`,
  {
    stream: {
      write: function (message) {
        return logger.http(message.trim());
      },
    },
  }
);

export const logDBError = (func_name, error) => {
  logger.error({
    func: func_name,
    error: {
      code: error.code,
      message: error.sqlMessage,
      // sql: error.sql, // temporary commented out
    },
  });
};

morgan.token("body", function (req) {
  if (req.method !== "GET") {
    return req.bodyContent || "";
  }
  return "";
});
