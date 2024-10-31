const morgan = require("morgan");
const winston = require("winston");
require("winston-daily-rotate-file");

const { combine, timestamp, printf, colorize, align } = winston.format;

const dailyTransport = new winston.transports.DailyRotateFile({
  filename: "logs/monitoring-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
});

const logger = winston.createLogger({
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

const morganMiddleware = morgan(
  `:status :url :method :response-time ms :body`,
  {
    stream: {
      write: function (message) {
        return logger.http(message.trim());
      },
    },
  }
);

morgan.token("body", function (req) {
  if (req.method !== "GET") {
    return req.bodyContent || "";
  }
  return "";
});

module.exports = { logger, morganMiddleware };
