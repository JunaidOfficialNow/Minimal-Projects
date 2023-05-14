/* eslint-disable require-jsdoc */
class UserRepository {
  #model;
  constructor(model) {
    this.#model = model;
  }

  async updateUserById(id, updates, options) {
    return await this.#model.findByIdAndUpdate(id, updates, options);
  }

  async getAllUsers() {
    return await this.#model.find();
  }
}

module.exports = UserRepository;
