/* eslint-disable require-jsdoc */

const categoryModel = require('../models/category.model');
const CategoryRepository = require('../repositories/category.repository');

class CategoryServices {
  constructor(repo) {
    this.repo = repo;
  }

  async checkCategoryExistsByName(name) {
    const doc = await this.repo.getCategoryByName(name);
    if (doc) {
      throw new Error('Category already exists, should be unique');
    };
  };

  async getOldCategoryName(id) {
    const doc = await this.repo.getCategoryById(id);
    if (doc) {
      return doc.name;
    }
    throw new Error('Category may have been deleted');
  }

  async createCategory(data) {
    return await this.repo.createCategory(data);
  }

  async getAllCategories() {
    return await this.repo.getAllCategories();
  }

  async deleteCategory(id) {
    return await this.repo.deleteCategoryById(id);
  }

  async updateCategoryStatus(id, status) {
    return await this.repo.updateCategoryById(
        id,
        {isActive: status},
        {new: true},
    );
  }

  async getCategoryDetails(id) {
    const doc = await this.repo.getCategoryById(id);
    if (doc) {
      return doc;
    }
    throw new Error('Category may have already been deleted');
  };
};

module.exports = new CategoryServices(new CategoryRepository(categoryModel));
