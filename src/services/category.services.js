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

  async getAllCategories() {
    return await this.repo.getAllCategories();
  }

  async deleteCategory(id) {
    return await this.repo.deleteCategory(id);
  }

  async updateCategoryStatus(id, status) {
    return await this.repo.updateCategoryStatus(id, status);
  }
};

module.exports = new CategoryServices(new CategoryRepository(categoryModel));
