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

  async updateAddressById(id, updates, options) {
    return await this.#model.findByIdAndUpdate(id, updates, options);
  }

  async updateAddress(queryCriteria, updates, options) {
    return await this.#model.updateOne(queryCriteria, updates, options);
  };
};

module.exports = AddressRepository;
