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

const checkPermission = (req, res) => {
  const { ids_department, ids_rule } = req.body;
  console.log(ids_department + " " + ids_rule);

  if (!ids_department || !Array.isArray(ids_rule)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // Convert quyenList to an array of quyen ids
  const quyenIds = ids_rule.map((quyen) => quyen);

  // Query to get current permissions for the given id_phongban
  const getCurrentPermissionsQuery =
    "SELECT id_rule FROM department_rule WHERE id_department = ?";
  pool.query(getCurrentPermissionsQuery, [ids_department], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const currentPermissions = results.map((row) => row.id_rule);

    // Determine which permissions to add and which to remove
    const permissionsToAdd = quyenIds.filter(
      (id) => !currentPermissions.includes(id)
    );
    const permissionsToRemove = currentPermissions.filter(
      (id) => !quyenIds.includes(id)
    );

    // Add new permissions
    if (permissionsToAdd.length > 0) {
      const addPermissionsQuery =
        "INSERT INTO department_rule (id_department, id_rule) VALUES ?";
      const valuesToAdd = permissionsToAdd.map((id) => [ids_department, id]);
      pool.query(addPermissionsQuery, [valuesToAdd], (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
      });
    }

    // Remove old permissions
    if (permissionsToRemove.length > 0) {
      const removePermissionsQuery =
        "DELETE FROM department_rule WHERE id_department = ? AND id_rule IN (?)";
      pool.query(
        removePermissionsQuery,
        [ids_department, permissionsToRemove],
        (err, results) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
        }
      );
    }

    res.status(200).json({ message: "Permissions updated successfully" });
  });
};

module.exports = {
  createDepartment,
  getAlDepartment,
  getDepartmentWithRule,
  checkPermission,
};
