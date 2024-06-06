class ServiceEmployee {
  static create =
    "INSERT INTO employee (id_department, username, password, phone, status) VALUES (?,?,?,?,?)";
  static checkEmail = "SELECT * FROM employee WHERE username=?";
  static checkLogin = "SELECT * FROM employee WHERE username=? OR phone=?";
  static checkPermission =
    "SELECT department.name_department, rule.rule, employee.username, employee.phone, employee.status FROM department_rule left join department on department_rule.id_department=department.id_department left join rule on department_rule.id_rule = rule.id_rule left join employee on employee.id_department=department.id_department WHERE employee.username=?";
  static getAll = "SELECT * FROM employee";
}
module.exports = { ServiceEmployee };
