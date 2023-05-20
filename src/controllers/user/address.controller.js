const addressServices = require('../../services/address.services');
const catchAsync = require('../../utils/error-handlers/catchAsync.handler');

exports.addAddress = catchAsync(async (req, res, next)=> {
  const {id, address} = req.body;
  const {isNew, newAddress} = addressServices.addNewAddress(id, address);
  res.json({
    success: true,
    address: newAddress,
    new: isNew,
  });
});


exports.getAddress = catchAsync(async (req, res, next) => {
  const address = addressServices.getAllAddresses(req.body.id);
  res.json(address);
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const {id, addressId} = req.body;
  await addressServices.deleteAddress(id, addressId);
  res.json({success: true});
});

exports.getOneAddress = catchAsync(async (req, res, next)=> {
  const {addressId, userId} = req.body;
  const address = await addressServices.getAddress(addressId, userId);
  res.json(address);
});

// need to make these 2 functions one
exports.getOneEditAddress = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const address = await addressServices.getAddress(id, req.session.user._id);
  res.json({success: address.length ? true : false, address});
});


exports.editAddress = catchAsync(async (req, res, next)=> {
  const {id, ...address} = req.body;
  await addressServices.editAddress(id, address);
  res.json({success: true});
});

exports.checkAddress = catchAsync(async (req, res, next)=> {
  const success = await addressServices
      .verifyUserHasAddress(req.session.user._id);
  return res.json({success});
});
