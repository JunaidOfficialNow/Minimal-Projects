/* eslint-disable require-jsdoc */

const userModel = require('../models/user.model');
class UserRepository {
  #model;
  static instance;
  constructor(model) {
    this.#model = model;
  }

  static getInstance() {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository(userModel);
    }
    return UserRepository.instance;
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

  async changeCartCount(userId, count) {
    return await this.#model.findByIdAndUpdate(
        userId,
        {$inc: {cartCount: count}},
    );
  }
}

module.exports = UserRepository;
