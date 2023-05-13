/* eslint-disable require-jsdoc */
class CouponRepository {
  #model;
  constructor(model) {
    this.#model = model;
  }

  async getAllCoupons() {
    return await this.#model.find();
  }

  async createNewCoupon(data) {
    return await this.#model.create(data);
  }

  async updateCouponById(id, updates, options) {
    return await this.#model.findByIdAndUpdate(id, updates, options);
  }

  async getCouponById(id) {
    return await this.#model.findById(id);
  }

  async saveDocument(doc) {
    return await doc.save();
  }
}

module.exports = CouponRepository;
