/* eslint-disable require-jsdoc */


class CategoryRepository {
  #model;
  constructor(model) {
    this.#model = model;
  }
  async getCategoryByName(name) {
    return await this.#model.findOne({name: name});
  }

  async getCategoryById(id) {
    return await this.#model.findById(id);
  }

  async createCategory(data) {
    return await this.#model.create(data);
  }

  async getAllCategories() {
    return await this.#model.find({});
  }

  async getAllCategoryNames() {
    return await this.#model.find({}).select('name -_id');
  }

  async getCategoryName(id) {
    return await this.#model.findById(id).select('name -_id');
  }

  async deleteCategoryById(id) {
    return await this.#model.findByIdAndRemove(id);
  }

  async updateCategoryById(id, updates, options) {
    return await this.#model.findByIdAndUpdate(id, updates, options);
  }
}

module.exports = CategoryRepository;
