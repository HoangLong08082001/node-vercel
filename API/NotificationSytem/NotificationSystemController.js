const pool = require("../../config/database");
const ServiceNotification = require("./NotificationSystemModal");

const getAllNotification = (req, res) => {
  try {
    pool.query(ServiceNotification.allNotification(), [], (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        return res.status(200).json(data);
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

module.exports = { getAllNotification };
