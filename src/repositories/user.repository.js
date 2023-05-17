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

  async getUserByEmail(email) {
    return await this.#model.findOne({email});
  }

  async addNewUser(data) {
    return await this.#model.create(data);
  }

  async getUserByToken(token) {
    return await this.#model.findOne({token});
  }

  async saveDocument(doc) {
    return await doc.save();
  }
}

module.exports = UserRepository;
