/* eslint-disable require-jsdoc */


class CategoryRepository {
  constructor(model) {
    this.model = model;
  }
  async getCategoryByName(name) {
    return await this.model.findOne({name: name});
  }

  async getCategoryById(id) {
    return await this.model.findById(id);
  }

  async createCategory(data) {
    return await this.model.create(data);
  }

  async getAllCategories() {
    return await this.model.find({});
  }

  async deleteCategoryById(id) {
    return await this.model.findByIdAndRemove(id);
  }

  async updateCategoryById(id, updates, options) {
    return await this.model.findByIdAndUpdate(id, updates, options);
  }
}

module.exports = CategoryRepository;
