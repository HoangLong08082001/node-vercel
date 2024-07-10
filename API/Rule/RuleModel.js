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
  static checkStatus() {
    return "SELECT * FROM rule WHERE id_rule=?";
  }
  static handleLock() {
    return "UPDATE rule SET status = 0 WHERE id_rule=?";
  }
  static handleUnlock() {
    return "UPDATE rule SET status = 1 WHERE id_rule=?";
  }
}

module.exports = { RuleService };
