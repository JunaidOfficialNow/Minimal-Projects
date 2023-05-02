/* eslint-disable require-jsdoc */
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');


exports.getAllorders = async ()=> {
  return await Order.find({}).populate({
    path: 'products.product',
    model: Product,
  }).populate({
    path: 'userId',
    model: User,
  }).sort({createdAt: -1});
};

exports.getOrderById = async (id) => {
  return await Order.findById(id).populate({
    path: 'products.product',
    model: Product,
  }).populate({
    path: 'userId',
    model: User,
  });
};

exports.todaySale= async ()=> {
  const today = new Date();
  const startOfDay =
   new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay =
 new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  return Order.aggregate([
    {
      $match: {
        status: {$nin: ['Cancelled', 'Returned', 'Refunded']},
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: null,
        todaySales: {$sum: 1},
        todayRevenue: {$sum: '$totalAmount'},
      },
    },
  ]).then((result)=> {
    return Promise.resolve(result);
  }).catch((err)=>{
    return Promise.reject(err);
  });
};

exports.totalSale= async ()=> {
  return await Order.aggregate([
    {
      $match: {
        status: {$nin: ['Cancelled', 'Returned', 'Refunded']},
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {$sum: 1},
        totalRevenue: {$sum: '$totalAmount'},
      },
    },
  ]).then((result)=> {
    return Promise.resolve(result);
  }).catch((err)=> {
    return Promise.reject(err);
  });
};

exports.salesAndRevenueChart = async ()=> {
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
  sevenMonthsAgo.setHours(0, 0, 0, 0);
  return await Order.aggregate([
    {
      $match: {
        status: {$nin: ['Cancelled', 'Returned', 'Refunded']},
        createdAt: {$gte: sevenMonthsAgo},
      },
    },
    {
      $group: {
        _id: {
          month: {$month: '$createdAt'},
          year: {$year: '$createdAt'},
        },
        totalSales: {$sum: 1},
        totalRevenue: {$sum: '$totalAmount'},
      },
    },
    {
      $sort: {
        'id.year': 1,
        '_id.month': 1,
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        year: '$_id.year',
        totalSales: 1,
        totalRevenue: 1,
      },
    },
    {
      $group: {
        _id: null,
        data: {
          $push: {
            month: '$month',
            year: '$year',
            totalSales: '$totalSales',
            totalRevenue: '$totalRevenue',
          },
        },
      },
    },
  ]).then((result)=> {
    if (result.length > 0) {
      return Promise.resolve(result[0].data);
    }
    return Promise.resolve([]);
  }).catch((err)=> {
    return Promise.reject(err);
  });
};

exports.sizeAndSaleReport = async () => {
  const currentDate = new Date();
  const sevenMonthsAgo =
 new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
  return await Order.aggregate([
    {
      $match: {
        status: {$nin: ['Cancelled', 'Returned', 'Refunded']},
        createdAt: {$gte: sevenMonthsAgo},
      },
    },
    {
      $unwind: '$products',
    },
    {
      $group: {
        _id: {
          size: '$products.size',
          year: {$year: '$createdAt'},
          month: {$month: '$createdAt'},
        },
        totalSales: {$sum: '$products.quantity'},
      },
    },
    {
      $project: {
        _id: 0,
        size: '$_id.size',
        year: '$_id.year',
        month: '$_id.month',
        totalSales: '$totalSales',
      },
    },
  ]).then((report)=> {
    return Promise.resolve(report);
  }).catch((err)=> {
    return Promise.reject(err);
  });
};