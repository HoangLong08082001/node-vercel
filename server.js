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
const ProductRoutes = require("./API/Product/ProductRoutes.js");
const OrdersRoutes = require("./API/Orders/OrdersRoutes.js");
const moment = require("moment/moment.js");
const getOrders = require("./OrdersRealTime/getOrders.js");
const PaymentRoutes = require("./API/Payment/PaymentRoutes.js");
const CommissionRoutes = require("./API/Commission/CommissionRoutes.js");
const NotificationSystemRoutes = require("./API/NotificationSytem/NotificationSystemRoutes.js");
const TaxRoutes = require("./API/Tax/TaxRoutes.js");
const DashboardRoutes = require("./API/Dashboard/DashboardRoutes.js");
const getProducts = require("./ProductsRealTime/ProductsRealTime.js");
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

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
const corsOptions = {
  origin: "*",
  methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
  allowedHeaders: ["Authorization", "Content-Type"],
};

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
OrdersRoutes(app);
PaymentRoutes(app);
ProductRoutes(app);
CommissionRoutes(app);
NotificationSystemRoutes(app);
TaxRoutes(app);
DashboardRoutes(app);
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

app.get("/logs", (req, res) => {
  const logFilePath = path.join(__dirname, "info.log");
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      try {
        const logsLine = data.split("\n").filter((line) => line.trim() !== "");
        const logObject = logsLine.map((item) => JSON.parse(item));
        return res.status(200).json(logObject);
      } catch (error) {
        return res.status(500).json({ message: "fails" });
      }
    }
  });
});

setInterval(() => {
  getOrders();
  getProducts();
}, 10000);
server.listen(port, (err) => {
  if (err) {
    throw err;
  } else {
    console.log("server load balancing is running on the port " + port);
  }
});
