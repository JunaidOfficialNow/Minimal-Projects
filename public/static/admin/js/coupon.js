/* eslint-disable require-jsdoc */
/* eslint-disable */
const form = document.getElementById('couponForm');
const editForm = document.getElementById('editCouponForm');

const formContainer  = document.getElementById('couponForm-container');
const editFormContainer  = document.getElementById('editCouponForm-container');
const addCoupon = document.getElementById('add-coupon');
const overlay  = document.getElementById('overlay');

function createCoupon() {
  const elements = form.elements  
  fetch('/admin/coupons/create', {
    method: 'POST',
    body: JSON.stringify({
      couponCode: elements.couponCode.value,
      discountPercentage: elements.discountPercentage.value,
      purchaseAmount: elements.purchaseAmount.value,
      expirationDate: elements.expirationDate.value,
      usageLimit: elements.usageLimit.value,
      offerUpto: elements.offerUpto.value,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  } ).then((response)=> response.json()).then((data)=> {
    if(data.success) {
      formContainer.style.display = 'none';
      overlay.style.display = 'none';
    }
   
  }); 
};

function updateCoupon() {
  const elements = editForm.elements  

  fetch('/admin/coupons', {
    method: 'PUT',
    body: JSON.stringify({
      couponCode: elements.couponCode.value,
      discountPercentage: elements.discountPercentage.value,
      purchaseAmount: elements.purchaseAmount.value,
      expirationDate: elements.expirationDate.value,
      usageLimit: elements.usageLimit.value,
      offerUpto: elements.offerUpto.value,
      id: elements.id.value,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  } ).then((response)=> response.json()).then((data)=> {
    if(data.success) {
      editFormContainer.style.display = 'none';
      overlay.style.display = 'none';
    }
   
  }); 
};
function editCoupon(id) {
  const elements = editForm.elements;
  editFormContainer.style.display = 'block';
  overlay.style.display = 'block';
  fetch(`/admin/coupons/${id}`)
  .then((response)=> response.json())
  .then((data)=> {
    if (data.success) {
            elements.couponCode.value = data.coupon.couponCode;
            elements.discountPercentage.value = data.coupon.discountPercentage;
            elements.purchaseAmount.value = data.coupon.purchaseAmount;
            const date = new  Date(data.coupon.expirationDate);
            const year = date.getFullYear();
            let month = date.getMonth();
            if (month < 10) {
              month = `0${month}`
            }
            let day = date.getDate();
            if (day < 10) {
              day = `0${day};`
            };
            elements.expirationDate.value = `${year}-${month}-${day}`;
            elements.usageLimit.value = data.coupon.usageLimit;
            elements.offerUpto.value = data.coupon.offerUpto;
            elements.id.value = data.coupon._id;

    }
  })
}


function deacivateCoupon(element, id) {
    fetch('/admin/coupon/status', {
        method: 'PATCH',
        body: JSON.stringify({
            id: id,
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((response)=> response.json()).then((data)=> {
        if (data.success) {
            const cell =  document.getElementById(`${id}StatusCell`);
            if (data.status) {
                cell.textContent = 'Active';
                return element.innerHTML = 'Deactivate';
            }
                cell.textContent = 'Deactivated';
                return element.innerHTML = 'Active';
        } alert(data.error)
    })
}

addCoupon.addEventListener('click', function() {
  formContainer.style.display = 'block';
  overlay.style.display = 'block';
  form.querySelectorAll('input').forEach((input)=> {
    input.value = '';
  })
})

window.addEventListener('click', function(event) {
  if (event.target === overlay) {
    formContainer.style.display = 'none';
    editFormContainer.style.display = 'none';
    overlay.style.display = 'none';
  }
})