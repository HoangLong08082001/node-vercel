class ServiceNotification {
  static allNotification() {
    return `SELECT 'products' FROM products
        UNION ALL
        SELECT 'campaign' FROM campaign
        UNION ALL
        SELECT 'orders' FROM orders`;
  }
}
module.exports = ServiceNotification;
