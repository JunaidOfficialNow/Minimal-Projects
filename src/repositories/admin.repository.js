
/* eslint-disable require-jsdoc */

const adminModel = require('../models/admin.model');
class AdminRepository {
  #model;
  static instance;
  constructor(model) {
    this.#model = model;
  }

  static getInstance() {
    if (!AdminRepository.instance) {
      AdminRepository.instance = new AdminRepository(adminModel);
    }
    return AdminRepository.instance;
  }

  async getAdminByEmail(email) {
    return await this.#model.findOne({email});
  }
};

module.exports = AdminRepository;
