/* eslint-disable require-jsdoc */
const productModel = require('../models/product.model');
const ProductRepository = require('../repositories/product.repository');

class ProductServices {
  #repo;
  constructor(repo) {
    this.#repo = repo;
  }

  async updateProductsStatusByDesign(designCode, isActive) {
    await this.#repo.updateManyProducts({designCode}, {$set: {isActive}});
  }
};

module.exports = new ProductServices(
    new ProductRepository(productModel),
);
