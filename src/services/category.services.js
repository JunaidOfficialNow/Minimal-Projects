/* eslint-disable require-jsdoc */

const categoryModel = require('../models/category.model');
const CategoryRepository = require('../repositories/category.repository');

class CategoryServices {
  constructor(repo) {
    this.repo = repo;
  }

  async checkCategoryExistsByName(name) {
    return await this.repo.checkCategoryExistsByName(name);
  };

  async getOldCategoryName(id) {
    return this.repo.getOldCategoryName(id);
  }

  async createCategory(data) {
    return await this.repo.createCategory(data);
  }
};

module.exports = new CategoryServices(new CategoryRepository(categoryModel));
