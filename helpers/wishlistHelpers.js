const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');
module.exports = {
  addToWishlist: async (proId, userId)=> {
    try {
      const wishlist = await Wishlist.findById(userId);
      if (wishlist) {
        const result =
           wishlist.products.some((product) => product._id.equals(proId));
        if (result) {
          return Promise.resolve({product: true});
        } else {
          wishlist.products.push({_id: proId, quantity: 1});
          await wishlist.save();
          return Promise.resolve({product: false});
        }
      } else {
        const newWishlist = new Wishlist({
          _id: userId,
          products: [{_id: proId,
            quantity: 1}],
        });
        await newWishlist.save();
        return Promise.resolve({product: false});
      }
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getWishlist: async (userId) => {
    try {
      const wishlist = await Wishlist.findById(userId).populate({
        path: 'products._id',
        model: Product,
      });
      if (wishlist) {
        return Promise.resolve(wishlist.products);
      }
      return Promise.resolve([]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  removeFromWishlist: async (proId, userId)=> {
    return Wishlist.findByIdAndUpdate(userId, {$pull: {products: {_id: proId}}})
        .then(()=> {
          return Promise.resolve();
        }).catch((err)=> {
          return Promise.reject(err);
        });
  },
};
