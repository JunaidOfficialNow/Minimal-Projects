/* eslint-disable require-jsdoc */
const couponModel = require('../models/coupon.model');
const CouponRepository = require('../repositories/coupon.repository');

class CouponServices {
  #repo;
  constructor(repo) {
    this.#repo = repo;
  }

  async getAllCoupons() {
    return await this.#repo.getAllCoupons();
  }

  async createNewCoupon(data) {
    return await this.#repo.createNewCoupon(data);
  }

  async getCouponById(id) {
    const coupon = await this.#repo.getCouponById(id);
    if (!coupon) throw new Error('This coupon might have already been deleted');
    return coupon;
  }

  async updateCouponStatus(id) {
    const coupon = await this.getCouponById(id);
    coupon.isActive = !coupon.isActive;
    const newCoupon = await this.#repo.saveDocument(coupon);
    return newCoupon.isActive;
  }

  async updateCouponById(id, updates) {
    return await this.#repo.updateCouponById(id, updates);
  }
}

module.exports = new CouponServices(
    new CouponRepository(couponModel),
);
