const {Schema, model} = require('mongoose');

// eslint-disable-next-line new-cap
const categorySchema = Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  lastEditedBy: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {timestamps: true});

module.exports = model('categories', categorySchema);

