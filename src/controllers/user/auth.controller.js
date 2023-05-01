const User = require('../../models/user.model');
const bcrypt = require('bcrypt');


exports.DoLogin = async (req, res, next)=>{
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email: email});
    if (user) {
      if (user.isBlocked) {
        res.json({blocked: true});
      } else {
        const passMatch = await bcrypt.compare(password, user.hashPassword);
        if (passMatch) {
          req.session.user = user;
          res.json({success: true});
        } else {
          res.json({user: true});
        }
      };
    } else {
      res.json({success: false});
    }
  } catch (error) {
    next(error);
  }
};

exports.DoLogout = (req, res, next)=>{
  req.session.destroy();
  res.redirect('/');
};


