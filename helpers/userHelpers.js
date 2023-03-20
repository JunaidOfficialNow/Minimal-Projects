const User = require('../models/userModel');

module.exports = {
  blockUser: (id) => {
    return new Promise((resolve, reject)=>{
      User.findByIdAndUpdate(id, {isBlocked: true}).then((response)=>{
        resolve(response);
      }).catch((err)=>{
        reject(err);
      });
    });
  },
  unblockUser: (id) => {
    return new Promise((resolve, reject)=>{
      User.findByIdAndUpdate(id, {isBlocked: false}).then((response)=>{
        resolve(response);
      }).catch((err)=>{
        reject(err);
      });
    });
  },
  getAllUsers: ()=>{
    return new Promise((resolve, reject)=>{
      User.find().then((users)=>{
        resolve(users);
      }).catch((err)=>{
        reject(err);
      });
    });
  },
  checkBlocked: (email)=>{
    return new Promise((resolve, reject)=>{
      User.findOne({email: email}).then((doc)=>{
        if (doc) {
          if (doc.isBlocked) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  },
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
  saveToken: async (email, token)=> {
    const user = await User.findOne({email: email});
    if (user) {
      user.token = token;
      return await user.save();
    }
    return new Error('Couldn\'t find the user');
  },
  checkToken: async (token)=> {
    return await User.findOne({token: token});
  },
  resetPassword: async (token, password)=> {
    const update = {hashPassword: password, $unset: {token: 1}};
    await User.updateOne({token: token}, update);
  },
};
