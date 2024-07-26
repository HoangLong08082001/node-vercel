const pool = require("../../config/database");
const ServicePayment = require("./PaymentModal");
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0, nên cộng thêm 1
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
const formatDate1 = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const formatDateMin = (date) => {
  const day = String(date.getDate() - 1).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const formatDateMax = (date) => {
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
const drawCommission = (req, res) => {
  let id = req.body.id_collaborator;
  try {
    pool.query(ServicePayment.getTotalRecived(), [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        let total_recived1 = data[0].total_recived;
        pool.query(
          ServicePayment.updatePayment(),
          [total_recived1, id],
          (err, data) => {
            if (err) {
              throw err;
            }
            if (data) {
              pool.query(
                ServicePayment.getTotalRecived(),
                [id],
                (err, data) => {
                  if (err) {
                    throw err;
                  }
                  if (data.length > 0) {
                    let total_recived2 = data[0].total_recived;
                    let temp_balance = data[0].temp_balance;
                    let total_pending = data[0].total_pending;

                    pool.query(
                      ServicePayment.insertWithdraw(),
                      [
                        formatDate(new Date()),
                        total_recived2,
                        total_recived2,
                        total_recived2,
                        0,
                        1,
                        0,
                        id,
                      ],
                      (err, data) => {
                        if (err) {
                          throw err;
                        }
                        if (data) {
                          let id_withdraw = data.insertId;
                          pool.query(
                            ServicePayment.updatePayment2(),
                            [total_recived2 - total_recived2, id],
                            (err, data) => {
                              if (err) {
                                throw err;
                              }
                              if (data) {
                                pool.query(
                                  ServicePayment.updatePayment3(),
                                  [
                                    parseInt(
                                      parseInt(temp_balance) +
                                        parseInt(total_pending)
                                    ),
                                    id,
                                  ],
                                  (err, data) => {
                                    if (err) {
                                      throw err;
                                    }
                                    if (data) {
                                      pool.query(
                                        ServicePayment.checkPaymentByIdColla(),
                                        [id],
                                        (err, data) => {
                                          if (err) {
                                            throw err;
                                          }
                                          if (data.length > 0) {
                                            let total_recived3 =
                                              data[0].total_recived;
                                            pool.query(
                                              ServicePayment.updateWithdraw(),
                                              [total_recived3, id, id_withdraw],
                                              (err, data) => {
                                                if (err) {
                                                  throw err;
                                                }
                                                if (data) {
                                                  return res.status(200).json({
                                                    message: "success",
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
                  } else {
                    return res.status(400).json({ message: "not exists" });
                  }
                }
              );
            }
          }
        );
        // pool.query(
        //   "SELECT SUM(withdraw.amount_pending) as total_pending FROM withdraw WHERE id_collaborator = ? ",
        //   [id],
        //   (err, data) => {
        //     if (err) {
        //       throw err;
        //     }
        //     if (data.length > 0) {
        //       let total_pending = data[0].total_pending;
        //       if (total_recived !== 0 && total_recived > 0) {
        //         pool.query(
        //           ServicePayment.addWithdraw(),
        //           [
        //             formatDate(new Date()),
        //             total_recived,
        //             parseInt(parseInt(total_recived) - parseInt(total_pending)),
        //             parseInt(parseInt(total_recived) - parseInt(total_pending)),
        //             0,
        //             id,
        //           ],
        //           (err, data) => {
        //             if (err) {
        //               throw err;
        //             }
        //             if (data) {
        //               let id_withdraw = data.insertId;
        //               pool.query(
        //                 "SELECT SUM(withdraw.amount_transferred) as total_amount_transferred FROM withdraw WHERE withdraw.id_collaborator = ?",
        //                 [id],
        //                 (err, data) => {
        //                   if (err) {
        //                     throw err;
        //                   }
        //                   if (data.length > 0) {
        //                     let total_amount = data[0].total_amount_transferred;
        //                     if (total_amount >= total_recived) {
        //                       pool.query(
        //                         "DELETE FROM withdraw WHERE id_withdraw=?",
        //                         [id_withdraw],
        //                         (err, data) => {
        //                           if (err) {
        //                             throw err;
        //                           }
        //                           if (data) {
        //                             return res.status(400).json({
        //                               message: "Số dư khả dụng không đủ",
        //                             });
        //                           }
        //                         }
        //                       );
        //                     } else {
        //                       return res
        //                         .status(200)
        //                         .json({ message: "success" });
        //                     }
        //                   }
        //                 }
        //               );
        //             }
        //           }
        //         );
        //       } else {
        //         return res
        //           .status(400)
        //           .json({ message: "Số tiền rút phải lớn hơn 0đ" });
        //       }
        //     }
        //   }
        // );
      } else {
        return res.status(400).json({ message: "false" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
const confirmTransfer = (req, res) => {
  let id = req.body.data.id_withdraws;
  try {
    pool.query(ServicePayment.checkWithdraw(), [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        data.forEach((item) => {
          const {
            id_withdraw,
            amount_pending,
            amount_transferred,
            id_collaborator,
          } = item;
          pool.query(
            ServicePayment.checkPaymentByIdColla(),
            [id_collaborator],
            (err, data) => {
              if (err) {
                throw err;
              }
              if (data.length > 0) {
                let total_recived = data[0].total_recived;
                let total_withdraw = data[0].total_withdrawn;
                pool.query(
                  ServicePayment.checkWihdrawStatusNone(),
                  [id_collaborator, id_withdraw],
                  (err, data) => {
                    if (err) {
                      throw err;
                    }
                    if (data.length > 0) {
                      let withdraw_id = data[0].id_withdraw;
                      let id_colla = data[0].id_collaborator;
                      pool.query(
                        ServicePayment.updateWithdrawByIDWithdraw(),
                        [
                          formatDate(new Date()),
                          getCurrentTimeFormatted(),
                          0,
                          withdraw_id,
                        ],
                        (err, data) => {
                          if (err) {
                            throw err;
                          }
                          if (data) {
                            res.json();
                            pool.query(
                              ServicePayment.checkSumType1(),
                              [id_colla],
                              (err, data) => {
                                if (err) {
                                  throw err;
                                }
                                if (data.length > 0) {
                                  let total_withdraw = data[0].total_withdraw;
                                  pool.query(
                                    ServicePayment.updatePaymentSetTotal(),
                                    [total_withdraw, id_colla],
                                    (err, data) => {
                                      if (err) {
                                        throw err;
                                      }
                                      if (data) {
                                        res.json();
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
                return res.status(500).json({ message: "not exists" });
              }
            }
          );
        });
      } else {
        return res.status(500).json({ message: "not exists" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
// const confirmTransfer = (req, res) => {
//   let ids = req.body.data.id_withdraws;
//   try {
//     pool.query(
//       "SELECT * FROM withdraw WHERE id_withdraw in (?)",
//       [ids],
//       (err, data) => {
//         if (err) {
//           throw err;
//         }
//         if (data.length > 0) {
//           for (let item in data) {
//             const { id_withdraw, id_collaborator, amount_transferred } = item;
//             pool.query(
//               "UPDATE withdraw SET date_transferred = ?, time_transferred = ?, status_transferred = 1, available_balance = ? WHERE id_withdraw = ? AND status_transferred = 0",
//               [
//                 formatDate(new Date()),
//                 getCurrentTimeFormatted(),
//                 amount_transferred,
//                 id_withdraw,
//               ],
//               (err, result) => {
//                 if (err) {
//                   throw err;
//                 }
//                 if (result) {
//                   res.json();
//                 }
//               }
//             );
//           }
//         } else {
//           return res.status(400).json({ message: "fails" });
//         }
//       }
//     );
//   } catch (error) {
//     return res.status(500).json({ message: "fails" });
//   }
// };

const getDraws = (req, res) => {
  try {
    pool.query(ServicePayment.getAllDraw(), [], (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        let maxdate = data[0].max_date;
        let mindate = data[0].min_date;
        return res.status(200).json({
          max_date: formatDateMax(maxdate),
          min_date: formatDateMin(mindate),
          data,
        });
      } else {
        return res.status(200).json([]);
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
const getAllPayment = (req, res) => {
  try {
    pool.query(ServicePayment.getAllPayment(), [], (err, data) => {
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
const getAllCommission = (req, res) => {
  try {
    pool.query(ServicePayment.getAll(), [], (err, data) => {
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
const getDataChartOrder = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(ServicePayment.getDataChart(), [id], (err, data) => {
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
const getDataCollaboratorWithdrawal = (req, res) => {
  try {
    pool.query(
      "SELECT withdraw.id_withdraw, collaborator.id_collaborator, collaborator.name_collaborator, collaborator.phone, collaborator.avatar,  withdraw.amount_transferred, withdraw.date_transferred, withdraw.time_transferred, withdraw.amount_recived, DATE_FORMAT(DATE_ADD(withdraw.date_transferred, INTERVAL 7 HOUR), '%d-%m-%Y') AS day_transferred, withdraw.status_transferred, withdraw.type_transferred, withdraw.available_balance FROM withdraw join collaborator on withdraw.id_collaborator = collaborator.id_collaborator WHERE status_transferred = 1",
      [],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data) {
          let maxdate = data[0].date_transferred;
          let mindate = data[0].date_transferred;
          return res.status(200).json({
            max_date: formatDate1(maxdate),
            min_date: formatDate1(mindate),
            data,
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
const getListConfirm = (req, res) => {
  try {
    pool.query(
      "SELECT withdraw.id_withdraw, collaborator.name_collaborator, collaborator.phone, collaborator.email_collaborator, collaborator.avatar, DATE_FORMAT(DATE_ADD(withdraw.date_request, INTERVAL 7 HOUR), '%d-%m-%Y') as date_request , withdraw.amount_pending, withdraw.initial_balance FROM withdraw join collaborator on withdraw.id_collaborator = collaborator.id_collaborator WHERE withdraw.status_transferred = 0",
      [],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          return res.status(200).json(data);
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
module.exports = {
  getAllCommission,
  getDraws,
  drawCommission,
  confirmTransfer,
  getAllPayment,
  getDataChartOrder,
  getDataCollaboratorWithdrawal,
  getListConfirm,
};
