const {
  getCarrierServices,
  getCarrierServicesById,
  getCollectById,
  getCollects,
  getCollectsTotal,
  getCustomCollectMetafields,
  getCustomCollects,
  getCustomCollectsEvents,
  getCustomCollectsId,
  getCustomCollectsTotal,
  getCustomerById,
  getCustomers,
  getCustomersAddress,
  getCustomersIdAddressId,
  getCustomersMetafields,
  getEvents,
  getEventsTotal,
  getFulfillment,
  getFulfillmentById,
  getFulfillmentTotal,
  getMetafieldTotal,
  getMetafields,
  getOrderById,
  getOrderTotal,
  getOrders,
  getOrdersEvents,
  getOrdersMetafields,
  getPriceRule,
  getPriceRuleById,
  getProductById,
  getProductTotal,
  getProducts,
  getProductsByIdMetafields,
  getProductsEvents,
  getProductsMetafields,
  getRedirect,
  getRedirectById,
  getRedirectTotal,
  getRefund,
  getStores,
  getTotalCustomers,
  getTransaction,
  getTransactionById,
  getTransactionTotal,
  getVariants,
} = require("./WebhookController");

const express = require("express");
const router = express.Router();
module.exports = function WebhookRoute(app) {
  //orders
  router.get("/orders", getOrders);
  router.get("/orders-by-id/:orders_id", getOrderById);
  router.get("/orders-total", getOrderTotal);
  //customers
  router.get("/customers", getCustomers);
  router.get("/customer-by-id/:customers_id", getCustomerById);
  router.get("/customers-total", getTotalCustomers);
  //customers address
  router.get("/custommer-address/:customers_id", getCustomersAddress);
  router.get(
    "/customerId/:customers_id/addressId/:address_id",
    getCustomersIdAddressId
  );
  //store
  router.get("/store", getStores);
  //products
  router.get("/products", getProducts);
  router.get("/product-by-id/:products_id", getProductById);
  router.get("/products-total", getProductTotal);
  //collects
  router.get("/collects", getCollects);
  router.get("/collect-by-id/:collects_id", getCollectById);
  router.get("/collects-total", getCollectsTotal);
  //Custom collection
  router.get("/custom-collect", getCustomCollects);
  router.get("/custom-collect-by-id/:custom_collect_id", getCustomCollectsId);
  router.get("/custom-collect-total/:products_id", getCustomCollectsTotal);
  //Events
  router.get("/all-events", getEvents);
  router.get(
    "/events-custom-collects/:custom_collect_events_id",
    getCustomCollectsEvents
  );
  router.get("/events-orders/:orders_id", getOrdersEvents);
  router.get("/events-products/:products_id", getProductsEvents);
  router.get("/events-total", getEventsTotal);
  //Fulfillment
  router.get("/fulfillment/:orders_id", getFulfillment);
  router.get(
    "/fulfillment-by-id/:orders_id/:fulfillment_id",
    getFulfillmentById
  );
  router.get("/fulfillment-total/:orders_id", getFulfillmentTotal);
  //Metafields
  router.get("/metafields", getMetafields);
  router.get(
    "/metafields-custom-collect/:custom_collection_id",
    getCustomCollectMetafields
  );
  router.get("/metafields-customers/:customers_id", getCustomersMetafields);
  router.get("/metafields-orders/:orders_id", getOrdersMetafields);
  router.get("/metafields-products/:products_id", getProductsMetafields);
  router.get("/metafields-products-by-id", getProductsByIdMetafields); //delay
  router.get("/metafields-total", getMetafieldTotal);
  //price rule
  router.get("/price-rule", getPriceRule);
  router.get("/price-rule-by-id/:priceRule_id", getPriceRuleById); //delay
  //Refunds
  router.get("/refund/:orders_id", getRefund);
  //Transaction
  router.get("/transaction/:orders_id", getTransaction);
  router.get(
    "/transaction-by-id/:orders_id/:transaction_id",
    getTransactionById
  ); //delay
  router.get("/transaction-total/:orders_id", getTransactionTotal);
  //Carrier Service
  router.get("/carrier-service", getCarrierServices);
  router.get(
    "/carrier-service-by-id/:carrier_services_id",
    getCarrierServicesById
  ); //delay
  //Redirect
  router.get("/redirect", getRedirect);
  router.get("/redirect-by-id/:redirect_id", getRedirectById); //delay
  router.get("/redirect-total", getRedirectTotal);
  //Variant
  router.get("/products-variant", getVariants);
  return app.use("/webhook", router);
};
