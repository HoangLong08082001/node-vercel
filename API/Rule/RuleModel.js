class RuleService {
  static GetRule = "SELECT * FROM rule";
  static CreateRule = "INSERT INTO rule (rule) VALUES (?)";
  static updateRule = "UPDATE rule SET rule= ? WHERE id_rule = ?";
  static deleteRule = "DELETE FROM rule WHERE id_rule IN (?)";
}

module.exports = { RuleService };
