/* eslint-disable require-jsdoc */
class DesignRepository {
  constructor(model) {
    this.model = model;
  }

  async deleteAllOfTheCategory(categoryName) {
    await this.model.deleteMany({category: categoryName});
  }
};

module.exports = DesignRepository;
