const Product = require('../../models/product.model');
const Banner = require('../../models/banner.model');
const User = require('../../models/user.model');

exports.getHomePage = async (req, res, next) => {
  const products = await Product.find().sort({createdAt: -1}).limit(8);
  const banners = await Banner.find();
  res.render('users/user-home',
      {user: req.session.user, page: 'home', products, banners});
};

exports.getLoginPage = (req, res)=>{
  const reset = req.session.passwordReset;
  const signin = req.session.signin;
  const messages = req.session.userMessage;
  delete req.session.userMessage;
  delete req.session.passwordReset;
  delete req.session.signin;
  res.render('users/user-login', {reset, signin, messages});
};

exports.checkEmailExists = async (req, res, next)=> {
  User.findOne({email: req.query.email})
      .then((email)=> {
        if (email) {
          return res.json({success: false});
        }
        return res.json({success: true});
      }).catch((error)=> next(error));
};
