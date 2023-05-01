module.exports = {
  verifyLogin: (req, res, next)=>{
    if (req.session.adminLoggedIn) {
      next();
    } else {
      res.redirect('/admin');
    }
  },
  checkLogin: (req, res, next)=>{
    if (req.session.adminLoggedIn) {
      res.redirect('/admin/home');
    } else {
      next();
    }
  },
  checkUserLogin: (req, res, next)=>{
    if (req.session.user) {
      res.redirect('/');
    } else {
      next();
    }
  },
  checkCsrf: (req, res, next)=> {
    if (req.session.adminCsrf !== req.header('X-CSRF-Token')) {
      delete req.session.adminCsrf;
      res.json({csrf: false});
    } else {
      delete req.session.adminCsrf;
      next();
    };
  },

};
