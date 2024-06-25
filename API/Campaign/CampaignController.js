const pool = require("../../config/database.js");
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
  console.log(link);
  console.log(name);
  console.log(commission);
  console.log(description);
  console.log(date_start);
  console.log(date_end);
  console.log(image);
  try {
    if (!name || !commission || !description || !date_start || !date_end) {
      return res.status(400).json({ message: "Vui lòng không để trống" });
    } else {
      pool.query(
        ServiceCampaign.create,
        [
          image,
          "https://ecoopglobalvn.mysapo.net/",
          name,
          commission,
          description,
          date_start,
          date_end,
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
    }
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
const deleteCampaign = (req, res) => {
  return res.send("Delete");
};

const getAllCampaign = (req, res) => {
  pool.query(
    "SELECT campaign.id_campaign, campaign.name_campaign, products.id_products, products.id_products_sapo, campaign.link_product, products.alias, campaign.description, campaign.date_start, campaign.date_end, campaign.commission, campaign.image FROM campaign LEFT JOIN campaign_products ON campaign.id_campaign = campaign_products.id_campaign LEFT JOIN products ON campaign_products.id_products = products.id_products",
    [],
    (err, data) => {
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
            alias,
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
              products: [],
            };
          }
          if (id_products) {
            acc[id_campaign].products.push({
              id: id_products,
              id_sapo: id_products_sapo,
              alias: link_product + alias,
            });
          }
          return acc;
        }, {});

        return res.status(200).json(Object.values(campaigns));
        // return res.status(200).json(data);
        //return res.status(200).json({ message: "success", data: campaigns });
      }
    }
  );
};

const addProductToCampaign = (req, res, next) => {
  const { ids_campaign, ids_product } = req.body;
  console.log(ids_campaign);
  console.log(ids_product);
  if (!ids_campaign || !Array.isArray(ids_product)) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const productIds = ids_product.map((product) => product);
  const getCurrentCampaignProductQuery =
    "SELECT id_products FROM campaign_products WHERE id_campaign = ?";
  pool.query(getCurrentCampaignProductQuery, [ids_campaign], (err, data) => {
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
        const addProductsQuery =
          "INSERT INTO campaign_products (id_campaign, id_products) VALUES ?";
        const valuesToAdd = AdProductsToCampaign.map((id) => [
          ids_campaign,
          id,
        ]);
        pool.query(addProductsQuery, [valuesToAdd], (err, result) => {
          if (err) {
            throw err;
          }
        });
      }
      if (productsToRemove.length > 0) {
        const removeProductsQuery =
          "DELETE FROM campaign_products WHERE id_campaign = ? AND id_products IN (?)";
        pool.query(
          removeProductsQuery,
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

module.exports = {
  createCampaign,
  deleteCampaign,
  getAllCampaign,
  addProductToCampaign,
};
