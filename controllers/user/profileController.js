const User = require('../../models/userModel');
const Address = require('../../models/addressModel');

exports.getProfilePage = (req, res)=> {
  res.render('users/user-profile', {page: 'profile', user: req.session.user});
};


exports.addProfilePhoto = async (req, res, next)=> {
  try {
    const doc = await User.findById(req.session.user._id);
    doc.profilePicture = req.files[0].filename;
    doc.isProfilePictureAdded = true;
    await doc.save();
    req.session.user.profilePicture = req.files[0].filename;
    req.session.user.isProfilePictureAdded = true;
    res.json({success: true});
  } catch (error) {
    next(error);
  }
};

// needs to verify the relevance of this route
exports.getImage = (req, res) => {
  res.sendFile(`../profiles/${req.params.image}`, {root: __dirname});
};

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.body.id;
    await User.findByIdAndDelete(id);
    await Address.findByIdAndDelete(id);
    delete req.session.user;
    res.json({success: true});
  } catch (error) {
    next(error);
  }
};

// needs to test this route because the logic updated
exports.editProfile = async (req, res, next) => {
  try {
    const {email, phoneNo, firstName, lastName} = req.body;
    const user = {
      email,
      phoneNo,
      firstName,
      lastName,
    };
    await User.findByIdAndUpdate(req.session.user._id, user);
    Object.assign(req.session.user, user);
    res.json({success: true});
  } catch (error) {
    next(error);
  }
};
