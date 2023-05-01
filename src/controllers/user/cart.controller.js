const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const User = require('../../models/user.model');
const crypto = require('crypto');


exports.getCart = async (req, res, next)=> {
  try {
    const cart = await Cart.findById(req.session.user._id).populate({
      path: 'products._id',
      model: Product,
    });
    const token = crypto.randomBytes(8).toString('hex').slice(0, 8);
    req.session.checkOutToken = token;
    res.render('users/user-cart', {
      user: req.session.user,
      page: 'cart',
      products: cart?.products ?? [],
      token,
    });
  } catch (error) {
    next(error);
  }
};


exports.addToCart = async (req, res, next)=> {
  try {
    let product;
    const {proId, userId} = req.body;
    const cart = await Cart.findById(userId);
    if (cart) {
      const result =
         cart.products.some((product) => product._id.equals(proId));
      if (result) {
        product = true;
      } else {
        cart.products.push({_id: proId, quantity: 1});
        await cart.save();
        product = false;
      }
    } else {
      const newCart = new Cart({
        _id: userId,
        products: [{
          _id: proId,
          quantity: 1,
        }],
      });
      await newCart.save();
      product = false;
    }
    if (product) {
      return res.json({success: true, product: true});
    } else {
      await User.findByIdAndUpdate(userId, {$inc: {cartCount: 1}});
      req.session.user.cartCount += 1;
      return res.json({success: true});
    }
  } catch (error) {
    next(error);
  }
};

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

