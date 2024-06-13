class ServiceCollaborator {
  static check =
    "SELECT * FROM collaborator WHERE email_collaborator=? OR phone=?";
  static register =
    "INSERT INTO collaborator(name_collaborator, password_collaborator, email_collaborator, phone, status_collaborator, status_leader, status_verify, status_account, code_verify) VALUES(?,?,?,?,?,?,?,?,?)";
  static login =
    "SELECT * FROM collaborator join payment on collaborator.id_collaborator=payment.id_collaborator WHERE email_collaborator=? OR phone=?";
  static verify = "SELECT * FROM collaborator WHERE code_verify=?";
  static updateStatusVerify =
    "UPDATE collaborator SET status_verify=? WHERE code_verify=?";
  static addPresenter = "INSERT INTO collaborator (presenter_phone) VALUES (?)";
  static updateStatus =
    "UPDATE collaborator SET status_collaborator=? WHERE email_collaborator=?";
  static updatePresenter =
    "UPDATE collaborator SET presenter_phone=?, status_collaborator=? WHERE email_collaborator=? AND presenter_phone is NULL";
  static updateCollaboratorNoPhone =
    "UPDATE collaborator SET name_collaborator=?, email_collaborator=? WHERE email_collaborator=?";
  static updateCollaborator =
    "UPDATE collaborator SET name_collaborator=?, email_collaborator=?, presenter_phone=?, status_collaborator=? WHERE email_collaborator=? AND presenter_phone is NULL";
  static checkEmail = "SELECT * FROM collaborator WHERE email_collaborator=?";
  static resendCode =
    "UPDATE collaborator SET code_verify=? WHERE email_collaborator=?";
  static sendCode =
    "SELECT code_verify FROM collaborator WHERE email_collaborator=?";
  static get = "SELECT * FROM collaborator";
  static setStatusTrue =
    "UPDATE collaborator SET status_collaborator = 1 WHERE id_collaborator IN (?)";
  static setStatusFalse =
    "UPDATE collaborator SET status_collaborator = 0 WHERE id_collaborator IN (?)";
  static delete = "DELETE FROM collaborator WHERE id_collaborator=?";
  static getAll = "SELECT * FROM collaborator";
  static checkStatus =
    "SELECT * FROM collaborator WHERE id_collaborator IN (?) AND status_collaborator = 0";
  static checkPresenterPhone = "SELECT * FROM collaborator WHERE phone=?";
  static updateStatusPhone =
    "UPDATE collaborator SET status_leader=1 WHERE presenter_phone=?";
  static getByid =
    "SELECT * FROM collaborator join payment on collaborator.id_collaborator=payment.id_collaborator WHERE payment.id_collaborator = ?";
  static checkPresenterPhoneTeam =
    "SELECT * FROM collaborator join team_collaborator on collaborator.id_collaborator=team_collaborator.id_collaborator WHERE team_collaborator.id_collaborator=?";
  static createTeam =
    "INSERT INTO Team (quantity, link_team, qr_code) VALUES (?,?,?)";
  static createTeamCollaborator =
    "INSERT INTO team_collaborator (id_team, id_campaign) VALUES (?,?)";
  static checkExistsPhone =
    "SELECT collaborator.id_collaborator FROM collaborator WHERE phone=?";
  static checkExistsEmail =
    "SELECT collaborator.id_collaborator FROM collaborator WHERE email_collaborator=?";
  static checkIdCap1 =
    "SELECT * FROM collaborator join team_collaborator on collaborator.id_collaborator=team_collaborator.id_collaborator WHERE team_collaborator.id_collaborator=?";
  static checkIdCap1Team =
    "SELECT team_collaborator.id_team FROM team_collaborator WHERE team_collaborator.id_collaborator=?";
  static createTeamCTV =
    "INSERT INTO team_collaborator (id_team,id_collaborator) VALUES(?,?)";
  static getCount =
    "SELECT COUNT(team_collaborator.id_team) as soluong FROM `team_collaborator` WHERE id_team=?";
  static updateQuantity = "UPDATE Team SET quantity=? WHERE id_team=?";
  static createTeam = "INSERT INTO Team(quantity, link_team) VALUES(?,?)";
  static createTeamCTVC1 =
    "INSERT INTO team_collaborator (id_team, id_collaborator) VALUES (?,?)";
    
}

module.exports = { ServiceCollaborator };
