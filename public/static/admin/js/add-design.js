const colorField = document.getElementById('colorField');
const addColorBtn = document.getElementById('addColorBtn');
const colorList = document.getElementById('colorList');
const designFormSubmitBtn = document.getElementById('designFormSubmitBtn');
const designCode = document.getElementById('designCode');
// const designFormError = document.getElementById('designFormError');


DesignFile.addEventListener('change', function(event) {
  const url = URL.createObjectURL(event.target.files[0]);
  DesignImage.style.height = '100%';
  DesignImage.style.width = '100%';
  categoryImageError.style.display = 'none';
  DesignImage.src = url;
});

addColorBtn.addEventListener('click', function(event) {
  event.preventDefault();
  const color = colorField.value;
  const colorCell = document.createElement('small');
  colorCell.innerHTML = color;
  colorCell.classList.add('colorItem');
  colorCell.addEventListener('click', function(event) {
    this.parentNode.removeChild(this);
  });
  colorList.appendChild(colorCell);
  colorField.value = null;
});

designCode.addEventListener('keypress', function(event) {
  designFormError.style.display = 'none';
});

designFormSubmitBtn.addEventListener('click', function(event) {
  event.preventDefault();
  if (designCode.value == '') {
    designFormError.innerHTML = 'Please provide desing code';
    designFormError.style.display = 'flex';
  }
});
