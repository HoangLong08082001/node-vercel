const pool = require("../../config/database");
const ServiceCommission = require("./CommissionModal");

const getAllCommission = (req, res) => {
  try {
    pool.query(ServiceCommission.getAll, [], (err, data) => {
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

const getByIdCommission = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(ServiceCommission.getById, [id], (err, data) => {
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

module.exports = {
  getAllCommission,
  getByIdCommission
};
