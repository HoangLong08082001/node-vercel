class TeamModal {
  static create() {
    return "INSERT INTO Team (quantity, link_team) VALUES (?,?)";
  }
  static createManyToMany() {
    return "INSERT INTO team_collaborator (id_team, id_collaborator) VALUES (?,?)";
  }
  static updateLeader() {
    return "UPDATE collaborator SET status_leader=? WHERE id_collaborator=?";
  }
  static checkQuantity() {
    return "SELECT * FROM Team WHERE id_team=? AND quantity=1";
  }
  static alreadyExistsTeam() {
    return "SELECT * FROM team_collaborator WHERE id_collaborator=?";
  }
  static allTeam() {
    return "SELECT collaborator.avatar FROM team_collaborator join collaborator on team_collaborator.id_collaborator = collaborator.id_collaborator join Team on team_collaborator.id_team=Team.id_team WHERE team_collaborator.id_team=?";
  }
  static getCollaboratorTeam() {
    return "SELECT Team.link_team, Team.quantity, Team.time_create, Team.id_team, collaborator.presenter_phone FROM collaborator left join team_collaborator on team_collaborator.id_collaborator=collaborator.id_collaborator left join Team on team_collaborator.id_team = Team.id_team WHERE collaborator.email_collaborator=?";
  }
  static checkTeam() {
    return "SELECT * FROM team_collaborator WHERE id_collaborator=?";
  }
  static join() {
    return "INSERT INTO team_collaborator (id_team, id_collaborator) VALUES(?,?)";
  }
  static getByEmail() {
    return "SELECT * FROM collaborator WHERE email_collaborator=?";
  }
  static getByPhone() {
    return "SELECT collaborator.name_collaborator, collaborator.avatar, collaborator.id_collaborator FROM collaborator WHERE phone=?";
  }
  static getByTeamNull() {
    return "SELECT collaborator.name_collaborator, collaborator.avatar FROM `Team` JOIN team_collaborator on Team.id_team = team_collaborator.id_team JOIN collaborator on team_collaborator.id_collaborator = collaborator.id_collaborator WHERE Team.id_team=? && collaborator.presenter_phone IS NULL";
  }
  static allCollaboratorOfTeam() {
    return "SELECT team_collaborator.id_team FROM team_collaborator join collaborator on team_collaborator.id_collaborator = collaborator.id_collaborator WHERE collaborator.phone=?";
  }
  static getCollaboratorTeamHaving() {
    return "SELECT c1.phone, c1.email_collaborator, c1.id_collaborator, c1.name_collaborator, c1.avatar, COUNT(c2.phone) AS count FROM collaborator c1 LEFT JOIN collaborator c2 ON c1.phone = c2.presenter_phone INNER JOIN team_collaborator tc ON c1.id_collaborator = tc.id_collaborator GROUP BY c1.name_collaborator, c1.phone, c1.email_collaborator, c1.id_collaborator, c1.avatar , tc.id_team HAVING tc.id_team = ?";
  }
  static getDetailCollaborator() {
    return "SELECT c1.id_collaborator, c1.name_collaborator, c1.phone, c1.email_collaborator FROM collaborator c1 join collaborator c2 on c1.presenter_phone = c2.phone WHERE c2.id_collaborator = ?";
  }
}

module.exports = { TeamModal };
