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

  async getProductById(id) {
    const doc = await this.#repo.getProductById(id);
    if (!doc) throw new Error('Product may have already been deleted');
    return doc;
  }

  async getAllProducts() {
    return await this.#repo.getAllProducts();
  }

  async createNewProduct(data) {
    await this.#repo.createNewProduct(data);
  }

  async updateCODStatus(id) {
    const doc = await this.getProductById(id);
    doc.isCodAvailable = !doc.isCodAvailable;
    const newDoc = await this.#repo.saveDocument(doc);
    return newDoc.isCodAvailable;
  }

  async updateActiveStatus(id) {
    const doc = await this.getProductById(id);
    doc.isActive = !doc.isActive;
    const newDoc = await this.#repo.saveDocument(doc);
    return newDoc.isActive;
  }

  async updateProduct(id, updates, images) {
    const doc = this.#repo.updateOneById(id, updates, {new: true});
    images.forEach((image)=> {
      doc.images.push(image);
    });
    await this.#repo.saveDocument(doc);
  }
};

module.exports = new ProductServices(
    new ProductRepository(productModel),
);
