const pool = require("../../config/database");
const BannerService = require("./BannerModal");
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

const getBanners = (req, res) => {
  try {
    pool.query(BannerService.getAllBanner(), [], (err, data) => {
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

const addBanners = (req, res) => {
  let image = req.body.image;
  let link_website = req.body.link_website;
  try {
    pool.query(
      BannerService.addNewBanner(),
      [
        image,
        link_website,
        0,
        getCurrentDateInVietnam(),
        getCurrentTimeFormatted(),
      ],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data) {
          return res.status(200).json({ message: "success" });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const updateBanners = (req, res) => {
  let image = req.body.image;
  let link_website = req.body.link_website;
  let id_banner = req.body.id_banner;
  try {
    pool.query(
      BannerService.checkExistsBanner(),
      [link_website, id_banner],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          return res
            .status(400)
            .json({ message: "Link banner đã tồn tại, Vui lòng thử lại" });
        } else {
          pool.query(
            BannerService.updateBanner(),
            [image, link_website, id_banner],
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
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const blockBanner = (req, res) => {
  let id_banner = req.body.id_banner;
  try {
    pool.query(BannerService.checkIdBanner(), [id_banner], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        pool.query(BannerService.updateTrue(), [id_banner], (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            return res.status(200).json({ message: "success" });
          }
        });
      } else {
        pool.query(BannerService.updateFalse(), [id_banner], (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            return res.status(200).json({ message: "success" });
          }
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

module.exports = { getBanners, addBanners, updateBanners, blockBanner };
