const User = require('../models/userModel');
module.exports = {
  checkLogin: (req, res, next)=>{
    if ( req.session.user) {
      res.redirect('/');
    } else {
      next();
    }
  },
  verifyLogin: (req, res, next)=>{
    if (req.session.user) {
      User.findOne({email: req.session.user.email}).then((doc)=>{
        if (doc) {
          if (doc.isBlocked) {
            req.session.userMessage =
            'Your account has been blocked by the admin';
            delete req.session.user;
            res.redirect('/login');
          } else {
            next();
          }
        } else {
          req.session.userMessage =
          'Your account has been deleted somehow';
          delete req.session.user;
          res.redirect('/login');
        }
      }).catch((err)=> next(err));
    } else {
      req.session.signin = true;
      res.redirect('/login');
    }
  },
  checkAdminLoggedIn: (req, res, next)=>{
    if (req.session.adminLoggedIn) {
      res.redirect('/admin/home');
    } else {
      next();
    }
  },
};
