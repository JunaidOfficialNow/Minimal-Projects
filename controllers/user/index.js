const authManagement = require('./authController');
const productManagement = require('./productController');
const addressManagement = require('./addressController');
const cartManagement = require('./cartController');
const wishlistManagement = require('./wishlistController');
const orderManagement = require('./orderController');
const profileManagement = require('./profileController');

module.exports = {
  ...authManagement,
  ...productManagement,
  ...addressManagement,
  ...cartManagement,
  ...wishlistManagement,
  ...orderManagement,
  ...profileManagement,
};

