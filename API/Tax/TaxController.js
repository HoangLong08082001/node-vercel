const pool = require("../../config/database");
const ServiceTax = require("./TaxModal");
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const getAll = (req, res) => {
  try {
    pool.query(ServiceTax.getAllTax(), [], (err, data) => {
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

module.exports = { getAll };
