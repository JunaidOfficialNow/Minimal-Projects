// const DesignFile = document.getElementById('DesignFile');
// const DesignImage = document.getElementById('DesignImage');


const mainCategory = document.getElementById('main-category');
const addDesign = document.getElementById('add-design');

mainCategory.addEventListener('click', () => {
  location.href = '/admin/home';
});


addDesign.addEventListener('click', () => {
  location.href = '/admin/design/category/add';
});
