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

const changeCouponStatus = async (id) => {
  const coupon = await Coupon.findById(id);
  if (coupon) {
    coupon.isActive = !coupon.isActive;
    const newCoupon = await coupon.save();
    return Promise.resolve(newCoupon.isActive);
  }
  return Promise.reject(new Error('Coupon not found'));
};

const getCouponById = async (id) => {
  try {
    return await Coupon.findById(id);
  } catch (error) {
    Promise.reject(error);
  }
};

const updateCoupons = async (id, details)=> {
  try {
    return await Coupon.findByIdAndUpdate(id, details);
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  addCoupon,
  getCoupons,
  getCoupon,
  changeStock,
  changeCouponStatus,
  getCouponById,
  updateCoupons,
};

