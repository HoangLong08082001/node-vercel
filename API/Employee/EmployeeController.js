const pool = require("../../config/database.js");
const {
  createJwtReNew,
  createJwtWebsite,
} = require("../../middleware/JwtAction.js");
const { ServiceEmployee } = require("./EmployeeModal.js");
const bcrypt = require("bcrypt");
const salt = 10;

//id_department	username	password	phone	status	code_verify	date_create	time_create
const createEmployee = (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let phone = req.body.phone;
  let id_department = req.body.id_department;
  pool.query(ServiceEmployee.checkEmail, [username], (err, result) => {
    if (err) {
      throw er;
    }
    if (result.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    } else {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          throw er;
        }
        if (hash) {
          pool.query(
            ServiceEmployee.create,
            [id_department, username, hash, phone, 1],
            (err, data) => {
              if (err) {
                throw er;
              }
              if (data) {
                return res.status(200).json({ message: "success" });
              }
            }
          );
        }
      });
    }
  });
};
const loginEmployee = (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  pool.query(ServiceEmployee.checkLogin, [username, username], (err, data) => {
    if (err) {
      throw err;
    }
    if (data.length > 0) {
      console.log(data[0]);
      bcrypt.compare(password.toString(), data[0].password, (err, result) => {
        if (err) {
          throw err;
        }
        if (result) {
          pool.query(
            ServiceEmployee.checkPermission,
            [username],
            (err, response) => {
              if (err) {
                throw err;
              }
              if (response) {
                let payload = {
                  data: response,
                };
                let token = createJwtWebsite(payload);
                if (response && token) {
                  res.cookie("jwt", token, { httpOnly: true });
                }
                return res.status(200).json({
                  message: "success",
                  response,
                  access_token: token,
                });
              }
            }
          );
        }
      });
    } else {
      return res
        .status(400)
        .json({ message: "Email hoặc số điện thoại này không tồn tại" });
    }
  });
};

const getAllEmployee = (req, res) => {
  try {
    pool.query(ServiceEmployee.getAll, [], (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        return res.status(200).json({ result: data });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể get dữ liệu" });
  }
};

module.exports = { createEmployee, loginEmployee, getAllEmployee };
