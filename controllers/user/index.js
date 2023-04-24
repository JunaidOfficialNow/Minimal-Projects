const authManagement = require('./authController');
const productManagement = require('./productController');
const addressManagement = require('./addressController');
const cartManagement = require('./cartController');
const wishlistManagement = require('./wishlistController');

module.exports = {
  ...authManagement,
  ...productManagement,
  ...addressManagement,
  ...cartManagement,
  ...wishlistManagement,
};

