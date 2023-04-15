const auth = require('./authController');
const userManagement = require('./userController');
const categoryManagement = require('./categoryController');
const designCategoryManagement = require('./designController');

module.exports = {
  ...auth,
  ...userManagement,
  ...categoryManagement,
  ...designCategoryManagement,
};
