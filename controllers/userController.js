const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../services/email-otp');
const Product = require('../models/productModel');
const Banner = require('../models/bannerModel');
const User = require('../models/userModel');


module.exports = {
  getHomePage: async (req, res, next) => {
    const products = await Product.find().sort({createdAt: -1}).limit(8);
    const banners = await Banner.find();
    res.render('users/user-home',
        {user: req.session.user, page: 'home', products, banners});
  },
  checkEmail: async (req, res, next)=> {
    User.findOne({email: req.query.email})
        .then((email)=> {
          if (email) {
            return res.json({success: false});
          }
          return res.json({success: true});
        }).catch((error)=> next(error));
  },
  forgotPassword: async (req, res, next)=> {
    try {
      const user = await User.findOne({email: req.body.email});
      if (!user) {
        return res.json({success: false, user: true});
      }
      const token = crypto.randomBytes(20).toString('hex');
      await sendEmail.sendUrl(req.body.email, token);
      user.token = token;
      await user.save();
      res.json({success: true});
    } catch (error) {
      next(error);
    };
  },
  getResetPassword: async (req, res, next)=> {
    const user = await User.findOne({token: req.params.token});
    if (user) {
      req.session.resetToken = req.params.token;
      return res.render('users/reset-password');
    }
    next(new Error('Invalid token'));
  },
  ResetPassword: async (req, res, next)=> {
    const user = await User.findOne({token: req.session.resetToken});
    if (user) {
      const password = await bcrypt.hash(req.body.password, 10);
      const update = {hashPassword: password, $unset: {token: 1}};
      await User.updateOne({token: req.session.resetToken}, update);
      delete req.session.resetToken;
      req.session.passwordReset = true;
      return res.redirect('/login');
    }
    next(new Error('Invalid token'));
  },
  checkPasswordExists: async (req, res, next)=> {
    const user = await User.findOne({token: req.session.resetToken});
    if (user) {
      const result = await bcrypt
          .compare(req.params.password, user.hashPassword);
      if (result) {
        return res.json({success: true, exists: true});
      };
      return res.json({success: true});
    }
    next(new Error('Invalid token'));
  },
};

