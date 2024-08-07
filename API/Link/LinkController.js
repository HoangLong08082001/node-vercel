const pool = require("../../config/database");
const LinkService = require("./LinkModal");
function getCurrentDateInVietnam() {
  // Tạo một đối tượng Date mới đại diện cho thời gian hiện tại UTC
  const now = new Date();

  // Lấy giờ UTC hiện tại
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth(); // Tháng từ 0-11
  const utcDate = now.getUTCDate();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();

  // Múi giờ Việt Nam là UTC+7, thêm 7 giờ vào giờ UTC
  const vietnamOffset = 7;
  const vietnamTime = new Date(
    Date.UTC(utcYear, utcMonth, utcDate, utcHours + vietnamOffset, utcMinutes)
  );

  // Lấy các phần của ngày hiện tại theo múi giờ Việt Nam
  const year = vietnamTime.getFullYear();
  const month = String(vietnamTime.getMonth() + 1).padStart(2, "0"); // Tháng từ 0-11 nên cần +1
  const day = String(vietnamTime.getDate()).padStart(2, "0");

  // Kết hợp các phần thành chuỗi định dạng "yyyy-mm-dd"
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
}
function getCurrentTimeFormatted() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

const getLink = (req, res) => {
  try {
    pool.query(LinkService.getAllLink(), [], (err, data) => {
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

const updateLinks = (req, res) => {
  let id_link = req.body.id_link;
  let url = req.body.url;
  try {
    pool.query(LinkService.checkExistLinks(), [id_link], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        pool.query(
          LinkService.updateLink(),
          [url, getCurrentDateInVietnam(), getCurrentTimeFormatted(), id_link],
          (err, data) => {
            if ((err, data)) {
              if (err) {
                throw err;
              }
              if (data) {
                return res.status(200).json({ message: "success" });
              }
            }
          }
        );
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const addLinks = (req, res) => {
  let url = req.body.url;
  try {
    pool.query(LinkService.checkExistAddLink(), [url], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        return res
          .status(400)
          .json({ message: "Link website này đã tồn tại, Vui lòng thử lại" });
      } else {
        pool.query(
          LinkService.addLink(),
          [url, getCurrentDateInVietnam(), getCurrentTimeFormatted()],
          (err, data) => {
            if (err) {
              throw err;
            }
            if (data) {
              return res.status(200).json({ message: "success" });
            }
          }
        );
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const getFirstLink = (req, res) => {
  try {
    pool.query(LinkService.getNewLink(), [], (err, data) => {
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
module.exports = { getLink, updateLinks, addLinks, getFirstLink };
