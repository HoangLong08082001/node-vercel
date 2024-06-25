const pool = require("../../config/database");
const { ServiceProduct } = require("./ProductModal");

const getProducts = (req, res) => {
  try {
    pool.query(ServiceProduct.all, [], (err, data) => {
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

module.exports = { getProducts };
