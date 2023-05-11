/* eslint-disable require-jsdoc */
class AdminRepository {
  #model;
  constructor(model) {
    this.#model = model;
  }

  async getAdminByEmail(email) {
    return await this.#model.findOne({email});
  }
};

module.exports = AdminRepository;
