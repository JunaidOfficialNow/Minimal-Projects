const User = require('../../models/userModel');
const sendEmail = require('../../services/email-otp');
const bcrypt = require('bcrypt');

exports.getLoginPage = (req, res)=>{
  const reset = req.session.passwordReset;
  const signin = req.session.signin;
  const messages = req.session.userMessage;
  delete req.session.userMessage;
  delete req.session.passwordReset;
  delete req.session.signin;
  res.render('users/user-login', {reset, signin, messages});
};

exports.handleEmail = async (req, res, next)=>{
  try {
    const {email} = req.body;
    const user = await User.findOne({email: email});
    if (user) {
      res.json({user: true});
    } else {
      const otp = await sendEmail.sendOtp(email);
      console.log(otp);
      req.session.userDetails = {email, otp};
      res.json({success: true});
    };
  } catch (error) {
    next(error);
  }
};

exports.handleOtp = (req, res)=>{
  if (req.body.otp == req.session.userDetails.otp) {
    delete req.session.userDetails.otp;
    res.json({success: true});
  } else {
    res.json({success: false});
  };
};

exports.handleNames = (req, res, next)=>{
  const lastName = req.body.lastName;
  req.session.userDetails.firstName = req.body.firstName;
  // need  to check if the last name is null or not to use nullish operator
  req.session.userDetails.lastName = lastName;
  if (lastName.length > 0) {
    req.session.userDetails.isLastNameAdded = true;
  }
  res.json({});
};

exports.handlePassword = async (req, res, next)=>{
  try {
    const pass = await bcrypt.hash(req.body.password, 10);
    const userDetails = req.session.userDetails;
    userDetails.hashPassword = pass;
    const user = await User.create(userDetails);
    delete req.session.userDetails;
    req.session.user = user;
    res.json({success: true});
  } catch (error) {
    next(error);
  };
};

exports.handleResendOtp = (req, res, next)=>{
  sendEmail.resendOtp(req.session.userDetails.email).then((otp)=>{
    console.log(otp);
    req.session.userDetails.otp = otp;
    res.json({success: true});
  }).catch((err)=>{
    res.json({success: false});
  });
};

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


