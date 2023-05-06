/* eslint-disable require-jsdoc */
module.exports = class CategoryNotFoundException extends Error {
  constructor(message) {
    super(message || 'Category may have already been deleted');
    this.status = 404;
  }
};
