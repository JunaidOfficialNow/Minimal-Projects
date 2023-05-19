/* eslint-disable require-jsdoc */

const AddressRepository = require('../repositories/address.repository');
const UserRepository = require('../repositories/user.repository');
class AddressServices {
  #repo;
  #userRepo;
  static instance;
  constructor(repo, userRepo) {
    this.#repo = repo;
    this.#userRepo = userRepo;
  }

  async getUserAddressesById(id) {
    return await this.#repo.getAddressById(id);
  }

  async addNewAddress(id, address) {
    let doc = await this.getUserAddressesById(id);
    let isNew;
    if (doc) {
      doc.addresses.push(address);
      await this.#repo.saveDocument(doc);
      isNew = false;
    } else {
      doc = await this.#repo.createNewAddress({_id: id, addresses: [address]});
      await this.#userRepo.updateUserById(id, {isAddressAdded: true});
      isNew = true;
    }
    return {isNew, address: doc.addresses.slice(-1)[0]};
  }

  async deleteAddress(id, addressId) {
    return await this.#repo.updateAddressById(
        id,
        {$pull: {addresses: {_id: addressId}}},
    );
  }

  async getAddress(addressId, userId) {
    const addresses = await this.getUserAddressesById(id);
    const address =
         addresses
             .addresses
             .find((address)=> address._id.toString()=== addressId);
    return address;
  }

  async editAddress(id, data) {
    return await this.updateAddress(
        {'addresses._id': id},
        {'addresses.$': address},
    );
  }

  async verifyUserHasAddress(userId) {
    const addresses = await this.getUserAddressesById(userId);
    if (addresses && addresses.addresses.length) return true;
    return false;
  }
};

module.exports = new AddressServices(
    AddressRepository.getInstance(),
    UserRepository.getInstance(),
);
