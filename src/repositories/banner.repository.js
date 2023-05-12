/* eslint-disable require-jsdoc */
class BannerRepository {
  #model;
  constructor(model) {
    this.#model = model;
  }

  async getAllBanners() {
    return await this.#model.find();
  }

  async getBannerByName(name) {
    return await this.#model.findOne({name});
  }

  async udpateBannerById(id, updates, options) {
    return await this.#model.findByIdAndUpdate(id, updates, options);
  }
}

module.exports = BannerRepository;
