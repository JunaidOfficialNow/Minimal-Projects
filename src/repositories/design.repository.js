/* eslint-disable require-jsdoc */
class DesignRepository {
  #model;
  constructor(model) {
    this.#model = model;
  }

  async deleteAllOfTheCategory(categoryName) {
    await this.#model.deleteMany({category: categoryName});
  }

  async getAllDesigns() {
    return await this.#model.find({});
  }

  async createNewDesign(data) {
    return await this.#model.create(data);
  }

  async getDesignByCode(designCode) {
    return await this.#model.findOne({designCode});
  }

  async getUniqueDesigns() {
    return await this.#model.distinct('designCode');
  }

  async getDesignById(id) {
    return await this.#model.findById(id);
  }
};

module.exports = DesignRepository;
