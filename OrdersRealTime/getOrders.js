const { default: axios } = require("axios");
const pool = require("../config/database");
const {
  ServiceWebhook,
  handleCommission,
  handleBeforePersonalTax,
  handleCommissionBeforePersonalTax,
} = require("../WEBHOOK/WebhookModal");
const {
  sendNotificationToAll,
  setItem,
} = require("../config/sendNotification");
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
const formatTimeHHMMSS = (dateString) => {
  const date = new Date(dateString);

  // Chuyển đổi thời gian UTC sang thời gian Việt Nam (GMT+7)
  const vietnamOffset = 7 * 60; // 7 hours in minutes
  const localDate = new Date(date.getTime() + vietnamOffset * 60 * 1000);

  const hours = String(localDate.getUTCHours()).padStart(2, "0");
  const minutes = String(localDate.getUTCMinutes()).padStart(2, "0");
  const seconds = String(localDate.getUTCSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};
function getCurrentTimeFormatted() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

const decode = (code) => {
  const map =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  if (code.length !== 4) {
    throw new Error("Invalid code length");
  }

  // Chuyển mã hóa trở lại giá trị số nguyên
  let value = 0;
  for (let i = 0; i < code.length; i++) {
    value = value * 64 + map.indexOf(code[i]);
  }

  // Chia giá trị số thành các phần, ví dụ: "125" và "126"
  // Sử dụng hệ cơ số 1000 để khôi phục các giá trị
  const values = [];
  while (value > 0) {
    values.push(value % 1000); // Lấy phần số
    value = Math.floor(value / 1000); // Chia số
  }

  // Đảo ngược và định dạng giá trị
  values.reverse();
  return values.join("-");
};
async function getOrders() {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://test-website-affiliate.mysapo.net/admin/orders.json`, {
        auth: {
          username: "cf3cd0aedda14fbda861e4cf5700f73f", // API Key
          password: "377504ca04e94900bea5e8c0591bc65a", // API Secret
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
            customer,
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
                    if (
                      financial_status === "paid" &&
                      fulfillment_status === null
                    ) {
                      pool.query(
                        "UPDATE orders SET financial_status=? WHERE orders.id_orders_sapo=?",
                        ["paid", id],
                        (err, data) => {
                          if (err) {
                          }
                          if (data) {
                            return;
                          }
                        }
                      );
                    }
                    if (status !== "cancelled") {
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
                                  let id_order_sapo = data[0].id_orders_sapo;
                                  // Process commission and update payments here
                                  // Example: handleCommission and pool.query for updating payments
                                  pool.query(
                                    ServiceWebhook.checkIdSapo(),
                                    [id],
                                    (err, data) => {
                                      if (data.length > 0) {
                                        let date_delivered =
                                          data[0].date_deliverd;
                                        const bwafOrigin =
                                          data[0].referral_link; // Giả sử cột chứa dữ liệu là 'bwaf'
                                        const phone = data[0].customer_phone;
                                        if (bwafOrigin.includes("/?bwaf=")) {
                                          let cutString =
                                            bwafOrigin.split("=")[1];
                                          let bwaf =
                                            "/?bwaf=" + decode(cutString);
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
                                            const orderValue =
                                              data[0].total_price;
                                            let precent_tax = handleCommission(
                                              orderValue,
                                              10,
                                              1
                                            );
                                            pool.query(
                                              ServiceWebhook.checkPayment(),
                                              [parseInt(firstNumber)],
                                              (err, data) => {
                                                if (err) {
                                                }
                                                if (data.length > 0) {
                                                  let init_balance =
                                                    data[0].total_recived;
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
                                                  let id_collaborator =
                                                    data[0].id_collaborator;
                                                  pool.query(
                                                    ServiceWebhook.addCommission(),
                                                    [
                                                      10,
                                                      1,
                                                      orderValue,
                                                      precent_tax,
                                                      0,
                                                      formatDateYYYYMMDD(
                                                        fulfillments[0]
                                                          ?.delivered_on
                                                      ),
                                                      formatTimeHHMMSS(
                                                        fulfillments[0]
                                                          ?.delivered_on
                                                      ),
                                                      id_collaborator,
                                                      precent_tax,
                                                      id_ordrer,
                                                    ],
                                                    (err, data) => {
                                                      if (err) {
                                                      }
                                                      if (data) {
                                                        pool.query(
                                                          ServiceWebhook.addTax(),
                                                          [
                                                            id_collaborator,
                                                            orderValue,
                                                            handleCommissionBeforePersonalTax(
                                                              orderValue,
                                                              1
                                                            ),
                                                            handleBeforePersonalTax(
                                                              handleCommissionBeforePersonalTax(
                                                                orderValue,
                                                                1
                                                              ),
                                                              10
                                                            ),
                                                            parseInt(
                                                              handleCommissionBeforePersonalTax(
                                                                orderValue,
                                                                1
                                                              ) -
                                                                handleBeforePersonalTax(
                                                                  handleCommissionBeforePersonalTax(
                                                                    orderValue,
                                                                    1
                                                                  ),
                                                                  10
                                                                )
                                                            ),
                                                            id_ordrer,
                                                            formatDateYYYYMMDD(
                                                              fulfillments[0]
                                                                ?.delivered_on
                                                            ),
                                                            formatTimeHHMMSS(
                                                              fulfillments[0]
                                                                ?.delivered_on
                                                            ),
                                                          ],
                                                          (err, data) => {
                                                            if (err) {
                                                              return;
                                                            }
                                                            if (data) {
                                                              pool.query(
                                                                ServiceWebhook.updatePayment(),
                                                                [
                                                                  new_commission,
                                                                  parseInt(
                                                                    firstNumber
                                                                  ),
                                                                ],
                                                                (
                                                                  err,
                                                                  result
                                                                ) => {
                                                                  if (err) {
                                                                  }
                                                                  if (result) {
                                                                    pool.query(
                                                                      ServiceWebhook.checkPayment(),
                                                                      [
                                                                        parseInt(
                                                                          firstNumber
                                                                        ),
                                                                      ],
                                                                      (
                                                                        err,
                                                                        data
                                                                      ) => {
                                                                        if (
                                                                          err
                                                                        ) {
                                                                        }
                                                                        if (
                                                                          data.length >
                                                                          0
                                                                        ) {
                                                                          let recived =
                                                                            data[0]
                                                                              .total_recived;
                                                                          pool.query(
                                                                            "INSERT INTO withdraw (amount_recived, date_transferred, time_transferred, status_transferred, id_orders, type_transferred, id_orders_sapo, available_balance, id_collaborator) VALUES (?,?,?,?,?,?,?,?,?)",

                                                                            [
                                                                              handleCommission(
                                                                                orderValue,
                                                                                10,
                                                                                1
                                                                              ),
                                                                              formatDateYYYYMMDD(
                                                                                new Date()
                                                                              ),
                                                                              getCurrentTimeFormatted(),
                                                                              1,
                                                                              id_ordrer,
                                                                              0,
                                                                              id_order_sapo,
                                                                              parseInt(
                                                                                parseInt(
                                                                                  init_balance
                                                                                ) +
                                                                                  parseInt(
                                                                                    handleCommission(
                                                                                      orderValue,
                                                                                      10,
                                                                                      1
                                                                                    )
                                                                                  )
                                                                              ),
                                                                              parseInt(
                                                                                firstNumber
                                                                              ),
                                                                            ],
                                                                            (
                                                                              err,
                                                                              data
                                                                            ) => {
                                                                              if (
                                                                                err
                                                                              ) {
                                                                              }
                                                                              if (
                                                                                data
                                                                              ) {
                                                                                setItem(
                                                                                  "Thông báo đơn hàng",
                                                                                  `Đơn hàng ${id_order_sapo} vừa thanh toán thành công`
                                                                                );
                                                                                sendNotificationToAll(
                                                                                  "Thông báo đơn hàng",
                                                                                  `Đơn hàng ${id_order_sapo} vừa thanh toán thành công`
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
                                            pool.query(
                                              ServiceWebhook.checkAffiliateLevel2(),
                                              [parseInt(secondNumber)],
                                              (err, data) => {
                                                if (err) {
                                                }
                                                if (data.length > 0) {
                                                  pool.query(
                                                    ServiceWebhook.checkAffiliateLevel1(),
                                                    [
                                                      parseInt(firstNumber),
                                                      data[0].phone,
                                                    ],
                                                    (err, data) => {
                                                      if (err) {
                                                        return;
                                                      }
                                                      if (data.length > 0) {
                                                        pool.query(
                                                          ServiceWebhook.checkPayment(),
                                                          [
                                                            parseInt(
                                                              secondNumber
                                                            ),
                                                          ],
                                                          (err, data) => {
                                                            if (err) {
                                                            }
                                                            if (
                                                              data.length > 0
                                                            ) {
                                                              let init_balance =
                                                                data[0]
                                                                  .total_recived;
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
                                                              let id_collaborator =
                                                                data[0]
                                                                  .id_collaborator;
                                                              pool.query(
                                                                ServiceWebhook.addCommission(),
                                                                [
                                                                  10,
                                                                  1,
                                                                  orderValue,
                                                                  0,
                                                                  precent_tax,
                                                                  formatDateYYYYMMDD(
                                                                    fulfillments[0]
                                                                      ?.delivered_on
                                                                  ),
                                                                  formatTimeHHMMSS(
                                                                    fulfillments[0]
                                                                      ?.delivered_on
                                                                  ),
                                                                  id_collaborator,
                                                                  precent_tax,
                                                                  id_ordrer,
                                                                ],
                                                                (err, data) => {
                                                                  if (err) {
                                                                  }
                                                                  if (data) {
                                                                    pool.query(
                                                                      ServiceWebhook.addTax(),
                                                                      [
                                                                        id_collaborator,
                                                                        orderValue,
                                                                        handleCommissionBeforePersonalTax(
                                                                          orderValue,
                                                                          1
                                                                        ),
                                                                        handleBeforePersonalTax(
                                                                          handleCommissionBeforePersonalTax(
                                                                            orderValue,
                                                                            1
                                                                          ),
                                                                          10
                                                                        ),
                                                                        parseInt(
                                                                          handleCommissionBeforePersonalTax(
                                                                            orderValue,
                                                                            1
                                                                          ) -
                                                                            handleBeforePersonalTax(
                                                                              handleCommissionBeforePersonalTax(
                                                                                orderValue,
                                                                                1
                                                                              ),
                                                                              10
                                                                            )
                                                                        ),
                                                                        id_ordrer,
                                                                        formatDateYYYYMMDD(
                                                                          fulfillments[0]
                                                                            ?.delivered_on
                                                                        ),
                                                                        formatTimeHHMMSS(
                                                                          fulfillments[0]
                                                                            ?.delivered_on
                                                                        ),
                                                                      ],
                                                                      (
                                                                        err,
                                                                        data
                                                                      ) => {
                                                                        if (
                                                                          err
                                                                        ) {
                                                                        }
                                                                        if (
                                                                          data
                                                                        ) {
                                                                          pool.query(
                                                                            ServiceWebhook.updatePayment(),
                                                                            [
                                                                              new_commission,
                                                                              parseInt(
                                                                                secondNumber
                                                                              ),
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
                                                                                pool.query(
                                                                                  ServiceWebhook.checkPayment(),
                                                                                  [
                                                                                    parseInt(
                                                                                      secondNumber
                                                                                    ),
                                                                                  ],
                                                                                  (
                                                                                    err,
                                                                                    data
                                                                                  ) => {
                                                                                    if (
                                                                                      err
                                                                                    ) {
                                                                                    }
                                                                                    if (
                                                                                      data.length >
                                                                                      0
                                                                                    ) {
                                                                                      let recived =
                                                                                        data[0]
                                                                                          .total_recived;
                                                                                      pool.query(
                                                                                        "INSERT INTO withdraw (amount_recived, date_transferred, time_transferred, status_transferred, id_orders, type_transferred, id_orders_sapo, available_balance, id_collaborator) VALUES (?,?,?,?,?,?,?,?,?)",

                                                                                        [
                                                                                          handleCommission(
                                                                                            orderValue,
                                                                                            10,
                                                                                            1
                                                                                          ),
                                                                                          formatDateYYYYMMDD(
                                                                                            new Date()
                                                                                          ),
                                                                                          getCurrentTimeFormatted(),
                                                                                          1,
                                                                                          id_ordrer,
                                                                                          0,
                                                                                          id_order_sapo,
                                                                                          parseInt(
                                                                                            parseInt(
                                                                                              init_balance
                                                                                            ) +
                                                                                              parseInt(
                                                                                                handleCommission(
                                                                                                  orderValue,
                                                                                                  10,
                                                                                                  1
                                                                                                )
                                                                                              )
                                                                                          ),
                                                                                          parseInt(
                                                                                            secondNumber
                                                                                          ),
                                                                                        ],
                                                                                        (
                                                                                          err,
                                                                                          data
                                                                                        ) => {
                                                                                          if (
                                                                                            err
                                                                                          ) {
                                                                                          }
                                                                                          if (
                                                                                            data
                                                                                          ) {
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
                                                        return;
                                                      }
                                                    }
                                                  );
                                                } else {
                                                  return;
                                                }
                                              }
                                            );
                                          } else {
                                            const bwafValue =
                                              bwaf.split("=")[1];
                                            const orderValue =
                                              order.total_price;
                                            let precent_tax = handleCommission(
                                              orderValue,
                                              10,
                                              1
                                            );

                                            pool.query(
                                              ServiceWebhook.checkPayment(),
                                              [parseInt(bwafValue)],
                                              (err, data) => {
                                                if (err) {
                                                }
                                                if (data.length > 0) {
                                                  let init_balance =
                                                    data[0].total_recived;
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
                                                  let id_collaborator =
                                                    data[0].id_collaborator;
                                                  pool.query(
                                                    ServiceWebhook.addCommission(),
                                                    [
                                                      10,
                                                      1,
                                                      orderValue,
                                                      precent_tax,
                                                      0,
                                                      formatDateYYYYMMDD(
                                                        fulfillments[0]
                                                          ?.delivered_on
                                                      ),
                                                      formatTimeHHMMSS(
                                                        fulfillments[0]
                                                          ?.delivered_on
                                                      ),
                                                      id_collaborator,
                                                      precent_tax,
                                                      id_ordrer,
                                                    ],
                                                    (err, data) => {
                                                      if (err) {
                                                      }
                                                      if (data) {
                                                        pool.query(
                                                          ServiceWebhook.addTax(),
                                                          [
                                                            id_collaborator,
                                                            orderValue,
                                                            handleCommissionBeforePersonalTax(
                                                              orderValue,
                                                              1
                                                            ),
                                                            handleBeforePersonalTax(
                                                              handleCommissionBeforePersonalTax(
                                                                orderValue,
                                                                1
                                                              ),
                                                              10
                                                            ),
                                                            parseInt(
                                                              handleCommissionBeforePersonalTax(
                                                                orderValue,
                                                                1
                                                              ) -
                                                                handleBeforePersonalTax(
                                                                  handleCommissionBeforePersonalTax(
                                                                    orderValue,
                                                                    1
                                                                  ),
                                                                  10
                                                                )
                                                            ),
                                                            id_ordrer,
                                                            formatDateYYYYMMDD(
                                                              fulfillments[0]
                                                                ?.delivered_on
                                                            ),
                                                            formatTimeHHMMSS(
                                                              fulfillments[0]
                                                                ?.delivered_on
                                                            ),
                                                          ],
                                                          (err, data) => {
                                                            if (err) {
                                                            }
                                                            if (data) {
                                                              pool.query(
                                                                ServiceWebhook.updatePayment(),
                                                                [
                                                                  new_commission,
                                                                  parseInt(
                                                                    bwafValue
                                                                  ),
                                                                ],
                                                                (
                                                                  err,
                                                                  result
                                                                ) => {
                                                                  if (err) {
                                                                  }
                                                                  if (result) {
                                                                    pool.query(
                                                                      ServiceWebhook.checkPayment(),
                                                                      [
                                                                        parseInt(
                                                                          bwafValue
                                                                        ),
                                                                      ],
                                                                      (
                                                                        err,
                                                                        data
                                                                      ) => {
                                                                        if (
                                                                          err
                                                                        ) {
                                                                        }
                                                                        if (
                                                                          data.length >
                                                                          0
                                                                        ) {
                                                                          let recived =
                                                                            data[0]
                                                                              .total_recived;
                                                                          pool.query(
                                                                            "INSERT INTO withdraw (amount_recived, date_transferred, time_transferred, status_transferred, id_orders, type_transferred, id_orders_sapo, available_balance, id_collaborator) VALUES (?,?,?,?,?,?,?,?,?)",

                                                                            [
                                                                              handleCommission(
                                                                                orderValue,
                                                                                10,
                                                                                1
                                                                              ),
                                                                              formatDateYYYYMMDD(
                                                                                new Date()
                                                                              ),
                                                                              getCurrentTimeFormatted(),
                                                                              1,
                                                                              id_ordrer,
                                                                              0,
                                                                              id_order_sapo,
                                                                              parseInt(
                                                                                parseInt(
                                                                                  init_balance
                                                                                ) +
                                                                                  parseInt(
                                                                                    handleCommission(
                                                                                      orderValue,
                                                                                      10,
                                                                                      1
                                                                                    )
                                                                                  )
                                                                              ),
                                                                              parseInt(
                                                                                bwafValue
                                                                              ),
                                                                            ],
                                                                            (
                                                                              err,
                                                                              data
                                                                            ) => {
                                                                              if (
                                                                                err
                                                                              ) {
                                                                              }
                                                                              if (
                                                                                data
                                                                              ) {
                                                                                setItem(
                                                                                  "Thông báo đơn hàng",
                                                                                  `Đơn hàng ${id_order_sapo} vừa thanh toán thành công`
                                                                                );
                                                                                sendNotificationToAll(
                                                                                  "Thông báo đơn hàng",
                                                                                  `Đơn hàng ${id_order_sapo} vừa thanh toán thành công`
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
                                                  let last_id =
                                                    data[0].last_id_order;
                                                  pool.query(
                                                    "SELECT * FROM orders where orders.id_orders_sapo = ?",
                                                    [last_id],
                                                    (err, data) => {
                                                      if (err) {
                                                        return;
                                                      }
                                                      if (data.length > 0) {
                                                        let bwaf =
                                                          data[0].referral_link;
                                                        if (
                                                          bwaf.includes("-")
                                                        ) {
                                                          // Cắt chuỗi để lấy phần sau dấu "="
                                                          var parts =
                                                            bwaf.split("=");

                                                          // Lấy chuỗi chứa "78-100"
                                                          var numberStr =
                                                            parts[1];

                                                          // Cắt chuỗi "78-100" thành hai phần "78" và "100"
                                                          var numbers =
                                                            numberStr.split(
                                                              "-"
                                                            );

                                                          // Gán kết quả vào các biến
                                                          var firstNumber =
                                                            numbers[0];
                                                          var secondNumber =
                                                            numbers[1];
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
                                                            [
                                                              parseInt(
                                                                firstNumber
                                                              ),
                                                            ],
                                                            (err, data) => {
                                                              if (err) {
                                                              }
                                                              if (
                                                                data.length > 0
                                                              ) {
                                                                let init_balance =
                                                                  data[0]
                                                                    .total_recived;
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
                                                                let id_collaborator =
                                                                  data[0]
                                                                    .id_collaborator;
                                                                pool.query(
                                                                  ServiceWebhook.addCommission(),
                                                                  [
                                                                    10,
                                                                    1,
                                                                    orderValue,
                                                                    precent_tax,
                                                                    0,
                                                                    formatDateYYYYMMDD(
                                                                      fulfillments[0]
                                                                        ?.delivered_on
                                                                    ),
                                                                    formatTimeHHMMSS(
                                                                      fulfillments[0]
                                                                        ?.delivered_on
                                                                    ),
                                                                    id_collaborator,
                                                                    precent_tax,
                                                                    id_ordrer,
                                                                  ],
                                                                  (
                                                                    err,
                                                                    data
                                                                  ) => {
                                                                    if (err) {
                                                                    }
                                                                    if (data) {
                                                                      pool.query(
                                                                        ServiceWebhook.addTax(),
                                                                        [
                                                                          id_collaborator,
                                                                          orderValue,
                                                                          handleCommissionBeforePersonalTax(
                                                                            orderValue,
                                                                            1
                                                                          ),
                                                                          handleBeforePersonalTax(
                                                                            handleCommissionBeforePersonalTax(
                                                                              orderValue,
                                                                              1
                                                                            ),
                                                                            10
                                                                          ),
                                                                          parseInt(
                                                                            handleCommissionBeforePersonalTax(
                                                                              orderValue,
                                                                              1
                                                                            ) -
                                                                              handleBeforePersonalTax(
                                                                                handleCommissionBeforePersonalTax(
                                                                                  orderValue,
                                                                                  1
                                                                                ),
                                                                                10
                                                                              )
                                                                          ),
                                                                          id_ordrer,
                                                                          formatDateYYYYMMDD(
                                                                            fulfillments[0]
                                                                              ?.delivered_on
                                                                          ),
                                                                          formatTimeHHMMSS(
                                                                            fulfillments[0]
                                                                              ?.delivered_on
                                                                          ),
                                                                        ],
                                                                        (
                                                                          err,
                                                                          data
                                                                        ) => {
                                                                          if (
                                                                            err
                                                                          ) {
                                                                          }
                                                                          if (
                                                                            data
                                                                          ) {
                                                                            pool.query(
                                                                              ServiceWebhook.updatePayment(),
                                                                              [
                                                                                new_commission,
                                                                                parseInt(
                                                                                  firstNumber
                                                                                ),
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
                                                                                  pool.query(
                                                                                    ServiceWebhook.checkPayment(),
                                                                                    [
                                                                                      parseInt(
                                                                                        firstNumber
                                                                                      ),
                                                                                    ],
                                                                                    (
                                                                                      err,
                                                                                      data
                                                                                    ) => {
                                                                                      if (
                                                                                        err
                                                                                      ) {
                                                                                      }
                                                                                      if (
                                                                                        data.length >
                                                                                        0
                                                                                      ) {
                                                                                        let recived =
                                                                                          data[0]
                                                                                            .total_recived;
                                                                                        pool.query(
                                                                                          "INSERT INTO withdraw (amount_recived, date_transferred, time_transferred, status_transferred, id_orders, type_transferred, id_orders_sapo, available_balance, id_collaborator) VALUES (?,?,?,?,?,?,?,?,?)",

                                                                                          [
                                                                                            handleCommission(
                                                                                              orderValue,
                                                                                              10,
                                                                                              1
                                                                                            ),
                                                                                            formatDateYYYYMMDD(
                                                                                              new Date()
                                                                                            ),
                                                                                            getCurrentTimeFormatted(),
                                                                                            1,
                                                                                            id_ordrer,
                                                                                            0,
                                                                                            id_order_sapo,
                                                                                            parseInt(
                                                                                              parseInt(
                                                                                                init_balance
                                                                                              ) +
                                                                                                parseInt(
                                                                                                  handleCommission(
                                                                                                    orderValue,
                                                                                                    10,
                                                                                                    1
                                                                                                  )
                                                                                                )
                                                                                            ),
                                                                                            parseInt(
                                                                                              firstNumber
                                                                                            ),
                                                                                          ],
                                                                                          (
                                                                                            err,
                                                                                            data
                                                                                          ) => {
                                                                                            if (
                                                                                              err
                                                                                            ) {
                                                                                            }
                                                                                            if (
                                                                                              data
                                                                                            ) {
                                                                                              setItem(
                                                                                                "Thông báo đơn hàng",
                                                                                                `Đơn hàng ${id_order_sapo} vừa thanh toán thành công`
                                                                                              );
                                                                                              sendNotificationToAll(
                                                                                                "Thông báo đơn hàng",
                                                                                                `Đơn hàng ${id_order_sapo} vừa thanh toán thành công`
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
                                                          pool.query(
                                                            ServiceWebhook.checkAffiliateLevel2(),
                                                            [
                                                              parseInt(
                                                                secondNumber
                                                              ),
                                                            ],
                                                            (err, data) => {
                                                              if (err) {
                                                              }
                                                              if (
                                                                data.length > 0
                                                              ) {
                                                                pool.query(
                                                                  ServiceWebhook.checkAffiliateLevel1(),
                                                                  [
                                                                    parseInt(
                                                                      firstNumber
                                                                    ),
                                                                    data[0]
                                                                      .phone,
                                                                  ],
                                                                  (
                                                                    err,
                                                                    data
                                                                  ) => {
                                                                    if (
                                                                      data.length >
                                                                      0
                                                                    ) {
                                                                      pool.query(
                                                                        ServiceWebhook.checkPayment(),
                                                                        [
                                                                          parseInt(
                                                                            secondNumber
                                                                          ),
                                                                        ],
                                                                        (
                                                                          err,
                                                                          data
                                                                        ) => {
                                                                          if (
                                                                            err
                                                                          ) {
                                                                          }
                                                                          if (
                                                                            data.length >
                                                                            0
                                                                          ) {
                                                                            let init_balance =
                                                                              data[0]
                                                                                .total_recived;
                                                                            const sum =
                                                                              (
                                                                                a,
                                                                                b
                                                                              ) => {
                                                                                return parseInt(
                                                                                  a +
                                                                                    b
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
                                                                            let id_collaborator =
                                                                              data[0]
                                                                                .id_collaborator;
                                                                            pool.query(
                                                                              ServiceWebhook.addCommission(),
                                                                              [
                                                                                10,
                                                                                1,
                                                                                orderValue,
                                                                                0,
                                                                                precent_tax,
                                                                                formatDateYYYYMMDD(
                                                                                  fulfillments[0]
                                                                                    ?.delivered_on
                                                                                ),
                                                                                formatTimeHHMMSS(
                                                                                  fulfillments[0]
                                                                                    ?.delivered_on
                                                                                ),
                                                                                id_collaborator,
                                                                                precent_tax,
                                                                                id_ordrer,
                                                                              ],
                                                                              (
                                                                                err,
                                                                                data
                                                                              ) => {
                                                                                if (
                                                                                  err
                                                                                ) {
                                                                                }
                                                                                if (
                                                                                  data
                                                                                ) {
                                                                                  pool.query(
                                                                                    ServiceWebhook.addTax(),
                                                                                    [
                                                                                      id_collaborator,
                                                                                      orderValue,
                                                                                      handleCommissionBeforePersonalTax(
                                                                                        orderValue,
                                                                                        1
                                                                                      ),
                                                                                      handleBeforePersonalTax(
                                                                                        handleCommissionBeforePersonalTax(
                                                                                          orderValue,
                                                                                          1
                                                                                        ),
                                                                                        10
                                                                                      ),
                                                                                      parseInt(
                                                                                        handleCommissionBeforePersonalTax(
                                                                                          orderValue,
                                                                                          1
                                                                                        ) -
                                                                                          handleBeforePersonalTax(
                                                                                            handleCommissionBeforePersonalTax(
                                                                                              orderValue,
                                                                                              1
                                                                                            ),
                                                                                            10
                                                                                          )
                                                                                      ),
                                                                                      id_ordrer,
                                                                                      formatDateYYYYMMDD(
                                                                                        fulfillments[0]
                                                                                          ?.delivered_on
                                                                                      ),
                                                                                      formatTimeHHMMSS(
                                                                                        fulfillments[0]
                                                                                          ?.delivered_on
                                                                                      ),
                                                                                    ],
                                                                                    (
                                                                                      err,
                                                                                      data
                                                                                    ) => {
                                                                                      if (
                                                                                        err
                                                                                      ) {
                                                                                      }
                                                                                      if (
                                                                                        data
                                                                                      ) {
                                                                                        pool.query(
                                                                                          ServiceWebhook.updatePayment(),
                                                                                          [
                                                                                            new_commission,
                                                                                            parseInt(
                                                                                              secondNumber
                                                                                            ),
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
                                                                                              pool.query(
                                                                                                ServiceWebhook.checkPayment(),
                                                                                                [
                                                                                                  parseInt(
                                                                                                    secondNumber
                                                                                                  ),
                                                                                                ],
                                                                                                (
                                                                                                  err,
                                                                                                  data
                                                                                                ) => {
                                                                                                  if (
                                                                                                    err
                                                                                                  ) {
                                                                                                  }
                                                                                                  if (
                                                                                                    data.length >
                                                                                                    0
                                                                                                  ) {
                                                                                                    let recived =
                                                                                                      data[0]
                                                                                                        .total_recived;
                                                                                                    pool.query(
                                                                                                      "INSERT INTO withdraw (amount_recived, date_transferred, time_transferred, status_transferred, id_orders, type_transferred, id_orders_sapo, available_balance, id_collaborator) VALUES (?,?,?,?,?,?,?,?,?)",

                                                                                                      [
                                                                                                        handleCommission(
                                                                                                          orderValue,
                                                                                                          10,
                                                                                                          1
                                                                                                        ),
                                                                                                        formatDateYYYYMMDD(
                                                                                                          new Date()
                                                                                                        ),
                                                                                                        getCurrentTimeFormatted(),
                                                                                                        1,
                                                                                                        id_ordrer,
                                                                                                        0,
                                                                                                        id_order_sapo,
                                                                                                        parseInt(
                                                                                                          parseInt(
                                                                                                            init_balance
                                                                                                          ) +
                                                                                                            parseInt(
                                                                                                              handleCommission(
                                                                                                                orderValue,
                                                                                                                10,
                                                                                                                1
                                                                                                              )
                                                                                                            )
                                                                                                        ),
                                                                                                        parseInt(
                                                                                                          secondNumber
                                                                                                        ),
                                                                                                      ],
                                                                                                      (
                                                                                                        err,
                                                                                                        data
                                                                                                      ) => {
                                                                                                        if (
                                                                                                          err
                                                                                                        ) {
                                                                                                        }
                                                                                                        if (
                                                                                                          data
                                                                                                        ) {
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
                                                        if (
                                                          !bwaf.includes("-")
                                                        ) {
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
                                                          pool.query(
                                                            ServiceWebhook.checkPayment(),
                                                            [
                                                              parseInt(
                                                                bwafValue
                                                              ),
                                                            ],
                                                            (err, data) => {
                                                              if (err) {
                                                              }
                                                              if (
                                                                data.length > 0
                                                              ) {
                                                                let init_balance =
                                                                  data[0]
                                                                    .total_recived;
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

                                                                let id_collaborator =
                                                                  data[0]
                                                                    .id_collaborator;
                                                                pool.query(
                                                                  ServiceWebhook.addCommission(),
                                                                  [
                                                                    10,
                                                                    1,
                                                                    orderValue,
                                                                    precent_tax,
                                                                    0,
                                                                    formatDateYYYYMMDD(
                                                                      fulfillments[0]
                                                                        ?.delivered_on
                                                                    ),
                                                                    formatTimeHHMMSS(
                                                                      fulfillments[0]
                                                                        ?.delivered_on
                                                                    ),
                                                                    id_collaborator,
                                                                    precent_tax,
                                                                    id_ordrer,
                                                                  ],
                                                                  (
                                                                    err,
                                                                    data
                                                                  ) => {
                                                                    if (err) {
                                                                    }
                                                                    if (data) {
                                                                      pool.query(
                                                                        ServiceWebhook.addTax(),
                                                                        [
                                                                          id_collaborator,
                                                                          orderValue,
                                                                          handleCommissionBeforePersonalTax(
                                                                            orderValue,
                                                                            1
                                                                          ),
                                                                          handleBeforePersonalTax(
                                                                            handleCommissionBeforePersonalTax(
                                                                              orderValue,
                                                                              1
                                                                            ),
                                                                            10
                                                                          ),
                                                                          parseInt(
                                                                            handleCommissionBeforePersonalTax(
                                                                              orderValue,
                                                                              1
                                                                            ) -
                                                                              handleBeforePersonalTax(
                                                                                handleCommissionBeforePersonalTax(
                                                                                  orderValue,
                                                                                  1
                                                                                ),
                                                                                10
                                                                              )
                                                                          ),
                                                                          id_ordrer,
                                                                          formatDateYYYYMMDD(
                                                                            fulfillments[0]
                                                                              ?.delivered_on
                                                                          ),
                                                                          formatTimeHHMMSS(
                                                                            fulfillments[0]
                                                                              ?.delivered_on
                                                                          ),
                                                                        ],
                                                                        (
                                                                          err,
                                                                          data
                                                                        ) => {
                                                                          if (
                                                                            err
                                                                          ) {
                                                                          }
                                                                          if (
                                                                            data
                                                                          ) {
                                                                            pool.query(
                                                                              ServiceWebhook.updatePayment(),
                                                                              [
                                                                                new_commission,
                                                                                parseInt(
                                                                                  bwafValue
                                                                                ),
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
                                                                                  pool.query(
                                                                                    ServiceWebhook.checkPayment(),
                                                                                    [
                                                                                      parseInt(
                                                                                        bwafValue
                                                                                      ),
                                                                                    ],
                                                                                    (
                                                                                      err,
                                                                                      data
                                                                                    ) => {
                                                                                      if (
                                                                                        err
                                                                                      ) {
                                                                                      }
                                                                                      if (
                                                                                        data.length >
                                                                                        0
                                                                                      ) {
                                                                                        let recived =
                                                                                          data[0]
                                                                                            .total_recived;
                                                                                        pool.query(
                                                                                          "INSERT INTO withdraw (amount_recived, date_transferred, time_transferred, status_transferred, id_orders, type_transferred, id_orders_sapo, available_balance, id_collaborator) VALUES (?,?,?,?,?,?,?,?,?)",

                                                                                          [
                                                                                            handleCommission(
                                                                                              orderValue,
                                                                                              10,
                                                                                              1
                                                                                            ),
                                                                                            formatDateYYYYMMDD(
                                                                                              new Date()
                                                                                            ),
                                                                                            getCurrentTimeFormatted(),
                                                                                            1,
                                                                                            id_ordrer,
                                                                                            0,
                                                                                            id_order_sapo,
                                                                                            parseInt(
                                                                                              parseInt(
                                                                                                init_balance
                                                                                              ) +
                                                                                                parseInt(
                                                                                                  handleCommission(
                                                                                                    orderValue,
                                                                                                    10,
                                                                                                    1
                                                                                                  )
                                                                                                )
                                                                                            ),
                                                                                            parseInt(
                                                                                              bwafValue
                                                                                            ),
                                                                                          ],
                                                                                          (
                                                                                            err,
                                                                                            data
                                                                                          ) => {
                                                                                            if (
                                                                                              err
                                                                                            ) {
                                                                                            }
                                                                                            if (
                                                                                              data
                                                                                            ) {
                                                                                              setItem(
                                                                                                "Thông báo đơn hàng",
                                                                                                `Đơn hàng ${id_order_sapo} vừa thanh toán thành công`
                                                                                              );
                                                                                              sendNotificationToAll(
                                                                                                "Thông báo đơn hàng",
                                                                                                `Đơn hàng ${id_order_sapo} vừa thanh toán thành công`
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
                                                    }
                                                  );
                                                }
                                              }
                                            );
                                          }
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
                      pool.query(
                        "UPDATE orders SET 	financial_status=?, status=? WHERE id_orders_sapo=?",
                        ["refunded", "cancelled", id],
                        (err, data) => {
                          if (err) {
                          }
                          if (data) {
                            return;
                          }
                        }
                      );
                    }
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
                  customer?.last_order_id,
                  email,
                  status,
                  total_price,
                  landing_site,
                ],
                (err, data) => {
                  if (err) {
                    console.error("Error inserting order:", err);
                  }
                  if (data) {
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
