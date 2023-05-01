const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    max: 20,
    min: 3,
  },
  lastName: {
    type: String,
    trim: true,
    max: 20,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  phoneNo: {
    type: String,
  },
  hashPassword: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
    required: true,
  },
  cartCount: {
    type: Number,
    default: 0,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  isCompleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAddressAdded: {
    type: Boolean,
    required: true,
    default: false,
  },
  isLastNameAdded: {
    type: Boolean,
    required: true,
    default: false,
  },
  isProfilePictureAdded: {
    type: Boolean,
    required: true,
    default: false,
  },
  token: String,

}, {timestamps: true});

module.exports = mongoose.model('users', userSchema);
