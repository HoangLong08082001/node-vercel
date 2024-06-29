class ServiceEmployee {
  static create =
    "INSERT INTO employee (id_department, name, username, phone, status, date_create) VALUES (?,?,?,?,?,?)";
  static checkEmail = "SELECT * FROM employee WHERE username=?";
  static checkLogin = "SELECT * FROM employee WHERE username=? OR phone=?";
  static checkPermission =
    "SELECT department.name_department, rule.rule, employee.username, employee.phone, employee.status, employee.name FROM department_rule left join department on department_rule.id_department=department.id_department left join rule on department_rule.id_rule = rule.id_rule left join employee on employee.id_department=department.id_department WHERE employee.username=?";
  static getAll =
    "SELECT * FROM employee join department on employee.id_department=department.id_department";
  static rePass = "UPDATE employee SET password=? WHERE username=?";
  static checkUsernamePassword =
    "SELECT * FROM employee WHERE employee.username=?";
  static rePassword =
    "UPDATE employee SET password=? WHERE employee.username=?";
  static updateStatusFalse =
    "UPDATE employee SET status = 0 WHERE id_employee IN (?)";
  static updateStatusTrue =
    "UPDATE employee SET status = 1 WHERE id_employee IN (?)";
  static checkStatus =
    "SELECT * FROM employee WHERE id_employee IN (?) AND status = 0";
  static updatePassword = "UPDATE employee SET password=? WHERE username=?";
  static updateEmail =
    "UPDATE employee SET username=?, phone=?, name=? WHERE username=?";
  static checkUsernamePhone =
    "SELECT * FROM employee WHERE username=? AND phone=?";
  static updatePhone = "UPDATE employee SET phone = ? WHERE username = ?";
  static updateName = "UPDATE employee SET name = ? WHERE username = ?";
  static updateNamePhone =
    "UPDATE employee SET name = ?, phone = ? WHERE username = ?";
  static updateEmail = "UPDATE employee SET username = ? WHERE username = ?";
  static updateEmailPhone =
    "UPDATE employee SET username = ?, phone = ? WHERE username = ?";
  static updateEmailName =
    "UPDATE employee SET username = ?, name = ? WHERE username = ?";
  static updateEmailNamePhone =
    "UPDATE employee SET username = ?, name = ?, phone = ? WHERE username = ?";
}
module.exports = { ServiceEmployee };
