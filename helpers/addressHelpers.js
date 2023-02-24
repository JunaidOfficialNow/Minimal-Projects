const Address = require('../models/addressModel');
module.exports = {
  addAddress: async (id, address) => {
    try {
      let doc = await Address.findById(id);
      if (!doc) {
        doc = await Address.create({_id: id, addresses: [address]});
        return Promise.resolve({new: true});
      } else {
        doc.addresses.push(address);
        await doc.save();
      }
      return Promise.resolve({new: false});
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  },
  getAddress: async (id) => {
    return Address.findById(id).then((address)=> {
      if (address) {
        return Promise.resolve(address.addresses);
      }
      return Promise.resolve([]);
    }).catch((err) => {
      return Promise.reject(err);
    });
  },
  deleteAddress: async (id, addressId) => {
    try {
      await Address.findByIdAndUpdate(id,
          {$pull: {addresses: {_id: addressId}}});
      return Promise.resolve();
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  },
  deleteAccount: async (id) => {
    await Address.findByIdAndDelete(id);
  },
  getOneAddress: async (id, userId) => {
    const address = await Address.findById(userId);
    const spAddress = address.addresses.find((address)=> {
      return address._id.toString() === id;
    });
    return Promise.resolve(spAddress);
  },
  editAddress: async (id, address)=> {
    return Address.updateOne({'addresses._id': id},
        {'addresses.$': address})
        .then(()=> {
          return Promise.resolve();
        }).catch((err)=> {
          return Promise.reject(err);
        });
  },
};
