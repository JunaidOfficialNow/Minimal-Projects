const {Schema, model} = require('mongoose');

const couponSchema = new Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  purchaseAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 0,
  },
  offerUpto: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  lastEditedBy: {
    type: String,
    required: true,
  },
}, {timestamps: true});

module.exports = model('coupons', couponSchema);

