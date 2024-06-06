class ServiceDepartment {
  static checkExists = "SELECT * FROM department WHERE name_department=?";
  static create = "INSERT INTO department (name_department) VALUES (?)";
  static all = "SELECT * FROM department"
}

module.exports = { ServiceDepartment };
