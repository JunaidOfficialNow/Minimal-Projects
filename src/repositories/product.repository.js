/* eslint-disable require-jsdoc */
class ProductRepository {
  #model;
  constructor(model) {
    this.#model = model;
  }

  async updateManyProducts(criteria, updates, options) {
    return await this.#model.updateMany(criteria, updates, options);
  }
};

module.exports = ProductRepository;
