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
  try {
    pool.query(TeamModal.allTeam, [], (err, result) => {
      if (err) {
        throw err;
      }
      if (result) {
        return res.status(200).json(result);
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "fails" });
  }
};

module.exports = { createTeam, joinTeam, getAllTeam };
