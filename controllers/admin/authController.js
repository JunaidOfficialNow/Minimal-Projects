const Admin = require('../../models/adminModel');
const sendEmail = require('../../helpers/email-otp');
const bcrypt = require('bcrypt');
const apis = {
  login: process.env.ADMIN_LOGIN_API,
  otp: process.env.ADMIN_OTP_API,
};
exports.DoLogin = async (req, res, next) => {
  try {
    const {email, password} = req.body;
    const admin = await Admin.findOne({email: email});
    if (admin) {
      const result = await bcrypt.compare(password, admin.hashPassword);
      if (result) {
        req.session.admin = admin;
        const otp = await sendEmail.sendOtp(email);
        req.session.adminOtp = otp;
        console.log('admin otp ', otp);
        res.json({success: true});
      } else {
        res.json({admin: true});
      }
    } else {
      res.json({success: false});
    }
  } catch (error) {
    // res.json({otp: true});
    next(error);
  };
};

exports.verifyOtp = (req, res, next)=>{
  if (req.body.otp == req.session.adminOtp) {
    delete req.session.adminOtp;
    req.session.adminLoggedIn = true;
    res.json({success: true});
  } else {
    res.json({success: false});
  }
};

exports.resendOtp = (req, res, next)=>{
  sendEmail.resendOtp(req.session.admin.email).then((otp)=>{
    req.session.admin.otp = otp;
    res.json({success: true});
  }).catch((err)=>{
    res.json({success: false});
  });
};

exports.DoLogout = (req, res, next)=>{
  delete req.session.adminLoggedIn;
  delete req.session.admin;
  res.redirect('/');
};

exports.getLogin = (req, res, next) => {
  res.render('admins/admin-login', apis);
};

