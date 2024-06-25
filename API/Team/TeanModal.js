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
    "SELECT Team.link_team, Team.quantity, Team.time_create, Team.id_team, collaborator.presenter_phone FROM collaborator left join team_collaborator on team_collaborator.id_collaborator=collaborator.id_collaborator left join Team on team_collaborator.id_team = Team.id_team WHERE collaborator.email_collaborator=?";
  static checkTeam = "SELECT * FROM team_collaborator WHERE id_collaborator=?";
  static join =
    "INSERT INTO team_collaborator (id_team, id_collaborator) VALUES(?,?)";
  static getByEmail = "SELECT * FROM collaborator WHERE email_collaborator=?";
  static getByPhone =
    "SELECT collaborator.name_collaborator, collaborator.avatar, collaborator.id_collaborator FROM collaborator WHERE phone=?";
  static getByTeamNull =
    "SELECT collaborator.name_collaborator, collaborator.avatar FROM `Team` JOIN team_collaborator on Team.id_team = team_collaborator.id_team JOIN collaborator on team_collaborator.id_collaborator = collaborator.id_collaborator WHERE Team.id_team=? && collaborator.presenter_phone IS NULL";
}

module.exports = { TeamModal };
