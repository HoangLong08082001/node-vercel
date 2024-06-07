class TeamModal {
  static create = "INSERT INTO Team (quantity, link_team) VALUES (?,?)";
  static createManyToMany =
    "INSERT INTO team_collaborator (id_team, id_collaborator) VALUES (?,?)";
  static updateLeader =
    "UPDATE collaborator SET status_leader=? WHERE id_collaborator=?";
  static checkQuantity = "SELECT * FROM Team WHERE id_team=? AND quantity=1";
  static alreadyExistsTeam =
    "SELECT * FROM team_collaborator WHERE id_collaborator=?";
  static allTeam = "SELECT * FROM Team";
  static checkTeam = "SELECT * FROM team_collaborator WHERE id_collaborator=?";
  static join =
    "INSERT INTO team_collaborator (id_team, id_collaborator) VALUES(?,?)";
}

module.exports = { TeamModal };
