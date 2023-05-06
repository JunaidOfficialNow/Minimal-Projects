/* eslint-disable require-jsdoc */

const categoryModel = require('../models/category.model');
const CategoryRepository = require('../repositories/category.repository');

// eslint-disable-next-line max-len
const CategoryNotFoundException = require('../utils/error-handlers/categoryNotFound.handler');


const fs = require('fs');
const path = require('path');
const deleteDirectory = require('../utils/deleteDirectory.util');

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
    throw new CategoryNotFoundException();
  }

  async createCategory(data) {
    return await this.repo.createCategory(data);
  }

  async getAllCategories() {
    return await this.repo.getAllCategories();
  }

  async getAllCategoryNames() {
    return await this.repo.getAllCategoryNames();
  }

  async deleteCategory(id) {
    return await this.repo.deleteCategoryById(id);
  }

  async updateCategoryStatus(id, status) {
    const doc = await this.repo.updateCategoryById(
        id,
        {isActive: status},
        {new: true},
    );
    if (!doc) {
      throw new CategoryNotFoundException();
    }
    return doc;
  }

  async getCategoryDetails(id) {
    const doc = await this.repo.getCategoryById(id);
    if (doc) {
      return doc;
    }
    throw new CategoryNotFoundException();
  };

  async catImageUpdate(id, oldImage, image) {
    // need to add some alternatives ot
  // handle the error cases of deleting the old image
    fs.unlink('src/public/static/uploads/category/'+oldImage);
    const doc = await this.repo.updateCategoryById(id, {image}, {new: true});
    if (!doc) {
      throw new CategoryNotFoundException();
    }
    return doc.image;
  }

  async deleteCategory(categoryImage, categoryName) {
    fs.unlink('src/public/static/uploads/category/'+ categoryImage);
    deleteDirectory('src/public/static/uploads/'+ categoryName);
  }

  async addCategoryImage(data) {
    try {
      const filePath = path.join(
          'src', 'public', 'static', 'uploads', data.name,
      );
      await fs.promises.mkdir(filePath);
    } catch (error) {
      throw new Error('There is a trouble creating the category');
    }

    return await this.createCategory(data);
  }

  async editCategory(name, description, id) {
    const details = {description};
    const oldName = await this.getOldCategoryName(id);
    if (oldName !== name) {
      details.name = name;
      const oldPath = path.join('src', 'public', 'static', 'uploads', oldName);
      const newPath = path.join('src', 'public', 'static', 'uploads', name);
      await this.checkCategoryExistsByName(name);
      try {
        await fs.promises.rename(oldPath, newPath);
      } catch (error) {
        throw new Error('There is  some trouble in updating the category name');
      }
    }
    const doc = await this.repo.updateCategoryById(id, details, {new: true});
    if (!doc) throw new CategoryNotFoundException();
    return doc;
  }
};

module.exports = new CategoryServices(
    new CategoryRepository(categoryModel),
);
