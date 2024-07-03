const catchAsync = require('../../utils/error-handlers/catchAsync.handler');
const userServices = require('../../services/user.services');

exports.handleEmail = catchAsync(async (req, res, next)=>{
  const {email} = req.body;
  const otp = await userServices.handleEmail(email);
  req.session.userDetails = {email, otp};
  res.json({success: true});
});

exports.handleOtp = catchAsync(async (req, res)=>{
  if (req.body.otp == req.session.userDetails.otp) {
    delete req.session.userDetails.otp;
    res.json({success: true});
  } else {
    throw new Error('Otp does not match');
  };
});

exports.handleNames = catchAsync(async (req, res, next)=>{
  const lastName = req.body.lastName;
  req.session.userDetails.firstName = req.body.firstName;
  // need  to check if the last name is null or not to use nullish operator
  req.session.userDetails.lastName = lastName;
  if (lastName.length > 0) {
    req.session.userDetails.isLastNameAdded = true;
  }
  res.json({});
});

exports.handlePassword = catchAsync(async (req, res, next)=>{
  const user = await userServices.createAccount(
      req.session.userDetails,
      req.body.password,
  );
  delete req.session.userDetails;
  req.session.user = user;
  res.json({success: true});
});

exports.handleResendOtp = catchAsync( async (req, res, next)=>{
  const otp = await userServices.resendOtp(req.session.userDetails.email);
  console.log(otp);
  req.session.userDetails.otp = otp;
  res.json({success: true});
});

exports.getResetPassword = catchAsync(async (req, res, next)=> {
  await userServices.verifyToken(req.params.token);
  req.session.resetToken = req.params.token;
  res.render('users/reset-password');
});


exports.resetPassword = catchAsync(async (req, res, next)=> {
  await userServices.resetPassword(req.session.resetToken, req.body.password);
  delete req.session.resetToken;
  req.session.passwordReset = true;
  res.redirect('/login');
});

exports.checkPasswordExists = catchAsync(async (req, res, next)=> {
  await userServices.validatePassword(
      req.session.resetToken,
      req.params.password,
  );
  return res.json({success: true});
});

exports.sendPasswordResetToken = catchAsync(async (req, res, next)=> {
  await userServices.sendResetToken(req.body.email);
  res.json({success: true});
});
