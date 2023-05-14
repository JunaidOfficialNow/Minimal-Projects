/* eslint-disable require-jsdoc */
const userModel = require('../models/user.model');
const UserRepository = require('../repositories/user.repository');

class UserServices {
  #repo;
  constructor(repo) {
    this.#repo = repo;
  }

  async getAllUsers() {
    return await this.#repo.getAllUsers();
  }

  async updateUserBlockStatus(id, isBlocked) {
    return await this.#repo.updateUserById(id, {isBlocked});
  }
}

module.exports = new UserServices(
    new UserRepository(userModel),
);
