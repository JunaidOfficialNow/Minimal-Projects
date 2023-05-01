const auth = require('./auth.controller');
const userManagement = require('./user.controller');
const categoryManagement = require('./category.controller');
const designCategoryManagement = require('./design.controller');
const productManagement = require('./product.controller');
const couponManagement = require('./coupon.controller');
const orderManagement = require('./order.controller');
const bannerManagement = require('./banner.controller');
const dashboardManagement = require('./dashboard.controller');

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
