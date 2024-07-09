const logger = require("../../middleware/logger");

const getVNDateTine = (date) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const day = date.toLocaleDateString("vi-VN", options);
  const time = date.toLocaleTimeString("vi-VN");
  return `${day} ${time}`;
};

const readLog = (req, res, next) => {
  res.on("finish", () => {
    const newLogMessages = {
      url: req.originalUrl,
      name: req.app.get("name") || "N/A",
      date: getVNDateTine(new Date()),
      status: res.statusCode,
      method: req.method,
    };
    logger(newLogMessages);
  });
  next();
};

module.exports = readLog;
