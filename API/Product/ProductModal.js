class ServiceProduct {
  static all() {
    return "SELECT * FROM products";
  }
}

module.exports = { ServiceProduct };
