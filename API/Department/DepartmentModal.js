class ServiceDepartment {
  static checkExists = "SELECT * FROM department WHERE name_department=?";
  static create = "INSERT INTO department (name_department) VALUES (?)";
  static all = "SELECT * FROM department"
  static allRule = "SELECT * FROM rule WHERE"
}

module.exports = { ServiceDepartment };
