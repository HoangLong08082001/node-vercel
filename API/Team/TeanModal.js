class TeamModal {
  static create = "INSERT INTO Team (quantity, link_team) VALUES (?,?)";
  static createManyToMany =
    "INSERT INTO team_collaborator (id_team, id_collaborator) VALUES (?,?)";
  static updateLeader =
    "UPDATE collaborator SET status_leader=? WHERE id_collaborator=?";
  static checkQuantity = "SELECT * FROM Team WHERE id_team=? AND quantity=1";
  static alreadyExistsTeam =
    "SELECT * FROM team_collaborator WHERE id_collaborator=?";
  static allTeam =
    "SELECT collaborator.avatar FROM team_collaborator join collaborator on team_collaborator.id_collaborator = collaborator.id_collaborator join Team on team_collaborator.id_team=Team.id_team WHERE team_collaborator.id_team=?";
  static getCollaboratorTeam =
    "SELECT * FROM team_collaborator join collaborator on team_collaborator.id_collaborator=collaborator.id_collaborator join Team on team_collaborator.id_team = Team.id_team WHERE collaborator.email_collaborator=?";
  static checkTeam = "SELECT * FROM team_collaborator WHERE id_collaborator=?";
  static join =
    "INSERT INTO team_collaborator (id_team, id_collaborator) VALUES(?,?)";
    static getByEmail = "SELECT * FROM collaborator WHERE email_collaborator=?"
    static getByPhone = "SELECT * FROM collaborator WHERE phone=?"
}

module.exports = { TeamModal };
