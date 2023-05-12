/* eslint-disable require-jsdoc */
const bannerModel = require('../models/banner.model');
const BannerRepository = require('../repositories/banner.repository');

class BannerServices {
  #repo;
  constructor(repo) {
    this.#repo = repo;
  }

  async getAllBanners() {
    return await this.#repo.getAllBanners();
  }

  async getBannerByName(name) {
    return await this.#repo.getBannerByName(name);
  }

  async updateBannerById(id, data) {
    return await this.#repo.udpateBannerById(id, data);
  }

  async checkBannerExistsByName(name) {
    if (await this.getBannerByName(name)) {
      throw new Error('Banner name already exists');
    }
  }
}

module.exports = new BannerServices(
    new BannerRepository(bannerModel),
);
