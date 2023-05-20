/* eslint-disable require-jsdoc */
const addressModel = require('../models/address.model');

class AddressRepository {
  #model;
  static instance;
  constructor(model) {
    this.#model = model;
  }

  static getInstance() {
    if (!AddressRepository.instance) {
      AddressRepository.instance = new AddressRepository(addressModel);
    }
    return AddressRepository.instance;
  }

  async getAddressById(id) {
    return await this.#model.findById(id);
  }

  async createNewAddress(data) {
    return await this.#model.create(data);
  }

  async saveDocument(doc) {
    return await doc.save();
  }


  async deleteAddress(id, addressId) {
    return await this.#model.findByIdAndUpdate(
        id,
        {$pull: {addresses: {_id: addressId}}},
    );
  }

  async editAddress(id, editedAddress) {
    return await this.#model.updateOne(
        {'addresses._id': id},
        {'addresses.$': editedAddress},
    );
  };
};

module.exports = AddressRepository;
