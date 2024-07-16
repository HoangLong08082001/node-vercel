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
          "UPDATE payment SET temp_balance=? WHERE payment.id_collaborator = ?",
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
                      "INSERT INTO withdraw (date_request, initial_balance, amount_pending, amount_transferred, status_transferred, available_balance, id_collaborator) VALUES (?,?,?,?,?,?,?)",
                      [
                        formatDate(new Date()),
                        total_recived2,
                        total_recived2,
                        total_recived2,
                        0,
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
                            "UPDATE payment SET total_recived = ? WHERE payment.id_collaborator = ?",
                            [total_recived2 - total_recived2, id],
                            (err, data) => {
                              if (err) {
                                throw err;
                              }
                              if (data) {
                                pool.query(
                                  "UPDATE payment SET total_pending = ? WHERE payment.id_collaborator=?",
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
                                        "SELECT * FROM payment WHERE id_collaborator = ?",
                                        [id],
                                        (err, data) => {
                                          if (err) {
                                            throw err;
                                          }
                                          if (data.length > 0) {
                                            let total_recived3 =
                                              data[0].total_recived;
                                            pool.query(
                                              "UPDATE withdraw SET available_balance=? WHERE withdraw.id_collaborator=? AND withdraw.id_withdraw=?",
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
  let id = req.params.id;
  try {
    pool.query(ServicePayment.getTotalRecived(), [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        let total_withdrawn_payment = data[0].total_withdrawn;
        pool.query(ServicePayment.getAmountWithDraw(), [id], (err, data) => {
          if (err) {
            throw err;
          }
          if (data.length > 0) {
            let total_recived_withdraw = data[0].amount_transferred;
            pool.query(
              ServicePayment.updateStatusDate(),
              [formatDate(new Date()), id],
              (err, data) => {
                if (err) {
                  throw err;
                }
                if (data) {
                  pool.query(
                    ServicePayment.updateRecivedAfterTransfer(),
                    [
                      parseInt(
                        parseInt(total_recived_withdraw) -
                          parseInt(total_recived_withdraw)
                      ),
                      parseInt(
                        parseInt(total_recived_withdraw) +
                          parseInt(total_withdrawn_payment)
                      ),
                      id,
                    ],
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
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
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
          max_date: formatDate1(maxdate),
          min_date: formatDate1(mindate),
          data,
        });
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
    pool.query(
      `SELECT
  DATE(commission.create_at) as date,
  SUM(commission.actually_recived) as total
FROM
  commission
WHERE
  commission.create_at >= CURDATE() - INTERVAL 7 DAY
  AND commission.id_collaborator = ?
GROUP BY
  DATE(commission.create_at);`,
      [id],
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
};
