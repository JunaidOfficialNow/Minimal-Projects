const catchAsync = require('../../utils/error-handlers/catchAsync.handler');
const authServices = require('../../services/auth.services');


exports.DoLogin = catchAsync(async (req, res, next)=>{
  const {email, password} = req.body;
  const user = await authServices.userLogin(email, password);
  req.session.user = user;
  res.json({success: true});
});

exports.DoLogout = (req, res, next)=>{
  req.session.destroy();
  res.redirect('/');
};


