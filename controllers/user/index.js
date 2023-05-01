const authManagement = require('./auth.controller');
const productManagement = require('./product.controller');
const addressManagement = require('./address.controller');
const cartManagement = require('./cart.controller');
const wishlistManagement = require('./wishlist.controller');
const orderManagement = require('./order.controller');
const profileManagement = require('./profile.controller');
const checkoutManagement = require('./checkout.controller');
const accountManagement = require('./account.controller');
const userManagement = require('./user.controller');

module.exports = {
  ...authManagement,
  ...productManagement,
  ...addressManagement,
  ...cartManagement,
  ...wishlistManagement,
  ...orderManagement,
  ...profileManagement,
  ...checkoutManagement,
  ...accountManagement,
  ...userManagement,
};

