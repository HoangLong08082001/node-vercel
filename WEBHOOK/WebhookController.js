const { setTimeout, setInterval } = require("timers");
const request = require("request");
const axios = require("axios");
const WebSocket = require("ws");
const { response } = require("express");
const pool = require("../config/database.js");
const WebhookModal = require("./WebhookModal.js");
const dotenv = require("dotenv");
dotenv.config();

//Orders
async function getOrders(req, res) {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/orders.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
        },
      })
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        // let objuser = response.data.orders[1].user;
        // let objitems = response.data.orders[1].line_items;
        // let mergedObj = Object.assign({}, objuser, objitems);

        // console.log(mergedObj);
        // for (let i = 0; i < response.data.orders.length; i++) {
        //   console.log(
        //     Object.assign(
        //       {},
        //       response.data.orders[i].user,
        //       response.data.orders[i].line_items
        //     )
        //   );
        //   return res.send(
        //     Object.assign(
        //       {},
        //       response.data.orders[i].user,
        //       response.data.orders[i].line_items
        //     )
        //   );
        // }
        //paid fulfilled open
        console.log(response);
        const mapValues = response.data.orders.map((item) => [
          item.id,
          item.financial_status,
          item.fulfillment_status,
          item.status,
          item.total_price,
          item.landing_site,
        ]);
        if (mapValues) {
          pool.query(
            WebhookModal.ServiceWebhook.insertOrder,
            [mapValues],
            (err, result) => {
              if (err) {
                throw err;
              }
              if (result) {
                pool.query(
                  WebhookModal.ServiceWebhook.getAllOrders,
                  [],
                  (err, orders) => {
                    const order = orders[0];
                    console.log(order);
                    const bwaf = order.referral_link; // Giả sử cột chứa dữ liệu là 'bwaf'
                    const bwafValue = bwaf.split("=")[1];
                    const orderValue = order.total_price;
                    let precent_tax = WebhookModal.handleCommission(
                      orderValue,
                      10,
                      1
                    );
                    console.log(precent_tax);
                    pool.query(
                      WebhookModal.ServiceWebhook.checkPayment,
                      [bwafValue],
                      (err, data) => {
                        if (err) {
                          throw err;
                        }
                        if (data.length > 0) {
                          let new_commission =
                            data[0].total_withdrawn + precent_tax;
                          console.log(new_commission);
                          pool.query(
                            WebhookModal.ServiceWebhook.updatePayment,
                            [new_commission, bwafValue],
                            (err, result) => {
                              if (err) {
                                throw err;
                              }
                              if (result) {
                                return res
                                  .status(200)
                                  .json({ message: "success" });
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                );
              }
            }
          );
        }
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getOrderById(req, res) {
  let id = req.params.orders_id;
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/orders/${id}.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
        },
      })
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let objuser = response.data.order.customer;
        let objitems = response.data;
        let mergedObj = Object.assign({}, objuser, objitems);
        //     const query = `
        //   INSERT INTO orders (id_orders_sapo, financial_status, fulfillment_status, status_orders)
        //   VALUES (?, ?, ?, ?)
        //   ON DUPLICATE KEY UPDATE
        //   id_orders_sapo = VALUES(id_orders_sapo),
        //   financial_status = VALUES(financial_status),
        //   fulfillment_status = VALUES(fulfillment_status),
        //   status_orders = VALUES(status_orders)
        // `;
        //     pool.query(
        //       query,
        //       [
        //         objitems.order.id,
        //         objitems.order.financial_status,
        //         objitems.order.fulfillment_status,
        //         objitems.order.status_orders,
        //       ],
        //       (err, result) => {
        //         if (err) {
        //           console.log(err);
        //         } else {
        //           console.log(result);
        //         }
        //       }
        //     );
        return res.status(200).send(objitems);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getOrderTotal(req, res) {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/orders/count.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
        },
      })
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data.count;
        return res.status(200).json(response.data);
      });

    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Customers
async function getCustomers(req, res) {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/customers.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
        },
      })
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data;
        console.log(total);
        return res.status(200).json(total);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCustomerById(req, res) {
  let id = req.params.customers_id;
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/customers/${id}.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
            password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
          },
        }
      )
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data;
        return res.status(200).json(total);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getTotalCustomers(req, res) {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/customers/count.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
            password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
          },
        }
      )
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data.count;
        return res.status(200).json(response.data);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Customers address
