const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const useragent = require("useragent");
const morgan = require("morgan");
const cors = require("cors");
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

dotenv.config();
const app = express();
const server = http.createServer(app); // Tạo server trước khi tạo WebSocket server
const wss = new WebSocket.Server({ server });

const port = process.env.PORT_SERVER || 4000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const targetServers = [
  "http://192.168.1.71:3031",
  "http://192.168.1.71:3032",
  "http://192.168.1.71:3033",
];
let currentIndex = 0;

const getNextServer = () => {
  const server = targetServers[currentIndex];
  currentIndex = (currentIndex + 1) % targetServers.length;
  return server;
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

  const newLogMessages = {
    name: req.app.get("name"),
    status: res.statusCode,
    date: getVNDateTime(new Date()),
    method: req.method,
    api: req.url,
    ip: ip,
    os: os,
  };
  arrayLog.push(newLogMessages);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(newLogMessages));
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

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.use((req, res, next) => {
  const target = getNextServer();
  createProxyMiddleware({
    target: target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request to: ${target}`);
    },
  })(req, res, next);
});

server.listen(port, (err) => {
  if (err) {
    throw err;
  } else {
    console.log("server load balancing is running on the port " + port);
  }
});
