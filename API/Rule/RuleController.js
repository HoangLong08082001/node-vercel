const pool = require("../../config/database.js");

const { ServiceRule } = require("./RuleModel.js");

const GetRule = (req, res) => {
  try {
    pool.query(ServiceRule.GetRule, (err, data) => {
      if (err) {
        console.log(err);
        throw err;
      }
      if (data) {
        return res.status(200).json({
          message: "success",
          data,
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};
const CraeteRule = (req, res) => {
  try {
    let rule = req.body.rule;
    pool.query(ServiceRule.CreateRule, [rule], (err, result) => {
      if (err) {
        console.log(err);
        throw err;
      }
      if (result) {
        console.log(result);
        return res.status(200).json({ message: "Rule craeted successfully" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};
const UpdateRule = (req, res) => {
  try {
    let id_rule = req.body.id_rule;
    let rule = req.body.rule;
    // Thực hiện truy vấn cập nhật
    pool.query(ServiceRule.UpdateRule, [rule, id_rule], (err, result) => {
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

const DeleteRule = (req, res) => {
  try {
    let id_rule = req.body.id_rule;
    // res.status(200).json({ data: id_rule });
    pool.query(ServiceRule.DeleteRule, [id_rule], (err, result) => {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log("Rule updated:", result);
      return res.status(200).json({ message: "Rule deleting successfully" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};

module.exports = {
  GetRule,
  CraeteRule,
  UpdateRule,
  DeleteRule,
};
