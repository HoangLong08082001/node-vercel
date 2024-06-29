const pool = require("../../config/database.js");
const { TeamModal } = require("./TeanModal.js");

const createTeam = (req, res) => {
  try {
    let id_collaborator = req.body.id_collaborator;
    pool.query(
      TeamModal.alreadyExistsTeam,
      [id_collaborator],
      (err, result) => {
        if (err) {
          throw err;
        } else if (result.length > 0) {
          return res.status(200).json({ message: "exists" });
        } else {
          pool.query(
            TeamModal.create,
            [1, "https://ecoop.vn/"],
            (err, result) => {
              if (err) {
                console.error(err);
              }
              if (result) {
                let id = result.insertId;
                pool.query(
                  TeamModal.createManyToMany,
                  [id, id_collaborator],
                  (err, data) => {
                    if (err) {
                      console.log(err);
                      return res.status(200).json({ message: "fails" });
                    }
                    if (data) {
                      pool.query(TeamModal.checkQuantity, [id], (err, data) => {
                        if (err) {
                          console.error(err);
                        }
                        if (data) {
                          pool.query(
                            TeamModal.updateLeader,
                            [1, id_collaborator],
                            (err, data) => {
                              if (err) {
                                console.error(err);
                              }
                              if (data) {
                                return res
                                  .status(200)
                                  .json({ message: "success" });
                              }
                            }
                          );
                        }
                      });
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};

const joinTeam = (req, res) => {
  let id_collaborator = req.body.id_collaborator;
  let id_team = req.body.id_team;
  try {
    pool.query(TeamModal.checkTeam, [id_collaborator], (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 2) {
        return res.status(400).json({
          message: "Bạn đã tham gia đủ nhóm! Không thể tham gia vào nhóm",
        });
      } else {
        pool.query(
          TeamModal.join,
          [id_team, id_collaborator],
          (err, result) => {
            if (err) {
              throw err;
            }
            if (result) {
              return res.status(200).json({ message: "success" });
            }
          }
        );
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "fails" });
  }
};

const getAllTeam = (req, res) => {
  let email = req.params.id;
  let presenter_phone = null;
  let id_collaborator = null;
  let link_team = "";
  let quantity = "";
  let time_create = "";
  let id_team = "";
  let name_leader = "";
  let avatar_leader = "";
  try {
    pool.query(TeamModal.getCollaboratorTeam, [email], (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        if (
          !data[0].link_team &&
          !data[0].quantity &&
          !data[0].time_create &&
          !data[0].id_team &&
          !data[0].presenter_phone
        ) {
          return res.status(200).json({ message: "sucess" });
        }
        if (
          data[0].link_team &&
          data[0].quantity &&
          data[0].time_create &&
          data[0].id_team &&
          data[0].presenter_phone
        ) {
          link_team = data[0].link_team;
          quantity = data[0].quantity;
          time_create = data[0].time_create;
          id_team = data[0].id_team;
          presenter_phone = data[0].presenter_phone;
          pool.query(TeamModal.getByPhone, [presenter_phone], (err, data) => {
            if (err) {
              throw err;
            }
            if (data) {
              id_collaborator = data[0].id_collaborator;
              pool.query(TeamModal.getByTeamNull, [id_team], (err, data) => {
                if (err) {
                  throw err;
                }
                if (data) {
                  name_leader = data[0].name_collaborator;
                  avatar_leader = data[0].avatar;
                  pool.query(TeamModal.allTeam, [id_team], (err, data) => {
                    if (err) {
                      throw err;
                    }
                    if (data) {
                      console.log(data);
                      return res.status(200).json({
                        name_leader: name_leader,
                        avatar_leader: avatar_leader,
                        id_leader: id_collaborator,
                        link_team: link_team,
                        quantity: quantity,
                        time_create: time_create,
                        id_team: id_team,
                        data: data,
                      });
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};

const getAllCollaboratorOfTeam = (req, res) => {
  let phone = req.params.id;
  pool.query(
    "SELECT team_collaborator.id_team FROM team_collaborator join collaborator on team_collaborator.id_collaborator = collaborator.id_collaborator WHERE collaborator.phone=?",
    [phone],
    (err, data) => {
      if (err) {
        throw err;
      }
      if (data.length > 0) {
        let id_team = data[0].id_team;
        const sql =
          "SELECT c1.phone, c1.email_collaborator, c1.id_collaborator, c1.name_collaborator, c1.gender, c1.avatar, COUNT(c2.phone) AS count FROM collaborator c1 LEFT JOIN collaborator c2 ON c1.phone = c2.presenter_phone INNER JOIN team_collaborator tc ON c1.id_collaborator = tc.id_collaborator GROUP BY c1.name_collaborator, c1.phone, c1.email_collaborator, c1.id_collaborator, c1.gender, c1.avatar , tc.id_team HAVING tc.id_team = ?";

        pool.query(sql, [id_team], (err, data) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          return res.status(200).json(data);
        });
      } else {
        return res.status(200).json([]);
      }
    }
  );
};

const detailCollaborator = (req, res) => {
  let id = req.params.id;
  try {
    pool.query(
      "SELECT c1.id_collaborator, c1.name_collaborator, c1.phone, c1.email_collaborator FROM collaborator c1 join collaborator c2 on c1.presenter_phone = c2.phone WHERE c2.id_collaborator = ?",
      [id],
      (err, data) => {
        if (err) {
          throw err;
        }
        if (data.length > 0) {
          return res.status(200).json(data);
        } else {
          return res.status(200).json([]);
        }
      }
    );
  } catch (err) {
    return res.status(500).json({ message: "fails" });
  }
};

module.exports = {
  detailCollaborator,
  createTeam,
  joinTeam,
  getAllTeam,
  getAllCollaboratorOfTeam,
};
