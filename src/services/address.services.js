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


  async addNewAddress(id, address) {
    let doc = await this.#repo.getAddressById(id);
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
    return await this.#repo.deleteAddress();
  }

  async getAddress(addressId, userId) {
    const addresses = await this.#repo.getAddressById(userId);
    const address =
         addresses
             .addresses
             .find((address)=> address._id.toString()=== addressId);
    return address;
  }

  async editAddress(id, editedAddress) {
    return await this.#repo.editAddress(id, editedAddress);
  }

  async verifyUserHasAddress(userId) {
    const addresses = await this.#repo.getAddressById(userId);
    if (addresses && addresses.addresses.length) return true;
    return false;
  }
};

module.exports = new AddressServices(
    AddressRepository.getInstance(),
    UserRepository.getInstance(),
);
