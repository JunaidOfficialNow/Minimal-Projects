const Order = require('../../models/order.model');
const orderRepo = require('../../repositories/order.repository');
const User = require('../../models/user.model');

exports.getDashboard = async (req, res, next)=>{
  try {
    let recentOrders = await Order.find({}).populate({
      path: 'userId',
      model: User,
    }).sort({createdAt: -1}).limit(5);
    let todaySale = await orderRepo.todaySale();
    let totalSale = await orderRepo.totalSale();
    if (todaySale.length === 0) {
      todaySale = [{todaySales: 0, todayRevenue: 0}];
    }

    if (totalSale.length === 0) {
      totalSale = [{totalSales: 0, totalRevenue: 0}];
    };

    if (recentOrders.length === 0) {
      recentOrders = [];
    };

    res.render('admins/admin-home',
        {admin: req.session.admin,
          todaySale, totalSale, recentOrders});
  } catch (error) {
    next(error);
  }
};

exports.salesAndRevenue = async (req, res, next) => {
  try {
    const sales = await orderRepo.salesAndRevenueChart();
    const size = await orderRepo.sizeAndSaleReport();
    res.json({success: true, sales, size});
  } catch (error) {
    next(error);
  }
};

