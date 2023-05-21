/* eslint-disable require-jsdoc */
module.exports = class UnAuthorizedException extends Error {
  constructor(message) {
    super(message || 'unauthorized');
    this.status = 401;
  }
};
