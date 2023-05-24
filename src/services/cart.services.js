const CartRepository = require('../repositories/cart.repository');
const UserRepository = require('../repositories/user.repository');
const crypto = require('crypto');

class CartServices {
  #repo;
  #userRepo;
  constructor(repo, userRepo) {
    this.#repo = repo;
    this.#userRepo = userRepo;
  }

  async getCartPage(userId) {
    const cart = await this.#repo.getPopulatedCartById(id);
    const token = crypto.randomBytes(8).toString('hex').slice(0, 8);
    return {products: cart?.products ?? [], token};
  }

  async addToCart(userId, proId) {
    const cart = await this.#repo.getCartById(userId);
    if (cart) {
      const inCart =cart
          .products
          .findIndex((product)=> product._id.equals(proId));
      if (inCart) return true;
      cart.products.push({_id: proId, quantity: 1});
      await this.#repo.saveDocument(doc);
      await this.#userRepo.changeCartCount(userId, 1);
      return false;
    }
    await this.#repo.createNewCart({
      _id: userId,
      products: [{
        _id: proId,
        quantity: 1,
      }],
    });
    await this.#userRepo.changeCartCount(userId, 1);
    return false;
  }
}

module.exports = new CartServices(
    CartRepository.getInstance(),
    UserRepository.getInstance(),
);
