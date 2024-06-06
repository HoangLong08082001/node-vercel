const pool = require("../../config/database.js");
const { ServiceDepartment } = require("./DepartmentModal.js");

const createDepartment = (req, res) => {
  let name = req.body.name;
  pool.query(ServiceDepartment.checkExists, [name], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      return res
        .status(400)
        .json({ message: "Bộ phận này đã tồn tại trong hệ thống" });
    } else {
      pool.query(ServiceDepartment.create, [name], (err, data) => {
        if (err) {
          throw err;
        }
        if (data) {
          return res.status(200).json({ message: "success" });
        }
      });
    }
  });
};

const getAlDepartment = (req, res) => {
  try {
    pool.query(ServiceDepartment.all, [], (err, data) => {
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

module.exports = { createDepartment, getAlDepartment };
