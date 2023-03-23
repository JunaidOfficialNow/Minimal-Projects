const User = require('../models/userModel');

module.exports = {
  changeAddressStatus: async (id) => {
    return User.findByIdAndUpdate(id, {isAddressAdded: true}).then(()=> {
      return Promise.resolve();
    }).catch((err)=> {
      return Promise.reject(err);
    });
  },
  addProfileImage: async (image, id)=> {
    const doc = await User.findById(id);
    doc.profilePicture = image;
    doc.isProfilePictureAdded = true;
    await doc.save();
    return Promise.resolve();
  },
  deleteAccount: async (id) => {
    try {
      await User.findByIdAndDelete(id);
      return Promise.resolve();
    } catch (e) {
      console.error(e);
    }
  },
  incCartCount: async (id) => {
    await User.findByIdAndUpdate(id, {$inc: {cartCount: 1}});
    return Promise.resolve();
  },
  decCartCount: async (id) => {
    await User.findByIdAndUpdate(id, {$inc: {cartCount: -1}});
    return Promise.resolve();
  },
  changeCartCount: async (id) => {
    try {
      await User.findByIdAndUpdate(id, {$set: {cartCount: 0}});
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
  editProfile: async (id, details) => {
    return User.findByIdAndUpdate(id, details).then(()=> {
      return Promise.resolve();
    }).catch((error)=> {
      return Promise.reject(error);
    });
  },
};
