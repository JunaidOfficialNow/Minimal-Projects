// eslint-disable-next-line new-cap
const {Schema, model} = require('mongoose');

const ratingSchema = new Schema({
  1: {
    type: Number,
    required: true,
    default: 0,
  },
  2: {
    type: Number,
    required: true,
    default: 0,
  },
  3: {
    type: Number,
    required: true,
    default: 0,
  },
  4: {
    type: Number,
    required: true,
    default: 0,
  },
  5: {
    type: Number,
    required: true,
    default: 0,
  },
}, {_id: false});

const sizeSchema = new Schema({
  size: {
    type: String,
    required: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
  },
}, {_id: false});

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  designCode: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    trim: true,
  },
  sizes: {
    type: [sizeSchema],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  exactColor: {
    type: String,
    required: true,
    trim: true,
  },
  broadColor: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  images: {
    type: [String],
    required: true,
  },
  lastEditedBy: {
    type: String,
    required: true,
    trim: true,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  reviews: {
    type: Number,
    required: true,
    default: 0,
  },
  isCodAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  rating: {
    type: ratingSchema,
    required: true,
    default: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  },
}, {timestamps: true});

module.exports = model('products', productSchema);
