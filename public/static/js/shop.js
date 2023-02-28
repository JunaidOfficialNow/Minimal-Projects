/* eslint-disable max-len */
const priceFilter = document.getElementById('priceFilter');
const minamount = document.getElementById('minamount');
const maxamount = document.getElementById('maxamount');
let categoryLinks = document.getElementsByClassName('categoryLinks');
let colorRadios = document.querySelectorAll('input[name="color"]');
let sizeRadios = document.querySelectorAll('input[name="size"]');
const paginationContainer = document.getElementById('paginationContainer');

categoryLinks = Array.from(categoryLinks);
colorRadios = Array.from(colorRadios);
sizeRadios = Array.from(sizeRadios);
let category = '';
let color = '';
let size = '';
let max = '';
let min = '';
priceFilter.addEventListener('click', function(event) {
  event.preventDefault();
  fetch(`/products?category=${category}&color=${color}&size=${size}&max=${maxamount.value.substring(1)}&min=${minamount.value.substring(1)}`)
      .then((response)=> response.json()).then((data)=> {
        if (data.success) {
          min = minamount.value.substring(1);
          max = maxamount.value.substring(1);
          if (data.products.length == 0) {
            return productContainer.innerHTML = '<h4>No products Found</h4>';
          }
          productContainer.innerHTML = '';
          data.products.forEach((product)=> {
            productContainer.innerHTML += `  <div class="col-lg-4 col-md-6">
            <div class="product__item">
            <div class="product__item__pic set-bg"
             style="background-image: url('/static/uploads/${product.category}/${product.designCode}/${product.images[0]}')">
                <ul class="product__hover" >
                    <li><a href=""><span class="icon_heart_alt"></span></a></li>
                    <li  class="add-to-cart">
                        <a href="#" data-userId="${data.user}" data-proId="${product._id}" class="addToCart" >
                            <div class="">
                        <span class="icon_cart_alt"></span>
                    </div>
                    </a>
                </li>
                </ul>
            </div>
            <div class="product__item__text">
                <h6><a href="/product/${product._id}">${product.name}</a></h6>
                <div class="rating">
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                </div>
                <div class="product__price">₹ ${product.price}</div>
            </div>
        </div>
    </div>`;
          });
          paginationContainer.innerHTML = '';
          for (i=1; i<=data.products.length/9; i++) {
            paginationContainer.innerHTML += `<a href="/shop?page=${i}">${i}</a>`;
          } ;
          if (data.products.length % 9 > 0) {
            paginationContainer.innerHTML +=
            `<a href="/shop?page=${(Math.floor(data.products.length/9) + 1)}">${(Math.floor(data.products.length/9) + 1)}</a>`;
          }
        }
      });
});


categoryLinks.forEach((link)=> {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    // eslint-disable-next-line max-len
    fetch(`/products?category=${link.id}&color=${color}&size=${size}&max=${max}&min=${min}`)
        .then((response)=> response.json()).then((data)=> {
          if (data.success) {
            category = link.id;
            if (data.products.length == 0) {
              return productContainer.innerHTML = '<h4>No products Found</h4>';
            }
            productContainer.innerHTML = '';
            data.products.forEach((product)=> {
              productContainer.innerHTML += `  <div class="col-lg-4 col-md-6">
              <div class="product__item">
                  <div class="product__item__pic set-bg"
                   style="background-image: url('/static/uploads/${product.category}/${product.designCode}/${product.images[0]}')">
                      <ul class="product__hover" >
                          <li><a href=""><span class="icon_heart_alt"></span></a></li>
                          <li  class="add-to-cart">
                              <a href="#" data-userId="${data.user}" data-proId="${product._id}" class="addToCart" >
                                  <div class="">
                              <span class="icon_cart_alt"></span>
                          </div>
                          </a>
                      </li>
                      </ul>
                  </div>
                  <div class="product__item__text">
                      <h6><a href="/product/${product._id}">${product.name}</a></h6>
                      <div class="rating">
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                      </div>
                      <div class="product__price">₹ ${product.price}</div>
                  </div>
              </div>
          </div>`;
            });
            paginationContainer.innerHTML = '';
            for (i=1; i<=data.products.length/9; i++) {
              paginationContainer.innerHTML += `<a href="/shop?page=${i}">${i}</a>`;
            } ;
            if (data.products.length % 9 > 0) {
              paginationContainer.innerHTML +=
              `<a href="/shop?page=${(Math.floor(data.products.length/9) + 1)}">${(Math.floor(data.products.length/9) + 1)}</a>`;
            }
          }
        });
  });
});


