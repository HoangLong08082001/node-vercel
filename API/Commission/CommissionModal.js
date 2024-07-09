class ServiceCommission {
  static getAll() {
    return "SELECT * FROM commission join orders on commission.id_orders = orders.id_orders join collaborator on commission.id_collaborator = collaborator.id_collaborator";
  }
  static getById(){
    return "SELECT * FROM commission join orders on commission.id_orders = orders.id_orders join collaborator on commission.id_collaborator = collaborator.id_collaborator WHERE commission.id_commission=?";
  }
}

module.exports = ServiceCommission;
