const auth = require('./authController');
const userManagement = require('./userController');
const categoryManagement = require('./categoryController');
const designCategoryManagement = require('./designController');
const productManagement = require('./productController');
const couponManagement = require('./couponController');
const orderManagement = require('./orderController');
const bannerManagement = require('./bannerController');
const dashboardManagement = require('./dashboardController');

module.exports = {
  ...auth,
  ...userManagement,
  ...categoryManagement,
  ...designCategoryManagement,
  ...productManagement,
  ...couponManagement,
  ...orderManagement,
  ...bannerManagement,
  ...dashboardManagement,
};
