
const catchAsync = require('../../utils/error-handlers/catchAsync.handler');
const authServices = require('../../services/auth.services');

const apis = {
  login: process.env.ADMIN_LOGIN_API,
  otp: process.env.ADMIN_OTP_API,
};

exports.DoLogin = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;
  const {admin, otp} = await authServices.adminLogin(password, email);
  req.session.admin = admin;
  req.session.adminOtp = otp;
  console.log('admin otp ', otp);
  res.json({success: true});
});

exports.verifyOtp = (req, res, next)=>{
  if (req.body.otp == req.session.adminOtp) {
    delete req.session.adminOtp;
    req.session.adminLoggedIn = true;
    res.json({success: true});
  } else {
    res.json({success: false});
  }
};

exports.resendOtp = catchAsync(async (req, res, next)=>{
  const otp = await authServices.resendOtp(req.session.admin.email);
  req.session.admin.otp = otp;
  res.json({success: true});
});

exports.DoLogout = (req, res, next)=>{
  delete req.session.adminLoggedIn;
  delete req.session.admin;
  res.redirect('/');
};

exports.getLogin = (req, res, next) => {
  res.render('admins/admin-login', apis);
};

