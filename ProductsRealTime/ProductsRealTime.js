const { default: axios } = require("axios");
const pool = require("../config/database");

async function getProducts(req, res) {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://test-website-affiliate.mysapo.net/admin/products.json`, {
        auth: {
          username: "cf3cd0aedda14fbda861e4cf5700f73f", // API Key
          password: "377504ca04e94900bea5e8c0591bc65a", // API Secret
        },
      })
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data;
        const mapValue = response.data.products.map((item) => [
          item.id,
          item.images[0].src,
          item.name,
          item.tags,
          item.alias,
        ]);
        const query = ` INSERT INTO products (id_products_sapo, image_product, name_product,type_products, alias)
          VALUES ?
          ON DUPLICATE KEY UPDATE
          id_products_sapo = VALUES(id_products_sapo),
          image_product = VALUES(image_product),
          name_product = VALUES(name_product),
          type_products = VALUES(type_products),
          alias = VALUES(alias)`;
        pool.query(query, [mapValue], (err, result) => {
          if (err) {
            return;
          }
          if (result) {
            return;
          }
        });
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    return;
  }
}

module.exports = getProducts;
