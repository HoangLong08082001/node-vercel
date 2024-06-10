class ServiceDepartment {
  static checkExists = "SELECT * FROM department WHERE name_department=?";
  static create = "INSERT INTO department (name_department) VALUES (?)";
  static all = "SELECT * FROM department";
  static allRule = "SELECT * FROM rule WHERE";
  static checkDepartment =
    "SELECT department_rule.id_rule FROM department_rule WHERE id_department = ?";
  static insertRuleDepartment =
    "INSERT INTO department_rule (id_department, id_rule) VALUES (?)";
  static removeRuleDepartment =
    "DELETE FROM department_rule WHERE id_department = ? AND id_rule IN (?)";
}

module.exports = { ServiceDepartment };
