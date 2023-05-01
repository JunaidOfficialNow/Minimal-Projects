const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    min: 3,
    max: 20,
  },
  lastName: {
    type: String,
    trim: true,
    max: 20,
  },
  email: {
    type: String,
    trim: true,
    lowerCase: true,
    unique: true,
    required: true,
  },
  phoneNo: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  hashPassword: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    required: true,
    default: false,
  },
  isActivated: {
    type: Boolean,
    required: true,
    default: false,
  },
  profilePicture: {
    type: String,
  },
  superAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  orderManager: {
    type: Boolean,
    required: true,
    default: false,
  },
  userManager: {
    type: Boolean,
    required: true,
    default: false,
  },
  productManager: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = mongoose.model('admins', adminSchema);
