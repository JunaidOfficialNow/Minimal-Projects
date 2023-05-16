const reportsServices = require('../../services/reports.services');
const orderServices = require('../../services/order.services');

const catchAsync = require('../../utils/error-handlers/catchAsync.handler');

exports.getDashboard = catchAsync(async (req, res, next)=>{
  const recentOrders = await orderServices.getRecentOrders();
  const {todaySale, totalSale} = await reportsServices.getDashboardDatas();

  res.render('admins/admin-home', {
    admin: req.session.admin,
    todaySale,
    totalSale,
    recentOrders,
  });
});

exports.salesAndRevenue = catchAsync(async (req, res, next) => {
  const {sales, size} = await reportsServices.getSalesAndRevenueDatas();
  res.json({success: true, sales, size});
});

