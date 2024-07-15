class ServiceTax {
  static getAllTax() {
    return "SELECT tax.id_tax, tax.total_price, tax.before_tax, tax.after_tax, tax.tax_rate, DATE_FORMAT(DATE_ADD(tax.created_on, INTERVAL 7 HOUR), '%d-%m-%Y') AS formatted_date, tax.created_time, collaborator.id_collaborator, collaborator.name_collaborator, collaborator.email_collaborator, collaborator.phone, collaborator.avatar, orders.id_orders, orders.id_orders_sapo, orders.financial_status, orders.fulfillment_status, orders.status, orders.customer_phone, (SELECT MAX(tax.created_on) FROM tax) as max_date, (SELECT MIN(tax.created_on) FROM tax) as min_date FROM tax join collaborator on tax.id_collaborator = collaborator.id_collaborator join orders on tax.id_orders = orders.id_orders;";
  }
}

module.exports = ServiceTax;
