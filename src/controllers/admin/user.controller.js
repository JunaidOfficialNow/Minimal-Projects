const User = require('../../models/user.model');

exports.blockUser = async (req, res, next)=>{
  User.findByIdAndUpdate(req.body.id, {isBlocked: true}).then((response)=> {
    if (response) {
      res.json({success: true});
    } else {
      res.json({succcess: false});
    }
  }).catch((error)=> next(error));
};

exports.unblockUser = (req, res, next)=>{
  User.findByIdAndUpdate(req.body.id, {isBlocked: false}).then((response)=>{
    res.json({success: true});
  }).catch((err)=>{
    next(err);
  });
};

exports.getUsers = (req, res, next)=>{
  User.find().then((users)=>{
    res.json(users);
  }).catch((err)=>{
    next(err);
  });
};


