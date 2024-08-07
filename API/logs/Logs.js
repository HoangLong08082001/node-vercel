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
const formatDate1 = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
function getCurrentTimeFormatted() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
const readLog = (req, res, next) => {
  res.on("finish", () => {
    if (
      req.method !== "GET"
    ) {
      const newLogMessages = {
        url: req.originalUrl,
        
        name: req.app.get("name") || "N/A",
        name_action:req.app.get("id"),
        date: formatDate1(new Date()),
        time:getCurrentTimeFormatted(),
        status: res.statusCode,
        method: req.method,
      };
      logger(newLogMessages);
    }
  });
  next();
};

module.exports = readLog;
