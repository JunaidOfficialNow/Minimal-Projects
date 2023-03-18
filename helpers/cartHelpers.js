const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

module.exports = {
  getCart: async (userId)=> {
    try {
      const cart = await Cart.findById(userId).populate({
        path: 'products._id',
        model: Product,
      });
      if (cart) {
        return Promise.resolve(cart.products);
      }
      return Promise.resolve([]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  removeFromCart: async (proId, userId)=> {
    return Cart.findByIdAndUpdate(userId, {$pull: {products: {_id: proId}}})
        .then(()=> {
          return Promise.resolve();
        }).catch((err)=> {
          return Promise.reject(err);
        });
  },
  changeQuantity: async (userId, id, value) => {
    await Cart.updateOne(
        {'_id': userId, 'products._id': id},
        {$inc: {'products.$.quantity': value}},
    );
  },
  changeSize: async (id, size, userId)=> {
    await Cart.updateOne(
        {'_id': userId, 'products._id': id},
        {$set: {'products.$.size': size}},
    );
    return Promise.resolve();
  },
  addCoupon: async (coupon, discount, userId) => {
    const cart = await Cart.findById(userId);
    if (cart) {
      cart.coupon = coupon;
      cart.discount = discount;
      await cart.save();
      return Promise.resolve();
    }
    return Promise.reject(error);
  },
  clearCart: async (userId) => {
    const cart = await Cart.findById(userId);
    if (cart) {
      cart.products = [];
      await cart.save();
      return Promise.resolve();
    } else return Promise.reject(error);
  },
};
