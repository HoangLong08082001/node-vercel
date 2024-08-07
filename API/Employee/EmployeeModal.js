class ServiceEmployee {
  static create() {
    return "INSERT INTO employee (id_department, name, username, phone, status, date_create) VALUES (?,?,?,?,?,?)";
  }
  static checkEmail() {
    return "SELECT * FROM employee WHERE username=?";
  }
  static checkLogin() {
    return "SELECT * FROM employee WHERE username=? OR phone=?";
  }
  static checkPermission() {
    return "SELECT department.name_department, rule.rule, employee.username, employee.phone, employee.status, employee.name FROM department_rule left join department on department_rule.id_department=department.id_department left join rule on department_rule.id_rule = rule.id_rule left join employee on employee.id_department=department.id_department WHERE employee.username=?";
  }
  static getAll() {
    return "SELECT * FROM employee join department on employee.id_department=department.id_department";
  }
  static rePass() {
    return "UPDATE employee SET password=? WHERE username=?";
  }
  static checkUsernamePassword() {
    return "SELECT * FROM employee WHERE employee.username=?";
  }
  static rePassword() {
    return "UPDATE employee SET password=? WHERE employee.username=?";
  }
  static updateStatusFalse() {
    return "UPDATE employee SET status = 0 WHERE id_employee IN (?)";
  }
  static updateStatusTrue() {
    return "UPDATE employee SET status = 1 WHERE id_employee IN (?)";
  }
  static checkStatus() {
    return "SELECT * FROM employee WHERE id_employee IN (?) AND status = 0";
  }
  static updatePassword() {
    return "UPDATE employee SET password=? WHERE username=?";
  }
  static updateEmail() {
    return "UPDATE employee SET username=?, phone=?, name=? WHERE username=?";
  }
  static checkUsernamePhone() {
    return "SELECT * FROM employee WHERE username=? AND phone=?";
  }
  static updatePhone() {
    return "UPDATE employee SET phone = ? WHERE username = ?";
  }
  static updateName() {
    return "UPDATE employee SET name = ? WHERE username = ?";
  }
  static updateNamePhone() {
    return "UPDATE employee SET name = ?, phone = ? WHERE username = ?";
  }
  static updateEmail() {
    return "UPDATE employee SET username = ? WHERE username = ?";
  }
  static updateEmailPhone() {
    return "UPDATE employee SET username = ?, phone = ? WHERE username = ?";
  }
  static updateEmailName() {
    return "UPDATE employee SET username = ?, name = ? WHERE username = ?";
  }
  static updateEmailNamePhone() {
    return "UPDATE employee SET username = ?, name = ?, phone = ? WHERE username = ?";
  }
}
module.exports = { ServiceEmployee };
