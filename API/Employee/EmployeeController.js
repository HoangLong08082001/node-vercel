const pool = require("../../config/database.js");
const {
  createJwtReNew,
  createJwtWebsite,
  createJwtApp,
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
const createEmployee = (req, res, io) => {
  let username = req.body.username;
  let name = req.body.name;
  let phone = req.body.phone;
  let id_department = req.body.id_department;
  pool.query(ServiceEmployee.checkEmail(), [username], (err, result) => {
    if (err) {
      throw er;
    }
    if (result.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    } else {
      pool.query(
        ServiceEmployee.create(),
        [id_department, name, username, phone, 1, getToday()],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            return res.status(200).json({ message: "success" });
          }
        }
      );
    }
  });
};
const loginEmployee = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Kiểm tra trong bảng employee trước
  pool.query(
    ServiceEmployee.checkLogin(),
    [username, username],
    (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }

      if (data.length > 0) {
        // Tìm thấy user trong bảng employee
        bcrypt.compare(password.toString(), data[0].password, (err, result) => {
          if (err) {
            return res.status(500).json({ message: "Internal server error" });
          }
          if (result) {
            pool.query(
              ServiceEmployee.checkPermission(),
              [username],
              (err, response) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ message: "Internal server error" });
                }
                if (response.length > 0) {
                  const payload = { data: response };
                  const token = createJwtApp(payload);
                  if (token) {
                    res.cookie("jwt", token, { httpOnly: true });
                    return res.status(200).json({
                      message: "success",
                      response,
                      access_token: token,
                    });
                  }
                }
                return res.status(401).json({ message: "Unauthorized" });
              }
            );
          } else {
            return res.status(401).json({ message: "Invalid password" });
          }
        });
      } else {
        // Nếu không tìm thấy trong bảng employee, kiểm tra bảng collaborator
        pool.query(
          "SELECT * FROM collaborator WHERE email_collaborator = ? OR phone = ?",
          [username, username],
          (err, data) => {
            if (err) {
              return res.status(500).json({ message: "Internal server error" });
            }

            if (data.length > 0) {
              bcrypt.compare(
                password.toString(),
                data[0].password_collaborator,
                (err, hash) => {
                  if (err) {
                    return res
                      .status(500)
                      .json({ message: "Internal server error" });
                  }
                  if (hash) {
                    pool.query(
                      "SELECT email_collaborator as username, name_collaborator as name, phone, status_account as status FROM collaborator WHERE email_collaborator=? OR phone=?",
                      [username, username],
                      (err, response) => {
                        if (err) {
                          return res
                            .status(500)
                            .json({ message: "Internal server error" });
                        }
                        if (response.length > 0) {
                          response[0].name_department = "Cộng tác viên";
                          const payload = { data: response };
                          const token = createJwtApp(payload);
                          if (token) {
                            res.cookie("jwt", token, { httpOnly: true });
                            return res.status(200).json({
                              message: "success",
                              response,
                              access_token: token,
                            });
                          }
                        }
                        return res
                          .status(401)
                          .json({ message: "Unauthorized" });
                      }
                    );
                  } else {
                    return res
                      .status(401)
                      .json({ message: "Invalid password" });
                  }
                }
              );
            } else {
              return res
                .status(400)
                .json({
                  message: "Email hoặc số điện thoại này không tồn tại",
                });
            }
          }
        );
      }
    }
  );
};

