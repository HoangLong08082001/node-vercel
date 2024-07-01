const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const useragent = require("useragent");
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const WebhookModal = require("./WEBHOOK/WebhookModal.js");
const jwt = require("jsonwebtoken");
const CollaboratorRoute = require("./API/Collaborator/CollaboratorRoute.js");
const TeamRoutes = require("./API/Team/TeamRoutes.js");
const ViewRoutes = require("./routes-views/routers.js");
const WebhookRoute = require("./WEBHOOK/WebhookRoute.js");
const logger = require("./middleware/logger.js");
const EmployeeRoutes = require("./API/Employee/EmployeeRoutes.js");
const DepartmentRoutes = require("./API/Department/DepartmentRoutes.js");
const CampaignRoutes = require("./API/Campaign/CampaignRoutes.js");
const RuleRoute = require("./API/Rule/RuleRoutes.js");
const axios = require("axios");
const pool = require("./config/database.js");
const path = require("path");
const WebSocket = require("ws");
const socketIO = require("socket.io");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { default: ProductRoutes } = require("./API/Product/ProductRoutes.js");
const { default: OrdersRoutes } = require("./API/Orders/OrdersRoutes.js");
const moment = require("moment/moment.js");
// const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json");

dotenv.config();
const app = express();
const server = http.createServer(app); // Tạo server trước khi tạo WebSocket server
const wss = new WebSocket.Server({ server });

const port = process.env.PORT_SERVER || 4000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// const targetServers = [
//   "http://192.168.1.71:3031",
//   "http://192.168.1.71:3032",
//   "http://192.168.1.71:3033",
// ];
// let currentIndex = 0;

// const getNextServer = () => {
//   const server = targetServers[currentIndex];
//   currentIndex = (currentIndex + 1) % targetServers.length;
//   return server;
// };
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
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Chỉnh sửa nếu frontend chạy ở port khác
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
app.set("io", io);
app.set("wss", wss);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./public")));

app.use(cors(corsOptions));

// app.use((req, res, next) => {
//   const target = getNextServer();
//   createProxyMiddleware({
//     target: target,
//     changeOrigin: true,
//     onProxyReq: (proxyReq, req, res) => {
//       console.log(`Proxying request to: ${target}`);
//     },
//   })(req, res, next);
// });
CollaboratorRoute(app);
WebhookRoute(app);
TeamRoutes(app);
ViewRoutes(app);
EmployeeRoutes(app);
DepartmentRoutes(app);
CampaignRoutes(app);
RuleRoute(app);
ProductRoutes(app);
OrdersRoutes(app);
// app.post("/store-token", async (req, res) => {
//   const { token } = req.body;
//   if (!token) {
//     return res.status(400).send("Token is required");
//   }
//   try {
//     // Lưu token vào Firebase Realtime Database
//     const tokenRef = admin.database().ref("/tokens").push();
//     await tokenRef.set(token);
//     res.status(200).send("Token stored successfully");
//   } catch (error) {
//     console.error("Error storing token:", error);
//     res.status(500).send("Error storing token: " + error.message);
//   }
// });

// // Hàm để gửi thông báo đến tất cả các token đã lưu
// async function sendNotificationToAll(title, body) {
//   const tokensSnapshot = await admin.database().ref("/tokens").once("value");
//   const tokens = tokensSnapshot.val();
//   if (!tokens) {
//     console.log("No tokens found");
//     return;
//   }
//   const tokenList = Object.values(tokens);
//   const message = {
//     notification: { title, body },
//     tokens: tokenList,
//   };
//   admin
//     .messaging()
//     .sendMulticast(message)
//     .then((response) => {
//       console.log("Successfully sent message:", response);
//     })
//     .catch((error) => {
//       console.error("Error sending message:", error);
//     });
// }

// // Endpoint để gửi thông báo
// app.post("/send-notification", async (req, res) => {
//   const { title, body } = req.body;
//   if (!title || !body) {
//     return res.status(400).send("Title and body are required");
//   }
//   try {
//     await sendNotificationToAll(title, body);
//     res.status(200).send("Notification sent successfully");
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     res.status(500).send("Error sending notification: " + error.message);
//   }
// });

