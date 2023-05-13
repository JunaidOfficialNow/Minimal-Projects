const couponServices = require('../../services/coupon.services');
const catchAsync = require('../../utils/error-handlers/catchAsync.handler');


exports.getCouponsPage = catchAsync(async (req, res, next) => {
  const coupons = await couponServices.getAllCoupons();
  res.render('admins/admin-coupons', {
    admin: req.session.admin,
    coupons,
  });
});

exports.createCoupon = catchAsync(async (req, res, next)=> {
  req.body.lastEditedBy = req.session.admin.firstName;
  await couponServices.createNewCoupon(req.body);
  res.json({success: true});
});

exports.changeCouponStatus = catchAsync(async (req, res, next)=> {
  const status = await couponServices.updateCouponStatus(req.body.id);
  res.json({success: true, status});
});

exports.getCoupon = catchAsync(async (req, res, next)=> {
  const coupon = await couponServices.getCouponById(req.params.id);
  res.json({success: true, coupon});
});

exports.updateCoupons = catchAsync(async (req, res, next)=> {
  const {id, ...details} = req.body;
  await couponServices.updateCouponById(id, details);
  res.json({success: true});
});


