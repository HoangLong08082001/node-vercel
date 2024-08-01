const pool = require("../../config/database.js");
const {
  setItem,
  sendNotificationToAll,
} = require("../../config/sendNotification.js");
const { ServiceCampaign } = require("./CampaignModal.js");

//id_collaborator	id_orders	link_product	name_campaign	personal_tax	affiliate_tax	description	date_start	date_end
const createCampaign = (req, res) => {
  function formatDate(inputDate) {
    // Tạo đối tượng Date từ chuỗi input
    const date = new Date(inputDate);

    // Trích xuất năm, tháng, ngày
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0 nên cần +1
    const day = String(date.getDate()).padStart(2, "0");

    // Định dạng chuỗi ngày giờ theo yêu cầu
    const formattedDate = `${year}-${month}-${day} 00:00:00`;

    return formattedDate;
  }
  let link = req.body.link;
  let name = req.body.name;
  let commission = req.body.commission;
  let description = req.body.description;
  let date_start = formatDate(req.body.date_start);
  let date_end = formatDate(req.body.date_end);
  let image = req.body.image;
  try {
    if (!name || !commission || !description || !date_start || !date_end) {
      return res.status(400).json({ message: "Vui lòng không để trống" });
    } else {
      pool.query(
        ServiceCampaign.create(),
        [
          image,
          "https://test-website-affiliate.mysapo.net/",
          name,
          commission,
          description,
          date_start,
          date_end,
          0,
        ],
        (err, data) => {
          if (err) {
            throw err;
          }
          if (data) {
            setItem(
              "Thông báo chiến dịch",
              `Chiến dịch mới, ${name} vừa được tạo. Hãy tham gia ngay`
            );
            sendNotificationToAll(
              "Thông báo chiến dịch",
              `Chiến dịch mới, ${name} vừa được tạo. Hãy tham gia ngay`
            );
            return res.status(200).json({ message: "success" });
          }
        }
      );
    }
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
const deleteCampaign = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(ServiceCampaign.checkCampaign(), [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        pool.query(
          ServiceCampaign.checkDeleteCampaign(),
          [id, id, id],
          (err, data) => {
            if (err) {
              throw err;
            }
            if (data.length > 0) {
              return res.status(400).json({ message: "fails" });
            } else {
              pool.query(
                ServiceCampaign.deleteCampaign(),
                [id],
                (err, data) => {
                  if (err) {
                    return res.status(400).json({ message: "fails" });
                  }
                  if (data) {
                    return res.status(200).json({ message: "success" });
                  } else {
                    return res.status(400).json({ message: "fails" });
                  }
                }
              );
            }
          }
        );
      } else {
        return res.status(400).json({ message: "fails" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const getAllCampaign = (req, res) => {
  pool.query(ServiceCampaign.getCampaignWithProduct(), [], (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      // const campaigns = [];

      // data.forEach((row) => {
      //   const {
      //     id_campaign,
      //     name_campaign,
      //     id_products_sapo,
      //     link_product,
      //     alias,
      //     description,
      //     date_start,
      //     date_end,
      //     commission,
      //   } = row;

      //   // Tìm chiến dịch hiện tại trong mảng
      //   let campaign = campaigns.find((c) => c.id === id_campaign);

      //   // Nếu chiến dịch chưa tồn tại trong mảng, thêm vào
      //   if (!campaign) {
      //     campaign = {
      //       id: id_campaign,
      //       name: name_campaign,
      //       tax: commission,
      //       description: description,
      //       start: date_start,
      //       end: date_end,
      //       url: link_product,
      //       products: [],
      //     };
      //     campaigns.push(campaign);
      //   }

      //   // Thêm sản phẩm vào danh sách sản phẩm của chiến dịch
      //   if (id_products_sapo) {
      //     campaign.products.push({
      //       id: id_products_sapo,
      //       alias: link_product + alias,
      //     });
      //   } else {
      //   }
      // });
      const campaigns = data.reduce((acc, row) => {
        const {
          id_campaign,
          id_products,
          id_products_sapo,
          name_campaign,
          commission,
          description,
          date_start,
          date_end,
          link_product,
          image,
          image_product,
          alias,
          name_product,
          count_collaborator,
        } = row;
        if (!acc[id_campaign]) {
          acc[id_campaign] = {
            id: id_campaign,
            name: name_campaign,
            tax: commission,
            image: image,
            description: description,
            start: date_start,
            end: date_end,
            url: link_product,
            count: count_collaborator,
            products: [],
          };
        }
        if (id_products) {
          acc[id_campaign].products.push({
            id: id_products,
            id_sapo: id_products_sapo,
            alias: link_product + alias,
            image_product: image_product,
            name_product: name_product,
          });
        }
        return acc;
      }, {});

      return res.status(200).json(Object.values(campaigns));
      // return res.status(200).json(data);
      //return res.status(200).json({ message: "success", data: campaigns });
    }
  });
};

const addProductToCampaign = (req, res, next) => {
  const { ids_campaign, ids_product } = req.body;
  if (!ids_campaign || !Array.isArray(ids_product)) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const productIds = ids_product.map((product) => product);
  pool.query(ServiceCampaign.getCampaignById(), [ids_campaign], (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      const currentProducts = data.map((row) => row.id_products);
      const AdProductsToCampaign = productIds.filter(
        (id) => !currentProducts.includes(id)
      );
      const productsToRemove = currentProducts.filter(
        (id) => !productIds.includes(id)
      );
      if (AdProductsToCampaign.length > 0) {
        const valuesToAdd = AdProductsToCampaign.map((id) => [
          ids_campaign,
          id,
        ]);
        pool.query(
          ServiceCampaign.addProductIntoCampaign(),
          [valuesToAdd],
          (err, result) => {
            if (err) {
              throw err;
            }
          }
        );
      }
      if (productsToRemove.length > 0) {
        const removeProductsQuery =
          "DELETE FROM campaign_products WHERE id_campaign = ? AND id_products IN (?)";
        pool.query(
          ServiceCampaign.deleteCampaignByIdCamAndProduct,
          [ids_campaign, productsToRemove],
          (err, result) => {
            if (err) {
              throw err;
            }
          }
        );
      }
      res.status(200).json({ message: "updated success" });
    }
  });
};
const blockCampaign = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(ServiceCampaign.checkStatus(), [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        if (data[0].status === 1) {
          pool.query(ServiceCampaign.handleLock(), [id], (err, data) => {
            if (err) {
              throw err;
            }
            if (data) {
              return res.status(200).json({ message: "success" });
            }
          });
        }
        if (data[0].status === 0) {
          pool.query(ServiceCampaign.handleUnlock(), [id], (err, data) => {
            if (err) {
              throw err;
            }
            if (data) {
              return res.status(200).json({ message: "success" });
            }
          });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
const getTagsProducts = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(
      "SELECT products.id_products, products.type_products FROM products join campaign_products on products.id_products = campaign_products.id_products join campaign on campaign_products.id_campaign = campaign.id_campaign WHERE campaign.id_campaign = ?;",
      [id],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          return res.status(200).json(data);
        } else {
          return res.status(200).json([]);
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
const addCampaignCollaborator = (req, res) => {
  let id_campaign = req.body.id_campaign;
  let id_collaborator = req.body.id_collaborator;
  try {
    pool.query(
      "SELECT * FROM collaborator_campaign WHERE id_collaborator = ?",
      [id_collaborator],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          return res.status(200).json({ message: "success" });
        } else {
          pool.query(
            "INSERT INTO collaborator_campaign (id_collaborator, id_campaign) VALUES (?,?)",
            [id_collaborator, id_campaign],
            (err, data) => {
              if (err) {
                throw err;
              }
              if (data) {
                setItem(
                  "Thông báo chiến dịch",
                  `Chiến dịch vừa có thêm cộng tác viên tham gia. Hãy cùng tham gia.`
                );
                sendNotificationToAll(
                  "Thông báo chiến dịch",
                  `Chiến dịch vừa có thêm cộng tác viên tham gia. Hãy cùng tham gia.`
                );
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

const countCollaboratorOnCampaign = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(
      "SELECT COUNT(collaborator_campaign.id_campaign) as count FROM collaborator_campaign WHERE collaborator_campaign.id_campaign = ?",
      [id],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          return res.status(200).json(data);
        } else {
          return res.start(200).json(0);
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
module.exports = {
  blockCampaign,
  createCampaign,
  deleteCampaign,
  getAllCampaign,
  addProductToCampaign,
  getTagsProducts,
  addCampaignCollaborator,
  countCollaboratorOnCampaign,
};
