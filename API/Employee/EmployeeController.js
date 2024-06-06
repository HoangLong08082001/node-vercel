const pool = require("../../config/database.js");
const {
  createJwtReNew,
  createJwtWebsite,
} = require("../../middleware/JwtAction.js");
const { ServiceEmployee } = require("./EmployeeModal.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const salt = 10;
const randomNumberCodeVerfify = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
const getToday = () => {
  const today = new Date();

  // Lấy năm, tháng, và ngày từ đối tượng ngày
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0 nên cần +1 và đảm bảo 2 chữ số
  const day = String(today.getDate()).padStart(2, "0"); // Đảm bảo 2 chữ số

  // Tạo chuỗi ngày theo định dạng yyyy-mm-dd
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};
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
            [id_department, username, hash, phone, 1, getToday()],
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
        console.log(data);
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể get dữ liệu" });
  }
};

const rePassword = (req, res) => {
  let username = req.body.email;
  let newpass = "";
  console.log(username);
  try {
    pool.query(
      ServiceEmployee.checkLogin,
      [username, username],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          newpass = randomNumberCodeVerfify();
          bcrypt.hash(newpass.toString(), salt, (err, hash) => {
            if (err) {
              throw err;
            }
            if (hash) {
              pool.query(
                ServiceEmployee.rePass,
                [hash, username],
                (err, result) => {
                  if (err) {
                    throw err;
                  }
                  if (result) {
                    const transport = nodemailer.createTransport({
                      host: "smtp.gmail.com",
                      port: 587,
                      service: "gmail",
                      secure: false,
                      auth: {
                        user: "longhoang882001@gmail.com",
                        pass: "dyygjdykverudrtb",
                      },
                    });

                    // Thiết lập email options
                    const mailOptions = {
                      from: "longhoang882001@gmail.com", // Địa chỉ email của người gửi
                      to: `${username}`, // Địa chỉ email của người nhận
                      subject: "Ecoop send new password", // Tiêu đề email
                      text: `Send mail from Ecoop to renew password: ${newpass}`, // Nội dung email
                    };
                    transport.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        throw error;
                      }
                      console.log("Verify code from Ecoop: " + info.response);
                    });
                    return res.status(200).json({ message: "success" });
                  }
                }
              );
            }
          });
        } else {
          return res.status(400).json({ message: "Email này không tồn tại" });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const setNewPassword = (req, res) => {
  let username = req.body.email;
  let oldPassowrd = req.body.oldPassword;
  let newPassword = req.body.newPassword;
  console.log(username + " " + oldPassowrd + " " + newPassword);
  try {
    pool.query(
      ServiceEmployee.checkUsernamePassword,
      [username],
      (err, result) => {
        if (err) {
          throw err;
        }
        if (result.length > 0) {
          console.log(result[0]);
          bcrypt.compare(
            oldPassowrd.toString(),
            result[0].password,
            (err, result) => {
              if (err) {
                throw err;
              }
              if (result) {
                bcrypt.hash(newPassword.toString(), salt, (err, hash) => {
                  if (err) {
                    throw err;
                  }
                  if (hash) {
                    pool.query(
                      ServiceEmployee.rePassword,
                      [hash, username],
                      (err, data) => {
                        if (err) {
                          throw err;
                        }
                        if (data) {
                          return res
                            .status(200)
                            .json({ message: "success", data: data });
                        }
                      }
                    );
                  }
                });
              }
            }
          );
        } else {
          return res.status(400).json({
            message: "Sai password hoặc username! vui lòng kiểm tra lại",
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const updateInformation = (req, res) => {};

module.exports = {
  createEmployee,
  loginEmployee,
  getAllEmployee,
  rePassword,
  setNewPassword,
  updateInformation,
};