const getAllEmployee = (req, res) => {
  try {
    pool.query(ServiceEmployee.getAll(), [], (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        return res.status(200).json(data);
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể get dữ liệu" });
  }
};

const rePassword = (req, res) => {
  let username = req.body.email;
  let newpass = "";
  try {
    pool.query(
      ServiceEmployee.checkLogin(),
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
                ServiceEmployee.rePass(),
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
                        user: "ecoopmart.app@gmail.com",
                        pass: "gfiexhusjpvwkhsi",
                      },
                    });

                    // Thiết lập email options
                    const mailOptions = {
                      from: "ecoopmart.app@gmail.com", // Địa chỉ email của người gửi
                      to: `${username}`, // Địa chỉ email của người nhận
                      subject: "Ecoop send new password", // Tiêu đề email
                      text: `Send mail from Ecoop to renew password: ${newpass}`, // Nội dung email
                    };
                    transport.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        throw error;
                      }
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
  try {
    pool.query(
      ServiceEmployee.checkUsernamePassword(),
      [username],
      (err, result) => {
        if (err) {
          throw err;
        }
        if (result.length > 0) {
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
                      ServiceEmployee.rePassword(),
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

const updateInformation = (req, res) => {
  let username = req.body.email;
  let name = req.body.name;
  let phone = req.body.phone;
  let oldusername = req.body.oldusername;
  let oldname = req.body.oldname;
  let oldphone = req.body.oldphone;
  try {
    if (username === oldusername && name === oldname && phone === oldphone) {
      return res
        .status(400)
        .json({ message: "Không có dữ liệu mới để cập nhật" });
    }
    if (username === "" || name === "" || phone === "") {
      return res
        .status(400)
        .json({ message: "Vui lòng không để trống thông tin" });
    }
    if (phone !== oldphone && username === oldusername && name === oldname) {
      pool.query(
        ServiceEmployee.updatePhone(),
        [phone, oldusername],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            return res.status(200).json({ message: "success" });
          }
        }
      );
    }
    if (name !== oldname && phone === oldphone && username === oldusername) {
      pool.query(
        ServiceEmployee.updateName(),
        [name, oldusername],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            return res.status(200).json({ message: "success" });
          }
        }
      );
    }
    if (name !== oldname && phone !== oldphone && username && oldusername) {
      pool.query(
        ServiceEmployee.updateNamePhone(),
        [name, phone, oldusername],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            return res.status(200).json({ message: "success" });
          }
        }
      );
    }
    if (username !== oldusername && name === oldname && phone === oldphone) {
      pool.query(
        ServiceEmployee.updateEmail(),
        [username, oldusername],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            return res.status(200).json({ message: "success" });
          }
        }
      );
    }
    if (username !== oldusername && phone !== oldphone && name === oldname) {
      pool.query(
        ServiceEmployee.checkUsernamePhone(),
        [username, phone],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data.length > 0) {
            pool.query(
              ServiceEmployee.updateEmailPhone(),
              [username, phone, oldusername],
              (err, data) => {
                if (err) {
                  throw err;
                }
                if (data) {
                  return res.status(200).json({ message: "success" });
                }
              }
            );
          }
        }
      );
    }
    if (username !== oldusername && name !== oldname && phone === oldphone) {
      pool.query(
        ServiceEmployee.updateEmailName(),
        [username, name, oldusername],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            return res.status(200).json({ message: "success" });
          }
        }
      );
    }
    if (username !== oldusername && name !== oldname && phone !== oldphone) {
      pool.query(
        ServiceEmployee.checkUsernamePhone(),
        [username, phone],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data.length > 0) {
            pool.query(
              ServiceEmployee.updateEmailNamePhone(),
              [username, name, phone, oldusername],
              (err, data) => {
                if (err) {
                  throw err;
                }
                if (data) {
                  return res.status(200).json({ message: "success" });
                }
              }
            );
          }
        }
      );
    }
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const blockEmployee = (req, res) => {
  let id_employee = req.body.employees;
  try {
    if (!Array.isArray(id_employee) || id_employee.length === 0) {
      return res.status(400).json({ error: "Invalid input" });
    }
    pool.query(ServiceEmployee.checkStatus(), [id_employee], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        pool.query(
          ServiceEmployee.updateStatusTrue(),
          [id_employee],
          (err, results) => {
            if (err) {
              throw err;
            }
            if (results) {
              return res.status(200).json({ message: "success" });
            }
          }
        );
      } else {
        pool.query(
          ServiceEmployee.updateStatusFalse(),
          [id_employee],
          (err, results) => {
            if (err) {
              throw err;
            }
            if (results) {
              return res.status(200).json({ message: "success" });
            }
          }
        );
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const sendMailToLogin = (req, res) => {
  let username = req.body.username;
  let randPass = randomNumberCodeVerfify();
  try {
    bcrypt.hash(randPass.toString(), salt, (err, hash) => {
      if (err) {
        throw err;
      }
      if (hash) {
        pool.query(
          ServiceEmployee.updatePassword(),
          [hash, username],
          (err, data) => {
            if (err) {
              throw err;
            }
            if (data) {
              const transport = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                service: "gmail",
                secure: false,
                auth: {
                  user: "ecoopmart.app@gmail.com",
                  pass: "gfiexhusjpvwkhsi",
                },
              });
              // Thiết lập email options
              const mailOptions = {
                from: "ecoopmart.app@gmail.com", // Địa chỉ email của người gửi
                to: `${username}`, // Địa chỉ email của người nhận
                subject: `Ecoop sending account to ${username}`, // Tiêu đề email
                text: `Send account from Ecoop to login Admin page`, // Nội dung email
                html: `<br/><p>username: ${username}</p><p>password:${randPass}</p>`,
              };
              transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                  throw error;
                }
                if (info) {
                  return res.status(200).json({ message: "success" });
                }
              });
            }
          }
        );
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "error system" });
  }
};

module.exports = {
  createEmployee,
  loginEmployee,
  getAllEmployee,
  rePassword,
  setNewPassword,
  updateInformation,
  blockEmployee,
  sendMailToLogin,
};
