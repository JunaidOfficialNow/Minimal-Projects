const authManagement = require('./authController');
const productManagement = require('./productController');
const addressManagement = require('./addressController');

module.exports = {
  ...authManagement,
  ...productManagement,
  ...addressManagement,

};
