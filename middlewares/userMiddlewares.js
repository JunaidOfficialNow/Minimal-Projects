const {checkBlocked} = require('../helpers/userHelpers');
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
      next();
    } else {
      res.redirect('/');
    }
  },
  checkAdminLoggedIn: (req, res, next)=>{
    if (req.session.adminLoggedIn) {
      res.redirect('/admin/home');
    } else {
      next();
    }
  },
  checkBlocked: (req, res, next)=>{
    if (req.session.user) {
      checkBlocked(req.session.user.email).then((response)=>{
        if (response) {
          req.session.userMessage =
          'Your account has been blocked by the admin';
          delete req.session.user;
          res.redirect('/');
        } else {
          next();
        }
      });
    } else {
      next();
    }
  },
};