async function getCustomersAddress(req, res) {
  let idCustommer = req.params.customers_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/customers/${idCustommer}/addresses.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
            password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCustomersIdAddressId(req, res) {
  let idCustommer = req.params.customers_id;
  let idAddress = req.params.address_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/customers/${idCustommer}/addresses/${idAddress}.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
            password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Stores
async function getStores(req, res) {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/store.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
        },
      })
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data;
        console.log(total);
        return res.status(200).json(total);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Products
async function getProducts(req, res) {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/products.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
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
          item.alias,
        ]);
        console.log(mapValue);
        const query = ` INSERT INTO products (id_products_sapo, image_product, name_product, alias)
          VALUES ?
          ON DUPLICATE KEY UPDATE
          id_products_sapo = VALUES(id_products_sapo),
          image_product = VALUES(image_product),
          name_product = VALUES(name_product),
          alias = VALUES(alias)`;
        pool.query(query, [mapValue], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        });
        return res.status(200).json(total);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getProductById(req, res) {
  let id = req.params.products_id;
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/products/${id}.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
        },
      })
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data;
        return res.status(200).json(total);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getProductTotal(req, res) {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/products/count.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
        },
      })
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data.count;
        return res.status(200).json(response.data);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//collect
async function getCollects(req, res) {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/collects.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
        },
      })
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data;
        console.log(total);
        return res.status(200).json(total);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCollectById(req, res) {
  let id = req.params.collects_id;
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/collects.json?product_id=${id}`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
            password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
          },
        }
      )
      .then((response) => {
        // Kiểm tra và xử lý dữ liệu
        // Xử lý dữ liệu 'billing_address' ở đây
        // setInterval(() => {
        //   console.log(response.data.orders[0].customer);
        // }, 1000);
        let total = response.data;
        return res.status(200).json(total);
      });
    // Trả về dữ liệu từ API
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCollectsTotal(req, res) {
  try {
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/collects/count.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
          password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
        },
      })
      .then((response) => {
        return res.send(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Custom collect
async function getCustomCollects(req, res) {
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/custom_collections.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
            password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCustomCollectsId(req, res) {
  let idCustomCollect = req.params.custom_collect_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/custom_collections/${idCustomCollect}.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
            password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCustomCollectsTotal(req, res) {
  let product_id = req.params.products_id;
  try {
    if (product_id) {
      await axios
        .get(
          `https://demo-affiliate-apec.mysapo.net/admin/custom_collections/count.json?product_id=${product_id}`,
          {
            auth: {
              username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
              password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
            },
          }
        )
        .then((response) => {
          console.log(response.data);
        });
    }
    if (!product_id) {
      await axios
        .get(
          `https://demo-affiliate-apec.mysapo.net/admin/custom_collections/count.json`,
          {
            auth: {
              username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
              password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
            },
          }
        )
        .then((response) => {
          console.log(response.data);
        });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
  return res.send("collect custom total");
}

