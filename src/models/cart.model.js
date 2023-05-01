const {Schema, model} = require('mongoose');

const productsSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'products',
  },
  quantity: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
    default: 'S',
  },
});

const cartSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  products: {
    type: [productsSchema],
    required: true,
  },
  coupon: {
    type: String,
    uppercase: true,
    trim: true,
  },
  discount: {
    type: Number,
  },
});

module.exports = model('carts', cartSchema);
