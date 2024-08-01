const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");
const express = require("express");
const { authenticationToken } = require("../middleware/JwtAction");
const router = express.Router();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://ecooptest-76244-default-rtdb.asia-southeast1.firebasedatabase.app",
});
const db = admin.database();
const ref = db.ref("notification");

const formatDate1 = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
function getCurrentTimeFormatted() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
async function setItem(titleNotification, bodyText) {
  const newItem = {
    title: titleNotification,
    text: bodyText,
    date: formatDate1(new Date()),
    time: getCurrentTimeFormatted(),
  };
  await ref
    .push(newItem)
    .then(() => {})
    .catch((error) => {
      console.error("Có lỗi xảy ra:", error);
    });
}
function RouterFirebase(app) {
  app.post("/store-token", async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).send("Token is required");
    }
    try {
      // Lưu token vào Firebase Realtime Database
      const tokenRef = admin.database().ref("/tokens").push();
      await tokenRef.set(token);
      console.log("Token stored successfully");
      res.status(200).send("Token stored successfully");
    } catch (error) {
      console.error("Error storing token:", error);
      res.status(500).send("Error storing token: " + error.message);
    }
  });
  app.get("/firebase/data", (req, res) => {
    db.ref("/notification")
      .once("value")
      .then((snapshot) => {
        const data = snapshot.val();
        const resultArray = Object.values(data);

        // Chuyển đổi mảng thành chuỗi JSON
        const resultString = JSON.stringify(resultArray, null, 2);
        const jsonArray = JSON.parse(resultString);
        return res.status(200).json(jsonArray);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  });
}

// Hàm để gửi thông báo đến tất cả các token đã lưu
async function sendNotificationToAll(title, body) {
  const tokensSnapshot = await admin.database().ref("/tokens").once("value");
  const tokens = tokensSnapshot.val();
  if (!tokens) {
    return;
  }
  const tokenList = Object.values(tokens);
  const message = {
    notification: { title, body },
    tokens: tokenList,
  };
  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {})
    .catch((error) => {
      console.error("Error sending message:", error);
    });
}

module.exports = { sendNotificationToAll, RouterFirebase, setItem };
