const pool = require("../../config/database");

const getOrdersByReferralLink = (req, res) => {
  const id = req.params.id;

  try {
    const query1 = `
    SELECT * FROM orders
    WHERE referral_link LIKE '%/?bwaf=%'
  `;

    pool.query(query1, (error, results1) => {
      if (error) {
        return res.status(500).send(error);
      }

      // Lọc kết quả dựa trên id
      const filteredResults1 = results1.filter((order) => {
        const refLink = order.referral_link.split("/?bwaf=")[1];
        if (refLink) {
          const [first, second] = refLink.split("-");
          return first === id || second === id;
        }
        return false;
      });

      // Truy vấn 2: Lấy các đơn hàng có referral_link là '/', '/password' hoặc rỗng
      const query2 = `
      SELECT * FROM orders
      WHERE referral_link IN ('/', '/password', '')
    `;

      pool.query(query2, (error, results2) => {
        if (error) {
          return res.status(500).send(error);
        }

        // Lọc results2 dựa trên các số điện thoại từ filteredResults1
        const phones = filteredResults1.map((order) => order.customer_phone);
        const filteredResults2 = results2.filter((order) =>
          phones.includes(order.customer_phone)
        );

        // Kết hợp kết quả từ cả hai truy vấn
        const data = [...filteredResults1, ...filteredResults2];
        return res.status(200).json(data);
      });
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

module.exports = {
  getOrdersByReferralLink,
};
