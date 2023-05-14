const userServices = require('../../services/user.services');
const catchAsync = require('../../utils/error-handlers/catchAsync.handler');

exports.blockUser = catchAsync(async (req, res, next)=>{
  await userServices.updateUserBlockStatus(req.body.id, true);
  res.json({success: true});
});

exports.unblockUser =catchAsync(async (req, res, next)=>{
  await userServices.updateUserBlockStatus(req.body.id, false);
  res.json({success: true});
});

exports.getUsers = catchAsync(async (req, res, next)=>{
  const users = await userServices.getAllUsers();
  res.json(users);
});


