class ServiceCollaborator {
  static check() {
    return "SELECT * FROM collaborator WHERE email_collaborator=? OR phone=?";
  }
  static register() {
    return "INSERT INTO collaborator(name_collaborator, password_collaborator, email_collaborator, phone, status_collaborator, status_leader, status_verify, status_account, code_verify) VALUES(?,?,?,?,?,?,?,?,?)";
  }
  static login() {
    return "SELECT * FROM collaborator join payment on collaborator.id_collaborator=payment.id_collaborator WHERE email_collaborator=? OR phone=?";
  }
  static verify() {
    return "SELECT * FROM collaborator WHERE code_verify=?";
  }
  static updateStatusVerify() {
    return "UPDATE collaborator SET status_verify=? WHERE code_verify=?";
  }
  static addPresenter() {
    return "INSERT INTO collaborator (presenter_phone) VALUES (?)";
  }
  static updateStatus() {
    return "UPDATE collaborator SET status_collaborator=? WHERE email_collaborator=?";
  }
  static updatePresenter() {
    return "UPDATE collaborator SET presenter_phone=?, status_collaborator=? WHERE email_collaborator=? AND presenter_phone is NULL";
  }
  static updateCollaboratorNoPhone() {
    return "UPDATE collaborator SET name_collaborator=?, email_collaborator=? WHERE email_collaborator=?";
  }
  static updateCollaborator() {
    return "UPDATE collaborator SET name_collaborator=?, email_collaborator=?, presenter_phone=?, status_collaborator=? WHERE email_collaborator=? AND presenter_phone is NULL";
  }
  static checkEmail() {
    return "SELECT * FROM collaborator WHERE email_collaborator=?";
  }
  static resendCode() {
    return "UPDATE collaborator SET code_verify=? WHERE email_collaborator=?";
  }
  static sendCode() {
    return "SELECT code_verify FROM collaborator WHERE email_collaborator=?";
  }
  static get() {
    return "SELECT * FROM collaborator";
  }
  static setStatusTrue() {
    return "UPDATE collaborator SET status_collaborator = 1 WHERE id_collaborator IN (?)";
  }
  static setStatusFalse() {
    return "UPDATE collaborator SET status_collaborator = 0 WHERE id_collaborator IN (?)";
  }
  static delete() {
    return "DELETE FROM collaborator WHERE id_collaborator=?";
  }
  static getAll() {
    return "SELECT * FROM collaborator";
  }
  static checkStatus() {
    return "SELECT * FROM collaborator WHERE id_collaborator IN (?) AND status_collaborator = 0";
  }
  static checkPresenterPhone() {
    return "SELECT * FROM collaborator WHERE phone=?";
  }
  static updateStatusPhone() {
    return "UPDATE collaborator SET status_leader=1 WHERE phone=?";
  }
  static getByid() {
    return "SELECT payment.total_recived FROM collaborator join payment on collaborator.id_collaborator=payment.id_collaborator WHERE payment.id_collaborator = ?";
  }
  static checkPresenterPhoneTeam() {
    return "SELECT * FROM collaborator join team_collaborator on collaborator.id_collaborator=team_collaborator.id_collaborator WHERE team_collaborator.id_collaborator=?";
  }
  static createTeam() {
    return "INSERT INTO Team (quantity, link_team, qr_code) VALUES (?,?,?)";
  }
  static createTeamCollaborator() {
    return "INSERT INTO team_collaborator (id_team, id_campaign) VALUES (?,?)";
  }
  static checkExistsPhone() {
    return "SELECT collaborator.id_collaborator FROM collaborator WHERE phone=?";
  }
  static checkExistsEmail() {
    return "SELECT collaborator.id_collaborator FROM collaborator WHERE email_collaborator=?";
  }
  static checkIdCap1() {
    return "SELECT * FROM collaborator join team_collaborator on collaborator.id_collaborator=team_collaborator.id_collaborator WHERE team_collaborator.id_collaborator=?";
  }
  static checkIdCap1Team() {
    return "SELECT team_collaborator.id_team FROM team_collaborator WHERE team_collaborator.id_collaborator=?";
  }
  static createTeamCTV() {
    return "INSERT INTO team_collaborator (id_team,id_collaborator) VALUES(?,?)";
  }
  static getCount() {
    return "SELECT COUNT(team_collaborator.id_team) as soluong FROM `team_collaborator` WHERE id_team=?";
  }
  static updateQuantity() {
    return "UPDATE Team SET quantity=? WHERE id_team=?";
  }
  static createTeam() {
    return "INSERT INTO Team(quantity, link_team) VALUES(?,?)";
  }
  static createTeamCTVC1() {
    return "INSERT INTO team_collaborator (id_team, id_collaborator) VALUES (?,?)";
  }
  static checkStatusVerify() {
    return "SELECT collaborator.email_collaborator, collaborator.status_verify, collaborator.code_verify FROM collaborator WHERE email_collaborator=?";
  }
  static getCollaboratorByEmail(){
    return "SELECT * FROM collaborator WHERE email_collaborator=?";
  }
  static updatePassByEmail(){
    return "UPDATE collaborator SET password_collaborator=? WHERE email_collaborator=?";
  }
}

module.exports = { ServiceCollaborator };
