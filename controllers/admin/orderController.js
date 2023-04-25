const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

exports.getOrdersPage = async (req, res)=> {
  try {
    const orders = await Order.find({}).populate({
      path: 'products.product',
      model: Product,
    }).populate({
      path: 'userId',
      model: User,
    }).sort({createdAt: -1});
    res.render('admins/admin-orders', {admin: req.session.admin,
      page: 'orders', orders});
  } catch (error) {
    next(error);
  }
};

exports.getOrderDetails = async (req, res, next)=> {
  try {
    const order = await Order.findById(req.body.id).populate({
      path: 'products.product',
      model: Product,
    }).populate({
      path: 'userId',
      model: User,
    });
    if (order) {
      return res.json({success: true, order});
    }
    return res.json({success: false});
  } catch (error) {
    next(error);
  }
};

exports.getOrderDetailsPage = async (req, res, next)=> {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'products.product',
      model: Product,
    }).populate({
      path: 'userId',
      model: User,
    });
    if (order) {
      res.render('admins/view-order', {admin: req.session.admin,
        order: order});
    }
  } catch (error) {
    next(error);
  }
};

exports.changeOrderStatus = (req, res, next)=> {
  const {id, status} = req.body;
  Order.findByIdAndUpdate(id, {status: status}).then(()=> {
    res.json({success: true});
  }).catch((err)=> {
    next(err);
  });
};

exports.downloadOrdersReport = async (req, res, next)=> {
  try {
    const orders = await Order.find({status: req.params.status});
    if (orders.length > 0) {
      const csvWriter = createCsvWriter({
        path: 'orders.csv',
        header: [
          {id: 'orderId', title: 'Order ID'},
          {id: 'userId', title: 'Customer ID'},
          {id: 'status', title: 'Status'},
          {id: 'paymentMethod', title: 'payment'},
          {id: 'coupon', title: 'Coupon'},
          {id: 'discount', title: 'dicount'},
          {id: 'subTotal', title: 'Sub Total'},
          {id: 'totalAmount', title: 'Total Amount'},
        ],
      });
      await csvWriter.writeRecords(orders);
      res.download('orders.csv', () => {
        fs.unlink('orders.csv', (err) => {
          if (err) next(err);
        });
      });
    } else {
      throw new Error('No records to download');
    };
  } catch (error) {
    next(error);
  }
};


