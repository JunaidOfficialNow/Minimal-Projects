const {Schema, model} = require('mongoose');


const billingAddress = new Schema({
  name: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
}, {_id: false});


const productModel = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
}, {_id: false});

const orderModel = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'Confirmed',
    enum: ['Confirmed', 'Delivered', 'Cancelled',
      'Return processing', 'Return Confirmed',
      'Returned', 'Shipped', 'Refunded'],
  },
  billingAddress: billingAddress,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'ONLINE'],
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  coupon: {
    type: String,
    required: true,
    trim: true,
  },
  products: [productModel],

}, {timestamps: true});

module.exports = model('orders', orderModel);
