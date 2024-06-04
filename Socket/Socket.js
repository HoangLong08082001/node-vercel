const { default: axios } = require("axios");

class ConfigSocketIo {
  static getExternalData = () => {
    socket.on("getExternalData", async () => {
      try {
        const response = await axios.get(
          "https://globalecoop.mysapo.net/admin/orders.json",
          {
            auth: {
              username: "2d98b5701e7c4732a2f3fc3eee3b1dd2", // API Key
              password: "743614a557f143cabc09d952f581c154",
            },
          }
        );
        socket.emit("externalData", response.data);
      } catch (error) {
        console.error("Error fetching external data:", error);
      }
    });
  };
}
module.exports = { ConfigSocketIo };
