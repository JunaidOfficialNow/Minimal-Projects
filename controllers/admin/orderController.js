const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');

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