colorRadios.forEach((radio) => {
  radio.addEventListener('change', (event) => {
    // eslint-disable-next-line max-len
    fetch(`/products?category=${category}&color=${radio.value}&size=${size}&max=${max}&min=${min}`)
        .then((response)=> response.json()).then((data)=> {
          if (data.success) {
            color = radio.value;
            if (data.products.length == 0) {
              return productContainer.innerHTML = '<h4>No products Found</h4>';
            }
            productContainer.innerHTML = '';
            data.products.forEach((product)=> {
              productContainer.innerHTML += `<div class="col-lg-4 col-md-6">
              <div class="product__item">
                  <div class="product__item__pic set-bg"
                   style="background-image: url('/static/uploads/${product.category}/${product.designCode}/${product.images[0]}')">
                      <ul class="product__hover" >
                          <li><a href=""><span class="icon_heart_alt"></span></a></li>
                          <li  class="add-to-cart">
                              <a href="#" data-userId="${data.user}" data-proId="${product._id}" class="addToCart" >
                                  <div class="">
                              <span class="icon_cart_alt"></span>
                          </div>
                          </a>
                      </li>
                      </ul>
                  </div>
                  <div class="product__item__text">
                      <h6><a href="/product/${product._id}">${product.name}</a></h6>
                      <div class="rating">
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                      </div>
                      <div class="product__price">₹ ${product.price}</div>
                  </div>
              </div>
          </div>`;
            });
            paginationContainer.innerHTML = '';
            for (i=1; i<=data.products.length/9; i++) {
              paginationContainer.innerHTML += `<a href="/shop?page=${i}">${i}</a>`;
            } ;
            if (data.products.length % 9 > 0) {
              paginationContainer.innerHTML +=
              `<a href="/shop?page=${(Math.floor(data.products.length/9) + 1)}">${(Math.floor(data.products.length/9) + 1)}</a>`;
            }
          }
        });
  });
});

sizeRadios.forEach((radio) => {
  radio.addEventListener('change', (event) => {
    // eslint-disable-next-line max-len
    fetch(`/products?category=${category}&color=${color}&size=${radio.value}&max=${max}&min=${min}`)
        .then((response)=> response.json()).then((data)=> {
          if (data.success) {
            size = radio.value;
            if (data.products.length == 0) {
              return productContainer.innerHTML = '<h4>No products Found</h4>';
            }
            productContainer.innerHTML = '';
            data.products.forEach((product)=> {
              productContainer.innerHTML += `  <div class="col-lg-4 col-md-6">
              <div class="product__item">
                  <div class="product__item__pic set-bg"
                   style="background-image: url('/static/uploads/${product.category}/${product.designCode}/${product.images[0]}')">
                      <ul class="product__hover" >
                          <li><a href=""><span class="icon_heart_alt"></span></a></li>
                          <li  class="add-to-cart">
                              <a href="#" data-userId="${data.user}" data-proId="${product._id}" class="addToCart" >
                                  <div class="">
                              <span class="icon_cart_alt"></span>
                          </div>
                          </a>
                      </li>
                      </ul>
                  </div>
                  <div class="product__item__text">
                      <h6><a href="/product/${product._id}">${product.name}</a></h6>
                      <div class="rating">
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                          <i class="fa fa-star"></i>
                      </div>
                      <div class="product__price">₹ ${product.price}</div>
                  </div>
              </div>
          </div>`;
            });
            paginationContainer.innerHTML = '';
            for (i=1; i<=data.products.length/9; i++) {
              paginationContainer.innerHTML += `<a href="/shop?page=${i}">${i}</a>`;
            } ;
            if (data.products.length % 9 > 0) {
              paginationContainer.innerHTML +=
              `<a href="/shop?page=${(Math.floor(data.products.length/9) + 1)}">${(Math.floor(data.products.length/9) + 1)}</a>`;
            }
          }
        });
  });
});
