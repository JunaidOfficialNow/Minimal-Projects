/* eslint-disable require-jsdoc */
/* eslint-disable */
const form = document.getElementById('couponForm');
const formContainer  = document.getElementById('couponForm-container');
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
    overlay.style.display = 'none';
  }
})