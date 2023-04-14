const auth = require('./authController');
const userManagement = require('./userController');
const categoryManagement = require('./categoryController');

module.exports = {
  ...auth,
  ...userManagement,
  ...categoryManagement,
};
