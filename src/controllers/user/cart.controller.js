const Cart = require('../../models/cart.model');
const User = require('../../models/user.model');

const cartServices = require('../../services/cart.services');
const catchAsnc = require('../../utils/error-handlers/catchAsync.handler');


exports.getCart = catchAsync(async (req, res, next)=> {
  const {products, token} = cartServices.getCartPage(req.session.user._id);
  req.session.checkOutToken = token;
  res.render('users/user-cart', {
    user: req.session.user,
    page: 'cart',
    products,
    token,
  });
});


exports.addToCart = catchAsnc(async (req, res, next)=> {
  const {proId, userId} = req.body;
  const product = await cartServices.addToCart(userId, proId);
  req.session.user.cartCount += 1;
  res.json({success: true, product});
});

exports.removeFromCart = async (req, res, next) => {
  try {
    await Cart.findByIdAndUpdate(req.session.user._id,
        {$pull: {products: {_id: req.body.id}}});
    await User.findByIdAndUpdate(req.session.user._id,
        {$inc: {cartCount: -1}});
    req.session.user.cartCount += -1;
    res.json({success: true});
  } catch (error) {
    next(error);
  };
};

exports.incrementQuantity = async (req, res, next) => {
  await Cart.updateOne(
      {'_id': req.session.user._id, 'products._id': req.body.id},
      {$inc: {'products.$.quantity': 1}},
  ).then(()=> res.json({success: true}))
      .catch((err)=> next(err));
};

exports.decrementQuantity = async (req, res, next)=> {
  await Cart.updateOne(
      {'_id': req.session.user._id, 'products._id': req.body.id},
      {$inc: {'products.$.quantity': -1}},
  ).then(()=> res.json({success: true}))
      .catch((err)=> next(err));
};

exports.changeSize = async (req, res, next)=>{
  const {id, size} = req.body;
  await Cart.updateOne(
      {'_id': req.session.user._id, 'products._id': id},
      {$set: {'products.$.size': size}},
  ).then(()=> res.json({success: true}))
      .catch((err)=> next(err));
};

