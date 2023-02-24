const productHelpers = require('../helpers/productHelpers');
const bannerHelpers = require('../helpers/bannerHelpers');

module.exports = {
  getHomePage: async (req, res, next) => {
    const products = await productHelpers.getNewProducts();
    const banners = await bannerHelpers.getBanners();
    res.render('users/user-home',
        {user: req.session.user, page: 'home', products, banners});
  },
};