const getOrders = async () => {
  let sdt = "";
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://test-ecoop-mart.mysapo.net/admin/orders.json`, {
        auth: {
          username: "ba1e1f2a92624397a5aea698196afef2", // API Key
          password: "016829a5f06f4707b0757c3aec095f4a", // API Secret
        },
      })
      .then((response) => {
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
          
          if (
            financial_status === "paid" &&
            fulfillment_status === "fulfilled" &&
            status === "open" &&
            return_status === "no_return" 
          ) {
            pool.query(
              WebhookModal.ServiceWebhook.checkIdSapo,
              [id],
              (err, data) => {
                if (err) {
                }
                if (data.length > 0) {
                  return;
                } else {
                  pool.query(
                    WebhookModal.ServiceWebhook.insertOrder,
                    [
                      id,
                      formatDate(created_on),
                      financial_status,
                      fulfillment_status,
                      phone,
                      email,
                      status,
                      total_price,
                      formatDate(fulfillments[0].delivered_on),
                      landing_site,
                    ],
                    (err, data) => {
                      if (err) {
                      }
                      if (data) {
                        pool.query(
                          WebhookModal.ServiceWebhook.checkIdSapo,
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
                                let precent_tax = WebhookModal.handleCommission(
                                  orderValue,
                                  10,
                                  1
                                );
                                pool.query(
                                  WebhookModal.ServiceWebhook.checkPayment,
                                  [firstNumber],
                                  (err, data) => {
                                    if (err) {
                                    }
                                    if (data.length > 0) {
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
                                        WebhookModal.ServiceWebhook
                                          .updatePayment,
                                        [new_commission, firstNumber],
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
                                pool.query(
                                  WebhookModal.ServiceWebhook
                                    .checkAffiliateLevel2,
                                  [secondNumber],
                                  (err, data) => {
                                    if (err) {
                                    }
                                    if (data.length > 0) {
                                      pool.query(
                                        WebhookModal.ServiceWebhook
                                          .checkAffiliateLevel1,
                                        [firstNumber, data[0].phone],
                                        (err, data) => {
                                          if (data.length > 0) {
                                            pool.query(
                                              WebhookModal.ServiceWebhook
                                                .checkPayment,
                                              [secondNumber],
                                              (err, data) => {
                                                if (err) {
                                                }
                                                if (data.length > 0) {
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
                                                    WebhookModal.ServiceWebhook
                                                      .updatePayment,
                                                    [
                                                      new_commission,
                                                      secondNumber,
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
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              } else {
                                const bwafValue = bwaf.split("=")[1];
                                const orderValue = order.total_price;
                                let precent_tax = WebhookModal.handleCommission(
                                  orderValue,
                                  10,
                                  1
                                );

                                pool.query(
                                  WebhookModal.ServiceWebhook.checkPayment,
                                  [bwafValue],
                                  (err, data) => {
                                    if (err) {
                                    }
                                    if (data.length > 0) {
                                      const sum = (a, b) => {
                                        return parseInt(a + b);
                                      };
                                      let new_commission = sum(
                                        parseInt(
                                          data[0].total_withdrawn
                                            ? data[0].total_withdrawn
                                            : 0
                                        ),
                                        parseInt(precent_tax)
                                      );

                                      pool.query(
                                        WebhookModal.ServiceWebhook
                                          .updatePayment,
                                        [new_commission, bwafValue],
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
                              }
                              if (
                                bwaf === "/password" ||
                                bwaf === "/" ||
                                bwaf === ""
                              ) {
                                pool.query(
                                  WebhookModal.ServiceWebhook
                                    .checkPhoneEmailOrder,
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
                                        var numbers = numberStr.split("-");

                                        // Gán kết quả vào các biến
                                        var firstNumber = numbers[0];
                                        var secondNumber = numbers[1];
                                        const orderValue = data[0].total_price;
                                        let precent_tax =
                                          WebhookModal.handleCommission(
                                            orderValue,
                                            10,
                                            1
                                          );
                                        pool.query(
                                          WebhookModal.ServiceWebhook
                                            .checkPayment,
                                          [firstNumber],
                                          (err, data) => {
                                            if (err) {
                                            }
                                            if (data.length > 0) {
                                              const sum = (a, b) => {
                                                return parseInt(a + b);
                                              };
                                              let new_commission = sum(
                                                parseInt(
                                                  data[0].total_withdrawn
                                                    ? data[0].total_withdrawn
                                                    : 0
                                                ),
                                                parseInt(precent_tax)
                                              );

                                              pool.query(
                                                WebhookModal.ServiceWebhook
                                                  .updatePayment,
                                                [new_commission, firstNumber],
                                                (err, result) => {
                                                  if (err) {
                                                    console.log("error");
                                                  }
                                                  if (result) {
                                                  }
                                                }
                                              );
                                            }
                                          }
                                        );
                                        pool.query(
                                          WebhookModal.ServiceWebhook
                                            .checkAffiliateLevel2,
                                          [secondNumber],
                                          (err, data) => {
                                            if (err) {
                                            }
                                            if (data.length > 0) {
                                              pool.query(
                                                WebhookModal.ServiceWebhook
                                                  .checkAffiliateLevel1,
                                                [firstNumber, data[0].phone],
                                                (err, data) => {
                                                  if (data.length > 0) {
                                                    pool.query(
                                                      WebhookModal
                                                        .ServiceWebhook
                                                        .checkPayment,
                                                      [secondNumber],
                                                      (err, data) => {
                                                        if (err) {
                                                        }
                                                        if (data.length > 0) {
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
                                                                  .total_withdrawn
                                                                  ? data[0]
                                                                      .total_withdrawn
                                                                  : 0
                                                              ),
                                                              parseInt(
                                                                precent_tax
                                                              )
                                                            );
                                                          pool.query(
                                                            WebhookModal
                                                              .ServiceWebhook
                                                              .updatePayment,
                                                            [
                                                              new_commission,
                                                              secondNumber,
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
                                                  }
                                                }
                                              );
                                            }
                                          }
                                        );
                                      }
                                      if (!bwaf.includes("-")) {
                                        const bwafValue = bwaf.split("=")[1];
                                        const orderValue = order.total_price;
                                        let precent_tax =
                                          WebhookModal.handleCommission(
                                            orderValue,
                                            10,
                                            1
                                          );
                                        console.log(precent_tax);
                                        pool.query(
                                          WebhookModal.ServiceWebhook
                                            .checkPayment,
                                          [bwafValue],
                                          (err, data) => {
                                            if (err) {
                                              console.log("fails");
                                            }
                                            if (data.length > 0) {
                                              const sum = (a, b) => {
                                                return parseInt(a + b);
                                              };
                                              let new_commission = sum(
                                                parseInt(
                                                  data[0].total_withdrawn
                                                    ? data[0].total_withdrawn
                                                    : 0
                                                ),
                                                parseInt(precent_tax)
                                              );
                                              console.log(
                                                data[0].total_withdrawn
                                              );
                                              console.log(precent_tax);
                                              console.log(new_commission);
                                              pool.query(
                                                WebhookModal.ServiceWebhook
                                                  .updatePayment,
                                                [new_commission, bwafValue],
                                                (err, result) => {
                                                  if (err) {
                                                    console.log("fails");
                                                  }
                                                  if (result) {
                                                    console.log("success");
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
        });
      });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
  }
};

app.get("/logs", (req, res) => {
  const logFilePath = path.join(__dirname, "combined.log");
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      try {
        const logsLine = data.split("\n").filter((line) => line.trim() !== "");
        const logObject = logsLine.map((item) => JSON.parse(item));
        console.log(logObject);
        return res.status(200).json(logObject);
      } catch (error) {
        return res.status(500).json({ message: "fails" });
      }
    }
  });
});
app.use((req, res, next) => {
  function getVNDateTime(date) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const ngày = date.toLocaleDateString("vi-VN", options);
    const giờ = date.toLocaleTimeString("vi-VN");
    return `${ngày} ${giờ}`;
  }

  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const agent = useragent.parse(req.headers["user-agent"]);
  const os = agent.os.toString();

  const newLogMessages = {
    name: req.app.get("name"),
    status: res.statusCode,
    date: getVNDateTime(new Date()),
    method: req.method,
    api: req.url,
    ip: ip,
    os: os,
  };
  logger.info(newLogMessages);
  next();
});

setInterval(() => {
  getOrders();
}, 10000);
server.listen(port, (err) => {
  if (err) {
    throw err;
  } else {
    console.log("server load balancing is running on the port " + port);
  }
});
