const pool = require("../../config/database");
const { ServiceOrder } = require("./OrdersModals");
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
function getOrdersByReferralLink(req, res) {
  let id = req.params.id;
  try {
    // pool.query(
    //   ServiceOrder.getOrdersHaveReferralLink(),
    //   [],
    //   (error, results1) => {
    //     if (error) {
    //       return res.status(500).send(error);
    //     }

    //     // Lọc kết quả dựa trên id
    //     const filteredResults1 = results1.filter((order) => {
    //       const refLink = order.referral_link.split("/?bwaf=")[1];
    //       const refLinkAfterDecode = decode(refLink);
    //       if (!refLinkAfterDecode.includes("-")) {
    //         const [first, second] = refLinkAfterDecode.split("-");
    //         return first === id || second === id;
    //       }
    //       return false;
    //     });

    //     // Truy vấn 2: Lấy các đơn hàng có referral_link là '/', '/password' hoặc rỗng

    //     pool.query(ServiceOrder.checkRefferalHave(), [], (error, results2) => {
    //       if (error) {
    //         return res.status(500).send(error);
    //       }

    //       // Lọc results2 dựa trên các số điện thoại từ filteredResults1
    //       if (results2) {
    //         const phones = filteredResults1.map(
    //           (order) => order.customer_phone
    //         );
    //         const filteredResults2 = results2.filter((order) =>
    //           phones.includes(order.customer_phone)
    //         );

    //         // Kết hợp kết quả từ cả hai truy vấn
    //         const data = [...filteredResults1, ...filteredResults2];
    //         return res.status(200).json(data);
    //       }
    //     });
    //   }
    // );
    pool.query(
      "SELECT withdraw.id_withdraw, withdraw.id_orders_sapo, withdraw.id_orders, withdraw.amount_recived, DATE_FORMAT(CONVERT_TZ(withdraw.date_transferred, '+00:00', '+07:00'), '%d/%m/%Y') as date_transfer, withdraw.time_transferred FROM withdraw WHERE withdraw.id_collaborator = ? AND withdraw.type_transferred = 0;",
      [id],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          return res.status(200).json(data);
        } else {
          return res.status(200).json([]);
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
}
function getOrdersByReferralLinkTeam(req, res) {
  let id = req.params.id;
  try {
    // pool.query(
    //   ServiceOrder.getOrdersHaveReferralLink(),
    //   [],
    //   (error, results1) => {
    //     if (error) {
    //       return res.status(500).send(error);
    //     }

    //     // Lọc kết quả dựa trên id
    //     const filteredResults1 = results1.filter((order) => {
    //       const refLink = order.referral_link.split("/?bwaf=")[1];
    //       const refLinkAfterDecode = decode(refLink);
    //       if (refLinkAfterDecode.includes("-")) {
    //         const [first, second] = refLinkAfterDecode.split("-");
    //         return first === id || second === id;
    //       }
    //       return false;
    //     });

    //     // Truy vấn 2: Lấy các đơn hàng có referral_link là '/', '/password' hoặc rỗng

    //     pool.query(ServiceOrder.checkRefferalHave(), [], (error, results2) => {
    //       if (error) {
    //         return res.status(500).send(error);
    //       }

    //       // Lọc results2 dựa trên các số điện thoại từ filteredResults1
    //       const phones = filteredResults1.map((order) => order.customer_phone);
    //       const filteredResults2 = results2.filter((order) =>
    //         phones.includes(order.customer_phone)
    //       );

    //       // Kết hợp kết quả từ cả hai truy vấn
    //       const data = [...filteredResults1, ...filteredResults2];
    //       return res.status(200).json(data);
    //     });
    //   }
    // );
    pool.query(
      "SELECT * FROM collaborator WHERE id_collaborator = ?",
      [id],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          let presenter_phone = data[0].phone;
          pool.query(
            "SELECT withdraw.id_orders_sapo, withdraw.amount_recived, collaborator.phone, DATE_FORMAT(CONVERT_TZ(withdraw.date_transferred, '+00:00', '+07:00'), '%d/%m/%Y') as date_transfer, withdraw.time_transferred FROM collaborator JOIN withdraw on collaborator.id_collaborator = withdraw.id_collaborator WHERE collaborator.presenter_phone = ?;",
            [presenter_phone],
            (err, data) => {
              if (err) {
                throw err;
              }
              if (data.length > 0) {
                return res.status(200).json(data);
              } else {
                return res.status(200).json([]);
              }
            }
          );
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
}
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const formatDate1 = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const getAll = (req, res) => {
  try {
    pool.query(ServiceOrder.getAllOrders(), [], (err, data) => {
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

const filterDate = (req, res) => {
  let dateOne = req.params.date1;
  let dateTwo = req.params.date2;
  try {
    pool;
  } catch (error) {}
};
const allOrder = (req, res) => {
  try {
    pool.query(ServiceOrder.allOrders(), [], (err, data) => {
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
module.exports = {
  getOrdersByReferralLink,
  getAll,
  filterDate,
  allOrder,
  getOrdersByReferralLinkTeam,
};