//Events
async function getEvents(req, res) {
  try {
    await axios
      .get(
        "https://demo-affiliate-apec.mysapo.net/admin/events.json?filter=Product,Order",
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd", // API Key
            password: "0a61d242301e40cb8e30054ba0274fc7", // API Secret
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCustomCollectsEvents(req, res) {
  let custom_collections_id = req.params.custom_collect_events_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/custom_collections/${custom_collections_id}/events.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getOrdersEvents(req, res) {
  let orders_id = req.params.orders_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/orders/${orders_id}/events.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getProductsEvents(req, res) {
  let products_id = req.params.products_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/products/${products_id}/events.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getEventsTotal(req, res) {
  try {
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/events/count.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd",
          password: "0a61d242301e40cb8e30054ba0274fc7",
        },
      })
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Fulfillment
async function getFulfillment(req, res) {
  let orders_id = req.params.orders_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/orders/${orders_id}/fulfillments.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getFulfillmentById(req, res) {
  let orders_id = req.params.orders_id;
  let fulfillment_id = req.params.fulfillment_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/orders/${orders_id}/fulfillments/${fulfillment_id}.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getFulfillmentTotal(req, res) {
  let orders_id = req.params.orders_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/orders/${orders_id}/fulfillments/count.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Metafields
async function getMetafields(req, res) {
  try {
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/metafields.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd",
          password: "0a61d242301e40cb8e30054ba0274fc7",
        },
      })
      .then((response) => {
        console.log(response.data);
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCustomCollectMetafields(req, res) {
  let custom_collection_id = req.params.custom_collection_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/custom_collections/${custom_collection_id}/metafields.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCustomersMetafields(req, res) {
  let customers_id = req.params.customers_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/customers/${customers_id}/metafields.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getOrdersMetafields(req, res) {
  let orders_id = req.params.orders_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/orders/${orders_id}/metafields.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getProductsMetafields(req, res) {
  let products_id = req.params.products_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/products/${products_id}/metafields.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getMetafieldTotal(req, res) {
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/metafields/count.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getProductsByIdMetafields(req, res) {
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/metafields/count.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Price rule
async function getPriceRule(req, res) {
  try {
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/price_rules.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd",
          password: "0a61d242301e40cb8e30054ba0274fc7",
        },
      })
      .then((response) => {
        console.log(response.data);
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getPriceRuleById(req, res) {
  let priceRule_id = req.params.priceRule_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/price_rules/${priceRule_id}.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Refund
async function getRefund(req, res) {
  let orders_id = req.params.orders_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/orders/${orders_id}/refunds.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Transaction
async function getTransaction(req, res) {
  let orders_id = req.params.orders_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/orders/${orders_id}/transactions.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getTransactionById(req, res) {
  let orders_id = req.params.orders_id;
  let transaction_id = req.params.transaction_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/orders/${orders_id}/transactions/${transaction_id}.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
  return res.send("transactions by id");
}
async function getTransactionTotal(req, res) {
  let orders_id = req.params.orders_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/orders/${orders_id}/transactions/count.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Carrie Services
async function getCarrierServices(req, res) {
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/carrier_services.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getCarrierServicesById(req, res) {
  let carrier_services_id = req.params.carrier_services_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/carrier_services/${carrier_services_id}.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
  return res.send("carrier service");
}

//Redirect
async function getRedirect(req, res) {
  try {
    await axios
      .get(`https://demo-affiliate-apec.mysapo.net/admin/redirects.json`, {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd",
          password: "0a61d242301e40cb8e30054ba0274fc7",
        },
      })
      .then((response) => {
        console.log(response.data);
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getRedirectById(req, res) {
  let redirect_id = req.params.redirect_id;
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/redirects/${redirect_id}.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
async function getRedirectTotal(req, res) {
  try {
    await axios
      .get(
        `https://demo-affiliate-apec.mysapo.net/admin/redirects/count.json`,
        {
          auth: {
            username: "681591ec1cf54f2da2e59d4d04de0edd",
            password: "0a61d242301e40cb8e30054ba0274fc7",
          },
        }
      )
      .then((response) => {
        console.log(response.data.count);
        return res.status(200).json(response.data);
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

//Variants
async function getVariants(req, res) {
  try {
    await axios
      .get("https://demo-affiliate-apec.mysapo.net/admin/variants.json", {
        auth: {
          username: "681591ec1cf54f2da2e59d4d04de0edd",
          password: "0a61d242301e40cb8e30054ba0274fc7",
        },
      })
      .then((response) => {
        const mapValue = response.data.variants.map((item) => [
          item.sku,
          item.price,
        ]);
        const query = ` INSERT INTO products (id_products_sapo,	price)
          VALUES ?
          ON DUPLICATE KEY UPDATE
          id_products_sapo = VALUES(id_products_sapo),
          price = VALUES(price)`;
        pool.query(query, [mapValue], (err, result) => {
          if (err) {
            console.log(err);
          }
          if (result) {
            setInterval(() => {
              return res.status(200).json(response.data);
            }, 2000);
          }
        });
      });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}
module.exports = {
  getOrders,
  getOrderById,
  getOrderTotal,
  getCustomers,
  getCustomerById,
  getTotalCustomers,
  getStores,
  getProducts,
  getProductById,
  getProductTotal,
  getCollects,
  getCollectById,
  getCollectsTotal,
  getCustomersAddress,
  getCustomersIdAddressId,
  getCustomCollects,
  getCustomCollectsId,
  getCustomCollectsTotal,
  getEvents,
  getCustomCollectsEvents,
  getOrdersEvents,
  getProductsEvents,
  getFulfillment,
  getFulfillmentById,
  getFulfillmentTotal,
  getMetafields,
  getCustomCollectMetafields,
  getCustomersMetafields,
  getOrdersMetafields,
  getProductsMetafields,
  getPriceRule,
  getPriceRuleById,
  getRefund,
  getTransaction,
  getTransactionById,
  getTransactionTotal,
  getCarrierServices,
  getCarrierServicesById,
  getMetafieldTotal,
  getProductsByIdMetafields,
  getEventsTotal,
  getRedirect,
  getRedirectById,
  getRedirectTotal,
  getVariants,
};
