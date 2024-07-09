const pool = require("../../config/database");
const ServicePayment = require("./PaymentModal");
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0, nên cộng thêm 1
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
const drawCommission = (req, res) => {
  console.log(req.body);
  let id = req.body.id_collaborator;
  try {
    pool.query(ServicePayment.getTotalRecived(), [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        let total_recived = data[0].total_recived;

        if (total_recived !== 0 && total_recived > 0) {
          pool.query(
            ServicePayment.addWithdraw(),
            [formatDate(new Date()), total_recived, 0, id],
            (err, data) => {
              if (err) {
                throw err;
              }
              if (data) {
                return res.status(200).json({ message: "success" });
              }
            }
          );
        } else {
          return res
            .status(400)
            .json({ message: "Số tiền rút phải lớn hơn 0đ" });
        }
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
        let total_recived_payment = data[0].total_recived;
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
                        parseInt(total_recived_payment) -
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
        return res.status(200).json(data);
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
module.exports = { getDraws, drawCommission, confirmTransfer };
