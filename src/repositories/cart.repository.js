/* eslint-disable require-jsdoc */
const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');

class CartRepository {
  #model;
  #productModel;
  static instance;
  constructor(model, productModel) {
    this.#model = model;
    this.#productModel = productModel;
  }

  static getInstance() {
    if (!CartRepository.instance) {
      CartRepository.instance = new CartRepository(cartModel, productModel);
    }
    return CartRepository.instance;
  }

  async getCartById(id) {
    return await this.#model.findById(id);
  }

  async getPopulatedCartById(id) {
    return await this.#model.findById(id).populate({
      path: 'products._id',
      model: this.#productModel,
    });
  }

  async createNewCart(data) {
    return await this.#model.create(data);
  }

  async removeFromCart(userId, proId) {
    return await this.#model.findByIdAndUpdate(
        userId,
        {$pull: {products: {_id: proId}}},
    );
  }

  async changeQuantity(userId, proId, quantity) {
    return await this.#model.updateOne(
        {'_id': userId, 'products._id': proId},
        {$inc: {'products.$.quantity': quantity}},
    );
  }

  async changeSize(userId, proId, size) {
    return await this.#model.updateOne(
        {'_id': userId, 'products._id': proId},
        {$set: {'products.$.size': size}},
    );
  }

  async saveDocument(doc) {
    return await doc.save();
  }
}

module.exports = CartRepository;
