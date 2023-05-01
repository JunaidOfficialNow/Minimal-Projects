const Wishlist = require('../../models/wishlist.model');

exports.getWishlist = async (req, res, next)=> {
  try {
    const wishlist = await Wishlist.findById(req.session.user._id).populate({
      path: 'products._id',
      model: Product,
    });
    res.render('users/wishlist', {
      user: req.session.user,
      page: 'wishlist', products: wishlist?.products ?? [],
    });
  } catch (error) {
    next(error);
  }
};

exports.addWishlist = async (req, res, next)=> {
  try {
    const {proId, userId} = req.body;
    const wishlist = await Wishlist.findById(userId);
    if (wishlist) {
      const result =
         wishlist.products.some((product) => product._id.equals(proId));
      if (result) {
        return res.json({success: true, product: true});
      } else {
        wishlist.products.push({_id: proId, quantity: 1});
        await wishlist.save();
        return res.json({success: true});
      }
    } else {
      const newWishlist = new Wishlist({
        _id: userId,
        products: [{_id: proId,
          quantity: 1}],
      });
      await newWishlist.save();
      return res.json({success: true});
    }
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = (req, res, next) => {
  Wishlist.findByIdAndUpdate(req.session.user._id,
      {$pull: {products: {_id: req.body.id}}})
      .then(()=> res.json({success: true}))
      .catch((err)=> next(err));
};
