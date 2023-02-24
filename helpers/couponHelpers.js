const Coupon = require('../models/couponModel');

const addCoupon = async (details)=> {
  return await Coupon.create(details);
};
const getCoupons = async ()=> {
  return await Coupon.find();
};

const getCoupon= async (coupon)=> {
  return await Coupon.findOne({couponCode: coupon});
};

const changeStock = async (coupon, value)=> {
  return await Coupon.updateOne({couponCode: coupon},
      {$inc: {usageLimit: value}});
};

module.exports = {
  addCoupon,
  getCoupons,
  getCoupon,
  changeStock,
};

