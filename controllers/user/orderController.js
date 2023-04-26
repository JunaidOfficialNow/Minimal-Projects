const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');


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

exports.getOrderDetails = async (req, res, next)=> {
  const order = await Order.findById(req.body.id).populate({
    path: 'products.product',
    model: Product,
  }).catch((err)=> next(err));
  if (order) {
    return res.json({success: true, order});
  }
  return res.json({success: false});
};

exports.changeStatusOrder = async (req, res, next)=> {
  try {
    const {id, status, products} = req.body;
    if (status === 'Cancelled') {
      products.forEach(async (product)=>{
        // eslint-disable-next-line max-len
        const filter = {_id: product.product._id};
        const update = {$inc: {
          'stock': Number(product.quantity),
          'sizes.$[elem].stock': Number(product.quantity),
        }};
        const options = {arrayFilters: [{'elem.size': product.size}]};
        await Product.updateOne( filter, update, options);
      });
    }
    await Order.findByIdAndUpdate(id, {status: status});
    res.json({success: true});
  } catch (error) {
    next(error);
  }
};
