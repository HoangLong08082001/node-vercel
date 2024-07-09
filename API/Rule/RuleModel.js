class RuleService {
  static GetRule() {
    return "SELECT * FROM rule";
  }
  static CreateRule() {
    return "INSERT INTO rule (rule) VALUES (?)";
  }
  static updateRule() {
    return "UPDATE rule SET rule= ? WHERE id_rule = ?";
  }
  static deleteRule() {
    return "DELETE FROM rule WHERE id_rule IN (?)";
  }
}

module.exports = { RuleService };
