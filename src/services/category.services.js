/* eslint-disable require-jsdoc */

const categoryModel = require('../models/category.model');
const CategoryRepository = require('../repositories/category.repository');

// eslint-disable-next-line max-len
const CategoryNotFoundException = require('../utils/error-handlers/categoryNotFound.handler');


const fs = require('fs');
const path = require('path');
const deleteDirectory = require('../utils/deleteDirectory.util');

class CategoryServices {
  #repo;
  constructor(repo) {
    this.#repo = repo;
  }

  async checkCategoryExistsByName(name) {
    const doc = await this.#repo.getCategoryByName(name);
    if (doc) {
      throw new Error('Category already exists, should be unique');
    };
  };

  async getAllCategories() {
    return await this.#repo.getAllCategories();
  }

  async getAllCategoryNames() {
    return await this.#repo.getAllCategoryNames();
  }

  async deleteCategory(id) {
    const category = await this.#repo.deleteCategoryById(id);
    try {
      fs.unlink('src/public/static/uploads/category/'+ category.image, ()=>{});
      // bug: files are  not  properly deleted
      await deleteDirectory('src/public/static/uploads/'+ category.name);
    } catch (error) {};
    return category.name;
  }

  async updateCategoryStatus(id, status) {
    const doc = await this.#repo.updateCategoryById(
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
    const doc = await this.#repo.getCategoryById(id);
    if (doc) {
      return doc;
    }
    throw new CategoryNotFoundException();
  };

  async catImageUpdate(id, oldImage, image) {
    // need to add some alternatives ot
  // handle the error cases of deleting the old image
    try {
      fs.unlink('src/public/static/uploads/category/'+oldImage, ()=> {});
    } catch (error) {}
    const doc = await this.#repo.updateCategoryById(id, {image}, {new: true});
    if (!doc) {
      throw new CategoryNotFoundException();
    }
    return doc.image;
  }


  async createCategory(data) {
    try {
      const filePath = path.join(
          'src', 'public', 'static', 'uploads', data.name,
      );
      await fs.promises.mkdir(filePath);
    } catch (error) {
      // bug: already deleted category file  is not deleting
      // making can't create  new category with old deleted category name.
      throw new Error('There is a trouble creating the category');
    }
    return await this.#repo.createCategory(data);
  }

  async editCategory(name, description, id) {
    const details = {description};
    const data = await this.#repo.getCategoryName(id);
    const oldName = data.name;
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
    const doc = await this.#repo.updateCategoryById(id, details, {new: true});
    if (!doc) throw new CategoryNotFoundException();
    return doc;
  }
};

module.exports = new CategoryServices(
    new CategoryRepository(categoryModel),
);
