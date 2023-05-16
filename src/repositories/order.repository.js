/* eslint-disable require-jsdoc */

const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const userModel = require('../models/user.model');

class OrderRepository {
  static instance;
  #model;
  #productModel;
  #userModel;
  constructor(model, productModel, userModel) {
    this.#model = model;
    this.#productModel = productModel;
    this.#userModel = userModel;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new OrderRepository(
          orderModel,
          productModel,
          userModel,
      );
    }
    return this.instance;
  }

  async getRecentOrders() {
    return await this.#model
        .find()
        .populate({
          path: 'userId',
          model: this.userModel,
        })
        .sort({createdAt: -1})
        .limit(5);
  }


  async getAllOrders() {
    return await this.#model.find({}).populate({
      path: 'products.product',
      model: this.#productModel,
    }).populate({
      path: 'userId',
      model: this.#userModel,
    }).sort({createdAt: -1});
  };

  async getOrderById(id) {
    return await this.#model.findById(id).populate({
      path: 'products.product',
      model: this.#productModel,
    }).populate({
      path: 'userId',
      model: this.#userModel,
    });
  };

  async changeOrderStatus(id, status) {
    return this.#model.findByIdAndUpdate(id, {status: status});
  }

  async getOrderByStatus(status) {
    return await this.#model.find({status});
  }

  async todaySale(startOfDay, endOfDay) {
    return await this.#model.aggregate([
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
  }

  async totalSale() {
    return await this.#model.aggregate([
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
  }

  async salesAndRevenueChart(sevenMonthsAgo) {
    return await this.#model.aggregate([
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
  }

  async sizeAndSaleReport(sevenMonthsAgo) {
    return await this.#model.aggregate([
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
  }
}

module.exports = OrderRepository;

