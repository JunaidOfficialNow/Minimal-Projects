const {Schema, model} = require('mongoose');

const designSchema = new Schema({
  designCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  colors: {
    type: [String],
    required: true,
  },
  sizes: {
    type: [String],
    required: true,
  },
  lastEditedBy: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  expectedPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  stock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {timestamps: true});

module.exports = model('design', designSchema);
