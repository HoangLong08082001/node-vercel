class Rule {
  static GetRule = "SELECT * FROM rule";
  static CreateRule = "INSERT INTO rule (rule) VALUES (?)";
  static UpdateRule = "UPDATE rule SET rule= ? WHERE id_rule = ?";
  static DeleteRule = "DELETE FROM rule WHERE id_rule = ?";
}

module.exports = Rule;
