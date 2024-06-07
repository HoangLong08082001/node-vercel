const pool = require("../../config/database.js");
const { ServiceDepartment } = require("./DepartmentModal.js");

const createDepartment = (req, res) => {
  let name = req.body.name;
  pool.query(ServiceDepartment.checkExists, [name], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      return res
        .status(400)
        .json({ message: "Bộ phận này đã tồn tại trong hệ thống" });
    } else {
      pool.query(ServiceDepartment.create, [name], (err, data) => {
        if (err) {
          throw err;
        }
        if (data) {
          return res.status(200).json({ message: "success" });
        }
      });
    }
  });
};

const getDepartmentWithRule = (req, res) => {
  try {
    pool.query(
      "SELECT department.id_department, department.name_department, rule.id_rule, rule.rule FROM department LEFT JOIN department_rule ON department.id_department = department_rule.id_department LEFT JOIN rule ON department_rule.id_rule = rule.id_rule",
      [],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data) {
          console.log(data);
          const departments = [];
          data.forEach((row) => {
            const { id_department, id_rule, rule, name_department } = row;
            let department = departments.find((c) => c.id === id_department);
            if (!department) {
              department = {
                id: id_department,
                name_department: name_department,
                rules: [],
              };
              departments.push(department);
            }
            {
              id_rule === null && rule === null
                ? []
                : department.rules.push({
                    id_rule: id_rule,
                    rule: rule,
                  });
            }
          });
          return res.status(200).json(departments);
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const getAlDepartment = (req, res) => {
  try {
    pool.query(ServiceDepartment.all, [], (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        return res.status(200).json(data);
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

module.exports = { createDepartment, getAlDepartment, getDepartmentWithRule };
