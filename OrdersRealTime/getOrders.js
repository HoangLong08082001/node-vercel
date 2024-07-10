const { default: axios } = require("axios");
const pool = require("../config/database");
const { ServiceWebhook, handleCommission } = require("../WEBHOOK/WebhookModal");
const formatDate = (date) => {
  const dateObject = new Date(date);
  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");
  const hours = String(dateObject.getHours()).padStart(2, "0");
  const minutes = String(dateObject.getMinutes()).padStart(2, "0");
  const seconds = String(dateObject.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
const formatDateYYYYMMDD = (date) => {
  const dateObject = new Date(date);
  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
async function getOrders() {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://apec-ecoop-test.mysapo.net/admin/orders.json`, {
        auth: {
          username: "7a98656a3d14471381c3e26e217c9bc4", // API Key
          password: "4ce9d5302b1f47ef80a5d68af1fc7c4c", // API Secret
        },
      })
      .then(async (response) => {
        let orders = response.data.orders;
        orders.forEach((order) => {
          const {
            id,
            financial_status,
            fulfillment_status,
            created_on,
            phone,
            email,
            status,
            total_price,
            landing_site,
            fulfillments,
            return_status,
          } = order;

          pool.query(ServiceWebhook.checkIdSapo(), [id], (err, data) => {
            if (err) {
              throw err;
            }
            if (data.length > 0) {
              pool.query(
                "SELECT * FROM orders WHERE financial_status like 'paid' AND fulfillment_status LIKE 'fulfilled' AND orders.id_orders_sapo=?",
                [id],
                (err, data) => {
                  if (err) {
                    return;
                  }
                  if (data.length > 0) {
                    return;
                  } else {
                    pool.query(
                      "UPDATE orders SET financial_status=?, fulfillment_status=?, date_delivered=? WHERE orders.id_orders_sapo=?",
                      [
                        "paid",
                        "fulfilled",
                        formatDate(fulfillments[0]?.delivered_on),
                        id,
                      ],
                      (err, data) => {
                        if (err) {
                          return;
                        }
                        if (data) {
                          pool.query(
                            ServiceWebhook.checkIdSapo(),
                            [id],
                            (err, data) => {
                              if (err) {
                                return;
                              }
                              if (data.length > 0) {
                                let id_ordrer = data[0].id_orders;
                                // Process commission and update payments here
                                // Example: handleCommission and pool.query for updating payments
                                pool.query(
                                  ServiceWebhook.checkIdSapo(),
                                  [id],
                                  (err, data) => {
                                    if (data.length > 0) {
                                      const bwaf = data[0].referral_link; // Giả sử cột chứa dữ liệu là 'bwaf'
                                      const phone = data[0].customer_phone;
                                      if (bwaf.includes("-")) {
                                        // Cắt chuỗi để lấy phần sau dấu "="
                                        var parts = bwaf.split("=");

                                        // Lấy chuỗi chứa "78-100"
                                        var numberStr = parts[1];

                                        // Cắt chuỗi "78-100" thành hai phần "78" và "100"
                                        var numbers = numberStr.split("-");

                                        // Gán kết quả vào các biến
                                        var firstNumber = numbers[0];
                                        var secondNumber = numbers[1];
                                        const orderValue = data[0].total_price;
                                        let precent_tax = handleCommission(
                                          orderValue,
                                          10,
                                          1
                                        );
                                        pool.query(
                                          ServiceWebhook.checkPayment(),
                                          [firstNumber],
                                          (err, data) => {
                                            if (err) {
                                            }
                                            if (data.length > 0) {
                                              if (
                                                data[0].status_account === 1
                                              ) {
                                                const sum = (a, b) => {
                                                  return parseInt(a + b);
                                                };
                                                let new_commission = sum(
                                                  parseInt(
                                                    data[0].total_recived
                                                      ? data[0].total_recived
                                                      : 0
                                                  ),
                                                  parseInt(precent_tax)
                                                );
                                                pool.query(
                                                  ServiceWebhook.addCommission(),
                                                  [
                                                    10,
                                                    1,
                                                    orderValue,
                                                    precent_tax,
                                                    data[0].id_collaborator,
                                                    formatDateYYYYMMDD(
                                                      fulfillments[0]
                                                        ?.delivered_on
                                                    ),
                                                    id_ordrer,
                                                  ],
                                                  (err, data) => {
                                                    if (err) {
                                                      console.log(err);
                                                    }
                                                    if (data) {
                                                      pool.query(
                                                        ServiceWebhook.updatePayment(),
                                                        [
                                                          new_commission,
                                                          firstNumber,
                                                        ],
                                                        (err, result) => {
                                                          if (err) {
                                                          }
                                                          if (result) {
                                                          }
                                                        }
                                                      );
                                                    }
                                                  }
                                                );
                                              } else {
                                                return;
                                              }
                                            }
                                          }
                                        );
                                        pool.query(
                                          ServiceWebhook.checkAffiliateLevel2(),
                                          [secondNumber],
                                          (err, data) => {
                                            if (err) {
                                            }
                                            if (data.length > 0) {
                                              pool.query(
                                                ServiceWebhook.checkAffiliateLevel1(),
                                                [firstNumber, data[0].phone],
                                                (err, data) => {
                                                  if (data.length > 0) {
                                                    pool.query(
                                                      ServiceWebhook.checkPayment(),
                                                      [secondNumber],
                                                      (err, data) => {
                                                        if (err) {
                                                        }
                                                        if (data.length > 0) {
                                                          if (
                                                            data[0]
                                                              .status_account ===
                                                            1
                                                          ) {
                                                            const sum = (
                                                              a,
                                                              b
                                                            ) => {
                                                              return parseInt(
                                                                a + b
                                                              );
                                                            };
                                                            let new_commission =
                                                              sum(
                                                                parseInt(
                                                                  data[0]
                                                                    .total_recived
                                                                    ? data[0]
                                                                        .total_recived
                                                                    : 0
                                                                ),
                                                                parseInt(
                                                                  precent_tax
                                                                )
                                                              );
                                                            pool.query(
                                                              ServiceWebhook.addCommission(),
                                                              [
                                                                10,
                                                                1,
                                                                orderValue,
                                                                precent_tax,
                                                                data[0]
                                                                  .id_collaborator,
                                                                id_ordrer,
                                                              ],
                                                              (err, data) => {
                                                                if (err) {
                                                                  console.log(
                                                                    err
                                                                  );
                                                                }
                                                                if (data) {
                                                                  pool.query(
                                                                    ServiceWebhook.updatePayment(),
                                                                    [
                                                                      new_commission,
                                                                      secondNumber,
                                                                    ],
                                                                    (
                                                                      err,
                                                                      result
                                                                    ) => {
                                                                      if (err) {
                                                                      }
                                                                      if (
                                                                        result
                                                                      ) {
                                                                      }
                                                                    }
                                                                  );
                                                                }
                                                              }
                                                            );
                                                          } else {
                                                            return;
                                                          }
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
                                        const bwafValue = bwaf.split("=")[1];
                                        const orderValue = order.total_price;
                                        let precent_tax = handleCommission(
                                          orderValue,
                                          10,
                                          1
                                        );

                                        pool.query(
                                          ServiceWebhook.checkPayment(),
                                          [bwafValue],
                                          (err, data) => {
                                            if (err) {
                                            }
                                            if (data.length > 0) {
                                              if (
                                                data[0].status_account === 1
                                              ) {
                                                const sum = (a, b) => {
                                                  return parseInt(a + b);
                                                };
                                                let new_commission = sum(
                                                  parseInt(
                                                    data[0].total_recived
                                                      ? data[0].total_recived
                                                      : 0
                                                  ),
                                                  parseInt(precent_tax)
                                                );
                                                pool.query(
                                                  ServiceWebhook.addCommission(),
                                                  [
                                                    10,
                                                    1,
                                                    orderValue,
                                                    precent_tax,
                                                    data[0].id_collaborator,
                                                    formatDateYYYYMMDD(
                                                      fulfillments[0]
                                                        ?.delivered_on
                                                    ),
                                                    id_ordrer,
                                                  ],
                                                  (err, data) => {
                                                    if (err) {
                                                      console.log(err);
                                                    }
                                                    if (data) {
                                                      pool.query(
                                                        ServiceWebhook.updatePayment(),
                                                        [
                                                          new_commission,
                                                          bwafValue,
                                                        ],
                                                        (err, result) => {
                                                          if (err) {
                                                          }
                                                          if (result) {
                                                          }
                                                        }
                                                      );
                                                    }
                                                  }
                                                );
                                              } else {
                                                returnl;
                                              }
                                            }
                                          }
                                        );
                                      }
                                      if (
                                        bwaf === "/password" ||
                                        bwaf === "/" ||
                                        bwaf === ""
                                      ) {
                                        pool.query(
                                          ServiceWebhook.checkPhoneEmailOrder(),
                                          [phone],
                                          (err, data) => {
                                            if (err) {
                                            }
                                            if (data.length > 0) {
                                              let bwaf = data[0].referral_link;
                                              if (bwaf.includes("-")) {
                                                // Cắt chuỗi để lấy phần sau dấu "="
                                                var parts = bwaf.split("=");

                                                // Lấy chuỗi chứa "78-100"
                                                var numberStr = parts[1];

                                                // Cắt chuỗi "78-100" thành hai phần "78" và "100"
                                                var numbers =
                                                  numberStr.split("-");

                                                // Gán kết quả vào các biến
                                                var firstNumber = numbers[0];
                                                var secondNumber = numbers[1];
                                                const orderValue =
                                                  data[0].total_price;
                                                let precent_tax =
                                                  handleCommission(
                                                    orderValue,
                                                    10,
                                                    1
                                                  );
                                                pool.query(
                                                  ServiceWebhook.checkPayment(),
                                                  [firstNumber],
                                                  (err, data) => {
                                                    if (err) {
                                                    }
                                                    if (data.length > 0) {
                                                      if (
                                                        data[0]
                                                          .status_account === 1
                                                      ) {
                                                        const sum = (a, b) => {
                                                          return parseInt(
                                                            a + b
                                                          );
                                                        };
                                                        let new_commission =
                                                          sum(
                                                            parseInt(
                                                              data[0]
                                                                .total_recived
                                                                ? data[0]
                                                                    .total_recived
                                                                : 0
                                                            ),
                                                            parseInt(
                                                              precent_tax
                                                            )
                                                          );
                                                        pool.query(
                                                          ServiceWebhook.addCommission(),
                                                          [
                                                            10,
                                                            1,
                                                            orderValue,
                                                            precent_tax,
                                                            data[0]
                                                              .id_collaborator,
                                                            formatDateYYYYMMDD(
                                                              fulfillments[0]
                                                                ?.delivered_on
                                                            ),
                                                            id_ordrer,
                                                          ],
                                                          (err, data) => {
                                                            if (err) {
                                                              console.log(err);
                                                            }
                                                            if (data) {
                                                              pool.query(
                                                                ServiceWebhook.updatePayment(),
                                                                [
                                                                  new_commission,
                                                                  firstNumber,
                                                                ],
                                                                (
                                                                  err,
                                                                  result
                                                                ) => {
                                                                  if (err) {
                                                                    console.log(
                                                                      "error"
                                                                    );
                                                                  }
                                                                  if (result) {
                                                                  }
                                                                }
                                                              );
                                                            }
                                                          }
                                                        );
                                                      } else {
                                                        return;
                                                      }
                                                    }
                                                  }
                                                );
                                                pool.query(
                                                  ServiceWebhook.checkAffiliateLevel2(),
                                                  [secondNumber],
                                                  (err, data) => {
                                                    if (err) {
                                                    }
                                                    if (data.length > 0) {
                                                      pool.query(
                                                        ServiceWebhook.checkAffiliateLevel1(),
                                                        [
                                                          firstNumber,
                                                          data[0].phone,
                                                        ],
                                                        (err, data) => {
                                                          if (data.length > 0) {
                                                            pool.query(
                                                              ServiceWebhook.checkPayment(),
                                                              [secondNumber],
                                                              (err, data) => {
                                                                if (err) {
                                                                }
                                                                if (
                                                                  data.length >
                                                                  0
                                                                ) {
                                                                  if (
                                                                    data[0]
                                                                      .status_account ===
                                                                    1
                                                                  ) {
                                                                    const sum =
                                                                      (
                                                                        a,
                                                                        b
                                                                      ) => {
                                                                        return parseInt(
                                                                          a + b
                                                                        );
                                                                      };
                                                                    let new_commission =
                                                                      sum(
                                                                        parseInt(
                                                                          data[0]
                                                                            .total_recived
                                                                            ? data[0]
                                                                                .total_recived
                                                                            : 0
                                                                        ),
                                                                        parseInt(
                                                                          precent_tax
                                                                        )
                                                                      );
                                                                    pool.query(
                                                                      ServiceWebhook.addCommission(),
                                                                      [
                                                                        10,
                                                                        1,
                                                                        orderValue,
                                                                        precent_tax,
                                                                        data[0]
                                                                          .id_collaborator,
                                                                        formatDateYYYYMMDD(
                                                                          fulfillments[0]
                                                                            ?.delivered_on
                                                                        ),
                                                                        id_ordrer,
                                                                      ],
                                                                      (
                                                                        err,
                                                                        data
                                                                      ) => {
                                                                        if (
                                                                          err
                                                                        ) {
                                                                          console.log(
                                                                            err
                                                                          );
                                                                        }
                                                                        if (
                                                                          data
                                                                        ) {
                                                                          pool.query(
                                                                            ServiceWebhook.updatePayment(),
                                                                            [
                                                                              new_commission,
                                                                              secondNumber,
                                                                            ],
                                                                            (
                                                                              err,
                                                                              result
                                                                            ) => {
                                                                              if (
                                                                                err
                                                                              ) {
                                                                              }
                                                                              if (
                                                                                result
                                                                              ) {
                                                                              }
                                                                            }
                                                                          );
                                                                        }
                                                                      }
                                                                    );
                                                                  } else {
                                                                    return;
                                                                  }
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
                                              if (!bwaf.includes("-")) {
                                                const bwafValue =
                                                  bwaf.split("=")[1];
                                                const orderValue =
                                                  order.total_price;
                                                let precent_tax =
                                                  handleCommission(
                                                    orderValue,
                                                    10,
                                                    1
                                                  );
                                                console.log(precent_tax);
                                                pool.query(
                                                  ServiceWebhook.checkPayment(),
                                                  [bwafValue],
                                                  (err, data) => {
                                                    if (err) {
                                                      console.log("fails");
                                                    }
                                                    if (data.length > 0) {
                                                      if (
                                                        data[0]
                                                          .status_account === 1
                                                      ) {
                                                        const sum = (a, b) => {
                                                          return parseInt(
                                                            a + b
                                                          );
                                                        };
                                                        let new_commission =
                                                          sum(
                                                            parseInt(
                                                              data[0]
                                                                .total_recived
                                                                ? data[0]
                                                                    .total_recived
                                                                : 0
                                                            ),
                                                            parseInt(
                                                              precent_tax
                                                            )
                                                          );
                                                        console.log(
                                                          data[0].total_recived
                                                        );
                                                        console.log(
                                                          precent_tax
                                                        );
                                                        console.log(
                                                          new_commission
                                                        );
                                                        pool.query(
                                                          ServiceWebhook.addCommission(),
                                                          [
                                                            10,
                                                            1,
                                                            orderValue,
                                                            precent_tax,
                                                            data[0]
                                                              .id_collaborator,
                                                            formatDateYYYYMMDD(
                                                              fulfillments[0]
                                                                ?.delivered_on
                                                            ),
                                                            id_ordrer,
                                                          ],
                                                          (err, data) => {
                                                            if (err) {
                                                              console.log(err);
                                                            }
                                                            if (data) {
                                                              pool.query(
                                                                ServiceWebhook.updatePayment(),
                                                                [
                                                                  new_commission,
                                                                  bwafValue,
                                                                ],
                                                                (
                                                                  err,
                                                                  result
                                                                ) => {
                                                                  if (err) {
                                                                    console.log(
                                                                      "fails"
                                                                    );
                                                                  }
                                                                  if (result) {
                                                                    console.log(
                                                                      "success"
                                                                    );
                                                                  }
                                                                }
                                                              );
                                                            }
                                                          }
                                                        );
                                                      } else {
                                                        return;
                                                      }
                                                    }
                                                  }
                                                );
                                              }
                                            }
                                          }
                                        );
                                      }
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
              // Insert order into the database with pool.query
              pool.query(
                ServiceWebhook.insertOrder(),
                [
                  id,
                  formatDate(created_on),
                  financial_status,
                  fulfillment_status,
                  phone,
                  email,
                  status,
                  total_price,
                  landing_site,
                ],
                (err, data) => {
                  if (err) {
                    console.error("Error inserting order:", err);
                  } else {
                    return;
                  }
                }
              );
            }
          });
        });
      });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
  }
}

module.exports = getOrders;
