const UserRepository = require('../repositories/user.repository');
const CouponRepository = require('../repositories/coupon.repository');
const OrderRepository = require('../repositories/order.repository');
const CartRepository = require('../repositories/cart.repository');
const ProductRepository = require('../repositories/product.repository');
const AddressRepository = require('../repositories/address.repository');
class CheckoutServices {
  #userRepo;
  #couponRepo;
  #orderRepo;
  #cartRepo;
  #productRepo;
  #addressRepo;
  constructor(
      userRepo,
      couponRepo,
      orderRepo,
      cartRepo,
      productRepo,
      addressRepo,
  ) {
    this.#userRepo = userRepo;
    this.#couponRepo = couponRepo;
    this.#orderRepo = orderRepo;
    this.#cartRepo = cartRepo;
    this.#productRepo = productRepo;
    this.#addressRepo = addressRepo;
  }
};

module.exports = new CheckoutServices(
    UserRepository.getInstance(),
    CouponRepository.getInstance(),
    OrderRepository.getInstance(),
    CartRepository.getInstance(),
    ProductRepository.getInstance(),
    AddressRepository.getInstance(),
);
