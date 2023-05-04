/* eslint-disable require-jsdoc */


class CategoryRepository {
  constructor(model) {
    this.model = model;
  }
  async checkCategoryExistsByName(name) {
    const doc = await this.model.findOne({name: name});
    if (doc) {
      throw new Error('Category already exists, should be unique');
    };
  }

  async getOldCategoryName(id) {
    const doc = await this.model.findById(id);
    if (doc) return doc.name;
    throw new Error('Category may have been deleted');
  }

  async createCategory(data) {
    return await this.model.create(data);
  }
}

module.exports = CategoryRepository;
