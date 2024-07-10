class ServiceCommission {
  static getAll() {
    return "SELECT collaborator.name_collaborator, collaborator.email_collaborator, collaborator.avatar, collaborator.phone, SUM(commission.commission_net) as total_commission , COUNT(commission.id_orders) as total_orders, (SELECT MAX(commission.create_at) FROM commission) as max_date, (SELECT MIN(commission.create_at) FROM commission) as min_date FROM collaborator join commission on collaborator.id_collaborator = commission.id_collaborator join orders on orders.id_orders = commission.id_orders join payment on collaborator.id_collaborator = payment.id_collaborator GROUP BY collaborator.id_collaborator;";
  }
  static getById() {
    return "SELECT * FROM commission join orders on commission.id_orders = orders.id_orders join collaborator on commission.id_collaborator = collaborator.id_collaborator WHERE commission.id_commission=?";
  }
  static commissionYesterday() {
    return "SELECT SUM(commission_net) AS total_yesterday FROM commission WHERE create_at = CURDATE() - INTERVAL 1 DAY";
  }
  static commissionToday() {
    return "SELECT SUM(commission_net) AS total_today FROM commission WHERE create_at = CURDATE()";
  }
}

module.exports = ServiceCommission;
