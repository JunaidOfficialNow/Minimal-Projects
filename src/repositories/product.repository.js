const productModel = require('../models/product.model');
class ProductRepository {
  #model;
  static instance;
  constructor(model) {
    this.#model = model;
  }

  static getInstance() {
    if (!ProductRepository.instance) {
      ProductRepository.instance = new ProductRepository(productModel);
    }
    return ProductRepository.instance;
  }

  async getAllProducts() {
    return await this.#model.find();
  }

  async createNewProduct(data) {
    return await this.#model.create(data);
  }

  async updateManyProducts(criteria, updates, options) {
    return await this.#model.updateMany(criteria, updates, options);
  }

  async getProductById(id) {
    return await this.#model.findById(id);
  }

  async saveDocument(doc) {
    return await doc.save();
  }

  async updateOneById(id, updates, options) {
    return await this.#model.findByIdAndUpdate(id, updates, options);
  }
};

module.exports = ProductRepository;
