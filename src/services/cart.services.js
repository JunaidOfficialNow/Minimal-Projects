const CartRepository = require('../repositories/cart.repository');
const UserRepository = require('../repositories/user.repository');

class CartServices {
  #repo;
  #userRepo;
  constructor(repo, userRepo) {
    this.#repo = repo;
    this.#userRepo = userRepo;
  }
}

module.exports = new CartServices(
    CartRepository.getInstance(),
    UserRepository.getInstance(),
);
