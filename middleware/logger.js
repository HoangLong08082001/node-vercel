const { createLogger, format, transports } = require("winston");
const { combine, timestamp, json } = format;

const logger = createLogger({
  level: "info", // Cấu hình cấp độ log tối thiểu là 'info'
  format: combine(timestamp(), json()),
  transports: [
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" }),
  ],
});

module.exports = logger;
