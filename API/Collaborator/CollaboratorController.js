const axios = require("axios");
const pool = require("../../config/database.js");
const bcrypt = require("bcrypt");
const { ServiceCollaborator } = require("./CollaboratorModal.js");
const { createJwtApp } = require("../../middleware/JwtAction.js");
const nodemailer = require("nodemailer");
const ServicePayment = require("../Payment/PaymentModal.js");
const salt = 10;
const randomNumberCodeVerfify = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
const registerAccount = async (req, res) => {
  try {
    //name_collaborator	password_collaborator	email_collaborator	gender	address_collaborator	phone	presenter_phone	status_collaborator
    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email;
    let phone = req.body.phone;
    if (
      (name !== "" && password !== "" && email !== "" && phone !== "") ||
      (name !== null && password !== null && email !== null && phone !== null)
    ) {
      pool.query(ServiceCollaborator.check, [email, phone], (err, result) => {
        if (err) {
          throw err;
        }
        if (result.length > 0) {
          console.log(result);
          return res
            .status(400)
            .json({ message: "Email hoặc số điện thoại đã tồn tại!" });
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              throw er;
            }
            if (hash) {
              pool.query(
                ServiceCollaborator.register,
                [
                  name,
                  hash,
                  email,
                  phone,
                  1,
                  1,
                  0,
                  1,
                  randomNumberCodeVerfify(),
                ],
                (err, result) => {
                  if (err) {
                    throw err;
                  }
                  if (result) {
                    pool.query(
                      ServicePayment.addpayment,
                      [0, 0, result.insertId],
                      (err, result) => {
                        if (err) {
                          throw err;
                        }
                        if (result) {
                          console.log(result);
                          return res.status(200).json({ message: "success" });
                        }
                      }
                    );
                  }
                }
              );
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "fails" });
  }
};

const loginAccount = (req, res) => {
  try {
    let email = req.body.payload.email;
    let password = req.body.payload.password;
    if (
      (email !== "" && password !== "") ||
      (email !== null && password !== null)
    ) {
      pool.query(ServiceCollaborator.login, [email, email], (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          console.log(data[0]);
          bcrypt.compare(
            password.toString(),
            data[0].password_collaborator,
            (err, response) => {
              if (err) {
                throw err;
              }
              if (response) {
                pool.query(
                  ServiceCollaborator.login,
                  [email, email],
                  (err, data) => {
                    if (err) {
                      throw err;
                    }
                    if (data) {
                      let payload = {
                        data: data,
                      };
                      let token = createJwtApp(payload);
                      if (data && token) {
                        res.cookie("jwt", token, { httpOnly: true });
                      }
                      if (data[0].status_verify === 0) {
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
                          to: `${data[0].email_collaborator}`, // Địa chỉ email của người nhận
                          subject: "Ecoop send code verify", // Tiêu đề email
                          text: `Verify code from Ecoop ${data[0].code_verify}`, // Nội dung email
                        };
                        transport.sendMail(mailOptions, (error, info) => {
                          if (error) {
                            throw error;
                          }
                          console.log(
                            "Verify code from Ecoop: " + info.response
                          );
                        });
                        return res.status(200).json({
                          message: "success",
                          data,
                          access_token: token,
                        });
                      }
                      if (data[0].status_verify === 1) {
                        return res.status(200).json({
                          message: "success",
                          data,
                          access_token: token,
                        });
                      }
                    } else {
                      return res
                        .status(400)
                        .json({ message: "Không thể đăng nhập" });
                    }
                  }
                );
              }
              if (!response) {
                return res
                  .status(400)
                  .json({ message: "Sai username hoặc password" });
              }
            }
          );
        } else {
          return res
            .status(400)
            .json({ message: "Sai username hoặc password" });
        }
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};

const codeVerify = (req, res) => {
  try {
    let code_verify = req.body.code;
    pool.query(ServiceCollaborator.verify, [code_verify], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        pool.query(
          ServiceCollaborator.updateStatusVerify,
          [1, code_verify],
          (err, result) => {
            if (err) {
              throw err;
            }
            if (result) {
              return res.status(200).json({ message: "success" });
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Sai mã xác nhận" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};

const presenterPhone = (req, res) => {
  let email = req.body.email;
  let phone = req.body.phone;
  console.log(email + phone);
  pool.query(ServiceCollaborator.checkPresenterPhone, [phone], (err, data) => {
    if (err) {
      throw err;
    }
    if (data.length > 0) {
      pool.query(
        ServiceCollaborator.updatePresenter,
        [phone, 2, email],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            pool.query(
              ServiceCollaborator.updateStatusPhone,
              [phone],
              (err, data) => {
                if (err) {
                  throw err;
                }
                if (data) {
                  let id_lv1 = null;
                  let id_lv2 = null;
                  pool.query(
                    ServiceCollaborator.checkExistsPhone,
                    [phone],
                    (err, data) => {
                      if (err) {
                        throw err;
                      }
                      if (data.length > 0) {
                        id_lv1 = data[0].id_collaborator;
                        pool.query(
                          ServiceCollaborator.checkExistsEmail,
                          [email],
                          (err, data) => {
                            if (err) {
                              throw err;
                            }
                            if (data.length > 0) {
                              id_lv2 = data[0].id_collaborator;
                              pool.query(
                                ServiceCollaborator.checkIdCap1,
                                [id_lv1],
                                (err, data) => {
                                  if (err) {
                                    throw err;
                                  }
                                  if (data.length > 0) {
                                    pool.query(
                                      ServiceCollaborator.checkIdCap1Team,
                                      [id_lv1],
                                      (err, data) => {
                                        if (err) {
                                          throw err;
                                        }
                                        if (data) {
                                          let id_team = data[0].id_team;
                                          pool.query(
                                            ServiceCollaborator.createTeamCTV,
                                            [id_team, id_lv2],
                                            (err, data) => {
                                              if (err) {
                                                throw err;
                                              }
                                              if (data) {
                                                pool.query(
                                                  ServiceCollaborator.getCount,
                                                  [id_team],
                                                  (err, data) => {
                                                    if (err) {
                                                      throw err;
                                                    }
                                                    if (data)
                                                      console.log(
                                                        data[0].soluong
                                                      );
                                                    pool.query(
                                                      ServiceCollaborator.updateQuantity,
                                                      [
                                                        data[0].soluong,
                                                        id_team,
                                                      ],
                                                      (err, data) => {
                                                        if (err) {
                                                          throw err;
                                                        }
                                                        if (data) {
                                                          return res
                                                            .status(200)
                                                            .json({
                                                              message:
                                                                "success",
                                                            });
                                                        }
                                                      }
                                                    );
                                                  }
                                                );
                                              }
                                            }
                                          );
                                        }
                                      }
                                    );
                                  } else {
                                    pool.query(
                                      ServiceCollaborator.createTeam,
                                      [0, `https://ecoop.vn/?bwaf=`],
                                      (err, data) => {
                                        if (err) {
                                          throw err;
                                        }
                                        if (data) {
                                          let idTeam = data.insertId;
                                          pool.query(
                                            ServiceCollaborator.createTeamCTVC1,
                                            [idTeam, id_lv1],
                                            (err, data) => {
                                              if (err) {
                                                throw err;
                                              }
                                              if (data) {
                                                pool.query(
                                                  ServiceCollaborator.createTeamCTVC1,
                                                  [idTeam, id_lv2],
                                                  (err, data) => {
                                                    if (err) {
                                                      throw err;
                                                    }
                                                    if (data) {
                                                      pool.query(
                                                        ServiceCollaborator.getCount,
                                                        [idTeam],
                                                        (err, data) => {
                                                          if (err) {
                                                            throw err;
                                                          }
                                                          if (data) {
                                                            console.log(
                                                              data[0].soluong
                                                            );
                                                            pool.query(
                                                              ServiceCollaborator.updateQuantity,
                                                              [
                                                                data[0].soluong,
                                                                idTeam,
                                                              ],
                                                              (err, data) => {
                                                                if (err) {
                                                                  throw err;
                                                                }
                                                                if (data) {
                                                                  return res
                                                                    .status(200)
                                                                    .json({
                                                                      message:
                                                                        "success",
                                                                    });
                                                                }
                                                              }
                                                            );
                                                          }
                                                        }
                                                      );
                                                    }
                                                  }
                                                );
                                              }
                                            }
                                          );
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    } else {
      return res
        .status(400)
        .json({ message: "Số điện thoại này chưa tồn tại" });
    }
  });
};
const getAccount = (req, res) => {
  pool.query(ServiceCollaborator.getAll, [], (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      return res.status(200).json(data);
    }
  });
};

const signOutAccount = (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};

const updateInformation = (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let emailData = req.body.emailData;
  let presenterPhone = req.body.referral;
  console.log(name + " " + email + " " + emailData + presenterPhone);

  if (
    (presenterPhone === "" || presenterPhone === undefined) &&
    emailData !== email
  ) {
    try {
      pool.query(ServiceCollaborator.checkEmail, [email], (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          return res
            .status(400)
            .json({ message: "Email đã tồn tại! vui lòng nhập email khác" });
        } else {
          pool.query(
            ServiceCollaborator.updateCollaboratorNoPhone,
            [name, email, emailData],
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ message: "fails" });
              }
              if (result) {
                console.log(result);
                return res
                  .status(200)
                  .json({ message: "success", data: result });
              }
            }
          );
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "fails" });
    }
  } else if (
    (presenterPhone === "" || presenterPhone === undefined) &&
    emailData === email
  ) {
    try {
      pool.query(
        ServiceCollaborator.updateCollaboratorNoPhone,
        [name, email, emailData],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "fails" });
          }
          if (result) {
            console.log(result);
            return res.status(200).json({ message: "success", data: result });
          }
        }
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "fails" });
    }
  } else if (
    (presenterPhone !== "" || presenterPhone !== undefined) &&
    email === emailData
  ) {
    try {
      pool.query(
        ServiceCollaborator.updateCollaborator,
        [name, email, presenterPhone, 2, email],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "fails" });
          }
          if (result) {
            console.log(result);
            return res.status(200).json({ message: "success", data: result });
          }
        }
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "fails" });
    }
  } else if (
    (presenterPhone !== "" || presenterPhone !== undefined) &&
    emailData !== email
  ) {
    try {
      pool.query(ServiceCollaborator.checkEmail, [email], (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          return res
            .status(400)
            .json({ message: "Email đã tồn tại! vui lòng nhập email khác" });
        } else {
          pool.query(
            ServiceCollaborator.updateCollaborator,
            [name, email, presenterPhone, 2, emailData],
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ message: "fails" });
              }
              if (result) {
                console.log(result);
                return res
                  .status(200)
                  .json({ message: "success", data: result });
              }
            }
          );
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "fails" });
    }
  }
};

const reNewpassword = (req, res) => {
  let email = req.body.email;
  try {
    pool.query(ServiceCollaborator.checkEmail, [email], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        console.log(data[0]);
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
          from: "ECOOPMART.VN", // Địa chỉ email của người gửi
          to: `${email}`, // Địa chỉ email của người nhận
          subject: "Ecoop send message to renew password", // Tiêu đề email
          text: `To reset your password, you need to log in to the page https://node-vercel-sigma.vercel.app/views/repassword-page. Please enter your registered email and enter the new password to be reset.`, // Nội dung email
        };
        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            throw error;
          }
          if (info) {
            console.log("Verify code from Ecoop: " + info.response);
            return res.status(200).json({ message: "success" });
          }
        });
      } else {
        return res
          .status(400)
          .json({ message: "Không tìm thấy email đã đăng ký" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};
const resendCodeVerify = (req, res) => {
  let email = req.body.email;
  pool.query(
    ServiceCollaborator.resendCode,
    [randomNumberCodeVerfify(), email],
    (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        pool.query(ServiceCollaborator.sendCode, [email], (err, result) => {
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
              to: `${email}`, // Địa chỉ email của người nhận
              subject: "Ecoop send code verify", // Tiêu đề email
              text: `Verify code from Ecoop ${result[0].code_verify}`, // Nội dung email
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
        });
      }
    }
  );
};

const getAllCollaborator = (req, res) => {
  try {
    pool.query(ServiceCollaborator.get, [], (err, data) => {
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

const setStatus = (req, res) => {
  let id_collaborator = req.body.collaborators;
  console.log(id_collaborator);
  try {
    if (!Array.isArray(id_collaborator) || id_collaborator.length === 0) {
      return res.status(400).json({ error: "Invalid input" });
    }
    pool.query(
      ServiceCollaborator.checkStatus,
      [id_collaborator],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          pool.query(
            ServiceCollaborator.setStatusTrue,
            [id_collaborator],
            (err, result) => {
              if (err) {
                throw err;
              }
              if (result) {
                return res.status(200).json({ message: "success" });
              }
            }
          );
        } else {
          pool.query(
            ServiceCollaborator.setStatusFalse,
            [id_collaborator],
            (err, result) => {
              if (err) {
                throw err;
              }
              if (result) {
                return res.status(200).json({ message: "success" });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const deleteCollaborator = (req, res) => {
  let id = req.body.idCollaborator;
  try {
    pool.query(ServiceCollaborator.delete, [id], (err, data) => {
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
const getById = (req, res) => {
  let id = req.params.id;
  console.log(id);
  try {
    pool.query(ServiceCollaborator.getByid, [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        return res.status(200).json({ message: "success", data: data });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

module.exports = {
  registerAccount,
  loginAccount,
  codeVerify,
  presenterPhone,
  getAccount,
  signOutAccount,
  updateInformation,
  reNewpassword,
  resendCodeVerify,
  getAllCollaborator,
  setStatus,
  deleteCollaborator,
  getById,
};
