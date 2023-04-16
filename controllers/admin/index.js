const auth = require('./authController');
const userManagement = require('./userController');
const categoryManagement = require('./categoryController');
const designCategoryManagement = require('./designController');
const productManagement = require('./productController');

module.exports = {
  ...auth,
  ...userManagement,
  ...categoryManagement,
  ...designCategoryManagement,
  ...productManagement,
};
