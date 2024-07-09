class ServiceDepartment {
  static checkExists() {
    return "SELECT * FROM department WHERE name_department=?";
  }
  static create() {
    return "INSERT INTO department (name_department) VALUES (?)";
  }
  static all() {
    return "SELECT * FROM department";
  }
  static allRule() {
    return "SELECT * FROM rule WHERE";
  }
  static checkDepartment() {
    return "SELECT department_rule.id_rule FROM department_rule WHERE id_department = ?";
  }
  static insertRuleDepartment() {
    return "INSERT INTO department_rule (id_department, id_rule) VALUES (?)";
  }
  static removeRuleDepartment() {
    return "DELETE FROM department_rule WHERE id_department = ? AND id_rule IN (?)";
  }
  static queryDepartmentWithRule() {
    return "SELECT department.id_department, department.name_department, rule.id_rule, rule.rule FROM department LEFT JOIN department_rule ON department.id_department = department_rule.id_department LEFT JOIN rule ON department_rule.id_rule = rule.id_rule";
  }
  static getCurrentPermissionsQuery() {
    return "SELECT id_rule FROM department_rule WHERE id_department = ?";
  }
  static addPermissionsQuery() {
    return "INSERT INTO department_rule (id_department, id_rule) VALUES ?";
  }static removePermissionQuery(){
    return "DELETE FROM department_rule WHERE id_department = ? AND id_rule IN (?)";
  }
}

module.exports = { ServiceDepartment };
