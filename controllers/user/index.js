const authManagement = require('./authController');
const productManagement = require('./productController');

module.exports = {
  ...authManagement,
  ...productManagement,

};
