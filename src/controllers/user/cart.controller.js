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

exports.removeFromCart = catchAsync(async (req, res, next) => {
  await cartServices.removeFromCart(
      req.session.user._id,
      req.body.id,
  );
  req.session.user.cartCount += -1;
  res.json({success: true});
});

exports.incrementQuantity = catchAsnc(async (req, res, next) => {
  await cartServices.changeQuantity(
      req.session.user._id,
      req.body.id,
      1,
  );
  res.json({success: true});
});

exports.decrementQuantity = catchAsnc(async (req, res, next)=> {
  await cartServices.changeQuantity(
      req.session.user._id,
      req.body.id,
      -1,
  );
  res.json({success: true});
});

exports.changeSize = catchAsnc(async (req, res, next)=>{
  const {id, size} = req.body;
  await cartServices.changeSize(
      req.session.user._id,
      id,
      size,
  );
  res.json({success: true});
});

