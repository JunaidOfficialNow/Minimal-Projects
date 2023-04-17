const Coupon = require('../../models/couponModel');

exports.getCouponsPage = (req, res, next) => {
  Coupon.find().then((coupons)=> {
    res.render('admins/admin-coupons', {admin: req.session.admin, coupons});
  }).catch((error)=> {
    next(error);
  });
};

exports.createCoupon = (req, res, next)=> {
  req.body.lastEditedBy = req.session.admin.firstName;
  Coupon.create(req.body).then(()=> {
    res.json({success: true});
  }).catch((error)=> {
    next(error);
  });
};

exports.changeCouponStatus = async (req, res, next)=> {
  try {
    const coupon = await Coupon.findById(req.body.id);
    if (coupon) {
      coupon.isActive = !coupon.isActive;
      const newCoupon = await coupon.save();
      return res.json({success: true, status: newCoupon.isActive});
    }
    throw new Error('Coupon not found');
  } catch (error) {
    next(error);
  };
};

exports.getCoupon = async (req, res, next)=> {
  try {
    const coupon = await Coupon.findById(req.params.id);
    res.json({success: true, coupon});
  } catch (error) {
    next(error);
  }
};

exports.updateCoupons = async (req, res, next)=> {
  try {
    const {id, ...details} = req.body;
    await Coupon.findByIdAndUpdate(id, details);
    res.json({success: true});
  } catch (error) {
    next(error);
  }
};


