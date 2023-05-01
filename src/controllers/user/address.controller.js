const Address = require('../../models/address.model');

exports.addAddress = async (req, res, next)=> {
  try {
    const {id, address} = req.body;
    let doc = await Address.findById(id);
    if (!doc) {
      doc = await Address.create({_id: id, addresses: [address]});
      await User.findByIdAndUpdate(id, {isAddressAdded: true});
      req.session.user.isAddressAdded = true;
      res.json({success: true, new: true,
        address: doc.addresses.slice(-1)[0]});
    } else {
      doc.addresses.push(address);
      await doc.save();
      res.json({success: true, address: doc.addresses.slice(-1)[0]});
    }
  } catch (err) {
    next(err);
  }
};


exports.getAddress = (req, res, next) => {
  Address.findById(req.body.id).then((address)=> {
    if (address) {
      return res.json(address.addresses);
    }
    res.json([]);
  }).catch((err) => {
    next(err);
  });
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const {id, addressId} = req.body;
    await Address.findByIdAndUpdate(id,
        {$pull: {addresses: {_id: addressId}}});
    res.json({success: true});
  } catch (err) {
    next(err);
  }
};

exports.getOneAddress = async (req, res, next)=> {
  try {
    const {addressId, userId} = req.body;
    const address = await Address.findById(userId);
    const spAddress =
    address.addresses.find((address)=> address._id.toString() === addressId);
    res.json(spAddress);
  } catch (error) {
    next(error);
  }
};

// need to make these 2 functions one
exports.getOneEditAddress = async (req, res, next) => {
  try {
    const id = req.params.id;
    const address = await Address.findById(req.session.user._id);
    const spAddress =
     address.addresses.find((address)=> address._id.toString() === id);
    if (spAddress) {
      return res.json({success: true, address: spAddress});
    }
    return res.json({success: false});
  } catch (error) {
    next(error);
  }
};


exports.editAddress = async (req, res, next)=> {
  const {id, ...address} = req.body;
  await Address.updateOne({'addresses._id': id},
      {'addresses.$': address}).then(()=> {
    res.json({success: true});
  }).catch((err)=> {
    next(err);
  });
};

exports.checkAddress = async (req, res, next)=> {
  try {
    const address = await Address.findById(req.session.user._id);
    if (address) {
      if (address.addresses.length > 0) {
        return res.json({success: true});
      }
    }
    return res.json({success: false});
  } catch (error) {
    next(error);
  }
};
