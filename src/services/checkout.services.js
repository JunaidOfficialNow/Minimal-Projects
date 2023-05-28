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

module.exports = CheckoutServices;