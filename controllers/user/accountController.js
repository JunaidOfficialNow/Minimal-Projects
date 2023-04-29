const sendEmail = require('../../services/email-otp');
const User = require('../../models/userModel');
const bcrypt = require('bcrypt');

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

exports.getResetPassword = async (req, res, next)=> {
  const user = await User.findOne({token: req.params.token});
  if (user) {
    req.session.resetToken = req.params.token;
    return res.render('users/reset-password');
  }
  next(new Error('Invalid token'));
};


exports.resetPassword = async (req, res, next)=> {
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
};

exports.checkPasswordExists = async (req, res, next)=> {
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
};

exports.sendPasswordResetToken = async (req, res, next)=> {
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
};
