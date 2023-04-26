const Order = require('../../models/orderModel');


exports.getOrderPage = async (req, res)=> {
  const orders = await Order.find({userId: req.session.user._id})
      .populate({
        path: 'products.product',
        model: Product,
      }).sort({createdAt: -1});
  res.render('users/my-orders', {
    user: req.session.user,
    page: 'order',
    orders,
  });
};
