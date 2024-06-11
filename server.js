const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const useragent = require("useragent");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const WebhookModal = require("./WEBHOOK/WebhookModal.js");

import CollaboratorRoute from "./API/Collaborator/CollaboratorRoute.js";
import TeamRoutes from "./API/Team/TeamRoutes.js";
import "./config/database.js";
import ViewRoutes from "./routes-views/routers.js";
import WebhookRoute from "./WEBHOOK/WebhookRoute.js";
const logger = require("./middleware/logger.js");
import EmployeeRoutes from "./API/Employee/EmployeeRoutes.js";
import DepartmentRoutes from "./API/Department/DepartmentRoutes.js";
import CampaignRoutes from "./API/Campaign/CampaignRoutes.js";
import RuleRoute from "./API/Rule/RuleRoutes.js";
import axios from "axios";
import pool from "./config/database.js";
const path = require("path");
const WebSocket = require("ws");
const socketIO = require("socket.io");
dotenv.config();
const app = express();
const server = http.createServer(app); // Tạo server trước khi tạo WebSocket server
const wss = new WebSocket.Server({ server });

const port = process.env.PORT_SERVER || 4000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
const arrayLog = [];

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
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const agent = useragent.parse(req.headers["user-agent"]);
  const os = agent.os.toString();

  const logMessage = `Request: ${req.app.get("name")} ${
    res.statusCode
  } ${getVNDateTime(new Date())} ${req.method} ${
    req.url
  } from IP: ${ip}, OS: ${os}`;
  logger.info(logMessage);
  arrayLog.push(logMessage);
  // const newLogMessages = {
  //   name: req.app.get("name"),
  //   status: res.statusCode,
  //   date: getVNDateTime(new Date()),
  //   method: req.method,
  //   api: req.url,
  //   ip: ip,
  //   os: os,
  // };
  // arrayLog.push(newLogMessages);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ log: logMessage }));
    }
  });
  next();
});

wss.on("connection", (ws) => {
  console.log("Client connected");
  arrayLog.forEach((log) => {
    ws.send(JSON.stringify({ log }));
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

WebhookRoute(app);
CollaboratorRoute(app);
TeamRoutes(app);
ViewRoutes(app);
EmployeeRoutes(app);
DepartmentRoutes(app);
CampaignRoutes(app);
RuleRoute(app);
const getOrders = async () => {
  try {
    // Thực hiện yêu cầu HTTP sử dụng axios
    await axios
      .get(`https://ecoopglobal.mysapo.net/admin/orders.json`, {
        auth: {
          username: "9059b72869d54094aae39f7c7800ac33", // API Key
          password: "09a67961520b42af90723498e5e512fe", // API Secret
        },
      })
      .then((response) => {
        let orders = response.data.orders;
        orders.forEach((order) => {
          const {
            id,
            financial_status,
            fulfillment_status,
            status,
            total_price,
            landing_site,
          } = order;

          if (
            financial_status === "paid" &&
            fulfillment_status === "fulfilled" &&
            status === "open" &&
            (landing_site !== "" || !landing_site)
          ) {
            pool.query(
              WebhookModal.ServiceWebhook.checkIdSapo,
              [id],
              (err, data) => {
                if (err) {
                  throw err;
                }
                if (data.length > 0) {
                } else {
                  pool.query(
                    WebhookModal.ServiceWebhook.insertOrder,
                    [
                      id,
                      financial_status,
                      fulfillment_status,
                      status,
                      total_price,
                      landing_site,
                    ],
                    (err, data) => {
                      if (err) {
                        throw err;
                      }
                      if (data) {
                        pool.query(
                          WebhookModal.ServiceWebhook.checkIdSapo,
                          [id],
                          (err, data) => {
                            if (data.length > 0) {
                              const bwaf = data[0].referral_link; // Giả sử cột chứa dữ liệu là 'bwaf'
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
                                      throw err;
                                    }
                                    if (data.length > 0) {
                                      let new_commission =
                                        data[0].total_withdrawn + precent_tax;
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
                                  WebhookModal.ServiceWebhook.checkPayment,
                                  [secondNumber],
                                  (err, data) => {
                                    if (err) {
                                      throw err;
                                    }
                                    if (data.length > 0) {
                                      let new_commission =
                                        data[0].total_withdrawn + precent_tax;
                                      pool.query(
                                        WebhookModal.ServiceWebhook
                                          .updatePayment,
                                        [new_commission, secondNumber],
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
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        });
      });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching orders:", error);
  }
};
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
setInterval(() => {
  getOrders();
}, 10000);
server.listen(port, (err) => {
  if (err) {
    throw err;
  } else {
    console.log("server is running on the port " + port);
  }
});
