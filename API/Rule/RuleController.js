const pool = require("../../config/database.js");

const { RuleService } = require("./RuleModel.js");
const GetRule = (req, res) => {
  try {
    pool.query(RuleService.GetRule(), [], (err, data) => {
      if (err) {
        console.log(err);
        throw err;
      }
      if (data) {
        console.log(data);
        return res.status(200).json(data);
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};
const CraeteRule = (req, res, io) => {
  let rule = req.body.rule;
  try {
    pool.query(RuleService.CreateRule(), [rule], (err, result) => {
      if (err) {
        console.log(err);
        throw err;
      }
      if (result) {
        console.log(result);
        return res.status(200).json({ message: "success" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};
const UpdateRule = (req, res) => {
  let id_rule = req.body.id_rule;
  let rule = req.body.rule;
  console.log(id_rule + " " + rule);
  try {
    // Thực hiện truy vấn cập nhật
    pool.query(RuleService.updateRule(), [rule, id_rule], (err, result) => {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log("Rule updated:", result);
      return res.status(200).json({ message: "rule updated successfully" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};

// Check lai
const DeleteRule = (req, res) => {
  let id_rule = req.body.id_rule;
  console.log(id_rule);
  // try {
  //   // res.status(200).json({ data: id_rule });
  //   pool.query(RuleService.DeleteRule, [id_rule], (err, result) => {
  //     if (err) {
  //       console.log(err);
  //       throw err;
  //     }
  //     console.log("Rule updated:", result);
  //     return res.status(200).json({ message: "Rule deleting successfully" });
  //   });
  // } catch (error) {
  //   console.error(error);
  //   return res.status(500).json({ message: "fails" });
  // }
};
const handleBlock = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(RuleService.checkStatus(), [id], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        if (data[0].status === 0) {
          pool.query(RuleService.handleUnlock(), [id], (err, data) => {
            if (err) {
              throw err;
            }
            if (data) {
              return res.status(200).json({ message: "success" });
            }
          });
        }
        if (data[0].status === 1) {
          pool.query(RuleService.handleLock(), [id], (err, data) => {
            if (err) {
              throw err;
            }
            if (data) {
              return res.status(200).json({ message: "success" });
            }
          });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Không thể thay đổi trạng thái" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};
module.exports = {
  GetRule,
  CraeteRule,
  UpdateRule,
  DeleteRule,
  handleBlock,
};
