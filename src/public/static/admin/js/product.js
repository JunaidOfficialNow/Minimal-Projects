/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
const addProduct = document.getElementById('add-product');
const productForm = document.getElementById('product-form');
const overlay = document.getElementById('overlay-form');
const designSelect = document.getElementById('designCodeSelect');
const productFormBtn = document.getElementById('productFormBtn');
const productNameInput = document.getElementById('productNameInput');


addProduct.addEventListener('click', function() {
  fetch('/admin/get/design/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response)=> response.json()).then((data)=> {
    if (data.success) {
      const codes = data.codes;
      codes.forEach((element) => {
        const option = document.createElement('option');
        option.value = element;
        option.textContent = element;
        designSelect.appendChild(option);
      });
    }
  });
  productForm.style.display = 'block';
  overlay.style.display = 'block';
});


overlay.addEventListener('click', function() {
  overlay.style.display = 'none';
  productForm.style.display = 'none';
});

productFormBtn.addEventListener('click', function() {
  const name = productNameInput.value;
  const designCode = designSelect.value;
  fetch('/admin/product/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      designCode: designCode,
    }),
  }).then((response)=> response.json()).then((data)=> {
    if (data.success) {
      window.location.href = '/admin/product/add';
    }
  });
});


// eslint-disable-next-line no-unused-vars
function changeCODStatus(element, id) {
  fetch('/admin/products/COD', {
    method: 'PATCH',
    body: JSON.stringify({
      id: id,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response)=> response.json()).then((data)=> {
    if (data.success) {
      const cell = document.getElementById(`${id}COD`);
      if (data.status) {
        cell.innerHTML = 'Available';
        element.innerHTML = 'Cancel COD';
      } else {
        cell.innerHTML = 'Not Available';
        element.innerHTML = 'Enable COD';
      }
    }
  });
};


function changeActiveStatus(element, id) {
  fetch('/admin/products/active', {
    method: 'PATCH',
    body: JSON.stringify({
      id: id,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response)=> response.json()).then((data)=> {
    if (data.success) {
      const cell = document.getElementById(`${id}Status`);
      if (data.status) {
        cell.innerHTML = 'Active';
        element.innerHTML = 'Deactivate';
      } else {
        cell.innerHTML = 'Deactivated';
        element.innerHTML = 'Activate';
      }
    }
  });
};


function editProduct(id) {
  location.href = `/admin/products/${id}`;
};
