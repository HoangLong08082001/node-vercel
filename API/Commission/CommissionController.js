const pool = require("../../config/database");
const { ServiceOrder } = require("../Orders/OrdersModals");
const ServiceCommission = require("./CommissionModal");
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const calculatePercentageChange = (yesterday, today) => {
  if (yesterday === 0) {
    return today === 0 ? 0 : 100;
  }
  return ((today - yesterday) / yesterday) * 100;
};
const getAllCommission = (req, res) => {
  try {
    pool.query(ServiceCommission.getAll(), [], (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        let maxdate = data[0].max_date;
        let mindate = data[0].min_date;
        return res.status(200).json({
          max_date: formatDate(maxdate),
          min_date: formatDate(mindate),
          data,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const getByIdCommission = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(ServiceCommission.getById(), [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        return res.status(200).json(data);
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
const compareCommission = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(ServiceCommission.commissionYesterday(), [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        let totalYesterDay = data[0].total_yesterday;
        pool.query(ServiceCommission.commissionToday(), [id], (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            let totalToday = data[0].total_today;
            const percentageChange = calculatePercentageChange(
              totalYesterDay,
              totalToday
            );
            return res
              .status(200)
              .json(percentageChange > 100 ? 100 : percentageChange);
          }
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
module.exports = {
  getAllCommission,
  getByIdCommission,
  compareCommission,
};
