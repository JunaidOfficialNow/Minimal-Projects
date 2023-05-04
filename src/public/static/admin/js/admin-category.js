/* eslint-disable require-jsdoc */
const mainCategory = document.getElementById('main-category');
const designCategory = document.getElementById('design-category');
const addCategory = document.getElementById('add-category');
const addDesign = document.getElementById('add-design');
const addCategoryParent = document.getElementById('add-category-parent');
const categoryTable = document.getElementById('category-table');
const designTable = document.getElementById('design-table');
const categoryForm = document.getElementById('category-form');
const overlay = document.getElementById('overlay-form');
const desginForm = document.getElementById('design-form');
const categoryBtn = document.getElementById('categoryBtn');
const formInputs = document.querySelectorAll('.addCatgoryFormInputs');
const imageUpload = document.getElementById('imageUploadDiv');
const backBtn = document.getElementById('backBtn');
const btnDiv = document.getElementById('btnDiv');
const fileBtn = document.getElementById('file');
const img = document.getElementById('preview');
const categoryNameInput = document.getElementById('categoryNameInput');
const categoryDescriptionInput =
 document.getElementById('categoryDescriptionInput');
let categoryBtnCount = 1;
const categoryFormError = document.getElementById('categoryFormError');
const file = document.getElementById('file');
const categoryImageError = document.getElementById('categoryImageError');
const category = document.getElementById('category');
const categoryTableContent = document.getElementById('category-table-body');
const categoryNoContent = document.getElementById('categoryNoContent');
const categoryUpdateForm = document.getElementById('category-update-form');
const categoryEditNameInput =
 document.getElementById('category-edit-name-input');
const categoryEditDescriptionInput =
 document.getElementById('category-edit-description-input');
const categoryEditImage = document.getElementById('Editpreview');
const editFileBtn = document.getElementById('file-edit');
const editCancelBtn = document.getElementById('EditCancelBtn');
const editUpdateBtn = document.getElementById('EditUpdateBtn');
const editCategoryFormError = document.getElementById('EditCategoryFormError');
const idField = document.getElementById('idField');
const categoryListDesign = document.getElementById('categoryListDesign');
const designFormError = document.getElementById('designFormError');
let indexNo = 0;

mainCategory.addEventListener('click', function() {
  addCategory.classList.add('d-flex');
  addCategory.style.display = 'block';
  addCategoryParent.style.display= 'block';
  addDesign.classList.remove('d-flex');
  addDesign.style.display = 'none';
  categoryTable.style.display = 'block';
  designTable.style.display = 'none';
  mainCategory.classList.remove('bg-secondary');
  designCategory.classList.add('bg-secondary');
});

designCategory.addEventListener('click', function() {
  location.href = '/admin/design/category';
  // addCategory.classList.remove('d-flex');
  // addCategory.style.display = 'none';
  // addCategoryParent.style.display= 'none';
  // addDesign.classList.add('d-flex');
  // addDesign.style.display = 'block';
  // categoryTable.style.display = 'none';
  // designTable.style.display = 'block';
  // mainCategory.classList.add('bg-secondary');
  // designCategory.classList.remove('bg-secondary');
});

addCategory.addEventListener('click', function() {
  formInputs.forEach((element) => {
    element.style.display = 'block';
  });
  btnDiv.style.justifyContent = 'end';
  backBtn.style.display = 'none';
  imageUpload.style.display = 'none';
  categoryBtn.innerHTML = 'Add picture';
  categoryForm.style.display = 'block';
  overlay.style.display = 'block';
  file.value = '';
  categoryNameInput.value = '';
  categoryDescriptionInput.value = '';
  categoryImageError.style.display = 'none';
  categoryBtnCount = 1;
});

addDesign.addEventListener('click', function() {
  fetch('/admin/category/names', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((data)=>data.json()).then((data)=> {
    if (data.success) {
      categoryListDesign.innerHTML = '';
      const categories = data.categories;
      categories.forEach((element) => {
        const option = document.createElement('option');
        option.value = element.name;
        option.innerHTML = element.name;
        categoryListDesign.appendChild(option);
      });
      desginForm.style.display = 'block';
      overlay.style.display = 'block';
    } else {
      designFormError.innerHTML = 'couldn\'t fetch category list';
      designFormError.style.display = 'flex';
    }
  });
});

overlay.addEventListener('click', function(event) {
  if (event.target == overlay) {
    categoryForm.style.display = 'none';
    desginForm.style.display = 'none';
    overlay.style.display = 'none';
    categoryUpdateForm.style.display = 'none';
  }
});

categoryNameInput.addEventListener('keypress', function() {
  categoryFormError.style.display = 'none';
});
categoryDescriptionInput.addEventListener('keypress', function() {
  categoryFormError.style.display = 'none';
});

// eslint-disable-next-line require-jsdoc
function isFilePresent(fileInput) {
  if (fileInput.files.length > 0) {
    return true;
  }
  return false;
}

// eslint-disable-next-line require-jsdoc
function isAllowedFileType(fileInput) {
  const file = fileInput.files[0];
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  return acceptedTypes.includes(file.type);
}


categoryBtn.addEventListener('click', function() {
  switch (categoryBtnCount) {
    case 1:
      const name = categoryNameInput.value;
      const description = categoryDescriptionInput.value;
      if (name == '' || description == '') {
        categoryFormError.style.display = 'block';
      } else {
        fetch('/admin/csrf').then((csrf)=>csrf.json())
            .then((csrf)=> {
              fetch('/admin/addCategory', {
                method: 'POST',
                body: JSON.stringify({
                  name: name,
                  description: description,
                }),
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRF-Token': csrf,
                },
              }).then((data)=> data.json()).then((data)=>{
                if (data.success) {
                  formInputs.forEach((element) => {
                    element.style.display = 'none';
                  });
                  if (isFilePresent(file)) {
                    const url = URL.createObjectURL(file.files[0]);
                    img.style.height = '100%';
                    img.style.width = '100%';
                    img.src = url;
                  } else {
                    img.style.height = '0';
                    img.style.width ='0';
                  }
                  btnDiv.style.justifyContent = 'space-between';
                  backBtn.style.display = 'block';
                  imageUpload.style.display = 'flex';
                  categoryBtn.innerHTML = 'Add product';
                  categoryBtnCount++;
                } else {
                  categoryFormError.innerHTML = data.error.message;
                  categoryFormError.style.display = 'block';
                }
              });
            });
      };
      break;
    case 2:
      fetch('/admin/csrf').then((csrf)=>csrf.json())
          .then((csrf)=> {
            const formData = new FormData();
            formData.append('file', file.files[0]);
            if (!isFilePresent(file)) {
              categoryImageError.style.display = 'block';
            } else if (!isAllowedFileType(file)) {
              categoryImageError.innerHTML =
               'Invalid file type. Please select a PNG, JPG, or JPEG file.';
              categoryImageError.style.display = 'block';
            } else {
              fetch('/admin/addCatImage', {
                method: 'POST',
                body: formData,
                headers: {
                  'X-CSRF-Token': csrf,
                },
              }).then((data)=> data.json()).then((data)=>{
                if (data.success) {
                  addCategoryList(data.doc, ++indexNo);
                  categoryNoContent.style.display = 'none';
                  categoryForm.style.display = 'none';
                  desginForm.style.display = 'none';
                  overlay.style.display = 'none';
                } else if (data.error) {
                  if ( data.error.message) {
                    categoryImageError.innerHTML = data.error.message;
                    categoryImageError.style.display = 'block';
                  } else {
                    categoryImageError.innerHTML = data.error;
                    categoryImageError.style.display = 'block';
                  }
                } else {
                  categoryImageError.innerHTML =
                   'Something went wrong, please try again';
                  categoryImageError.style.display = 'block';
                }
              });
            }
          });
  }
});

// eslint-disable-next-line require-jsdoc
function addCategoryList(category, index) {
  const row = document.createElement('tr');
  const noCell = document.createElement('td');
  noCell.textContent = index;
  indexNo = index;
  row.appendChild(noCell);

  const imageCell = document.createElement('td');
  const imageFile = document.createElement('img');
  imageFile.src = `/static/uploads/category/${category.image}`;
  imageFile.classList.add('thumbnailImage');
  imageCell.appendChild(imageFile);
  row.appendChild(imageCell);

  const nameCell = document.createElement('td');
  nameCell.textContent = category.name;
  row.appendChild(nameCell);

  const descriptionCell = document.createElement('td');
  descriptionCell.textContent = category.description;
  row.appendChild(descriptionCell);

  const lastEditedCell = document.createElement('td');
  const isoDate = category.updatedAt;
  const date = new Date(isoDate);
  lastEditedCell.innerHTML =
`on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
 <br> by ${category.lastEditedBy}`;
  row.appendChild(lastEditedCell);

  const StatusCell = document.createElement('td');
  StatusCell.textContent = category.isActive ? 'Active' : 'Deactivated';
  row.appendChild(StatusCell);

  const optionCell = document.createElement('td');
  const optionBtn = document.createElement('button');
  optionBtn.innerHTML = '<i class="fa fa-ellipsis-v"></i>';
  optionBtn.classList.add('optionsBtn');

  const dropdownMenu = document.createElement('div');
  dropdownMenu.classList.add('dropdownListMenu');


  const deleteOption = document.createElement('a');
  deleteOption.classList.add('dropdownListItem');
  deleteOption.textContent = 'Delete';
  deleteOption.addEventListener('click', (event) =>{
    event.preventDefault();
    deleteCategory(category._id);
  });
  dropdownMenu.appendChild(deleteOption);

  const editOption = document.createElement('a');
  editOption.classList.add('dropdownListItem');
  editOption.textContent = 'Edit';
  editOption.addEventListener('click', (event) =>{
    event.preventDefault();
    editCategory(category._id);
  });
  dropdownMenu.appendChild(editOption);

  if (category.isActive) {
    const deactivateOption = document.createElement('a');
    deactivateOption.classList.add('dropdownListItem');
    deactivateOption.textContent = 'Deactivate';
    deactivateOption.addEventListener('click', (event)=> {
      event.preventDefault();
      deactivateCategory(category._id, deactivateOption, dropdownMenu);
    });
    dropdownMenu.appendChild(deactivateOption);
  } else {
    const activateOption = document.createElement('a');
    activateOption.classList.add('dropdownListItem');
    activateOption.textContent = 'Activate';
    activateOption.addEventListener('click', (event)=> {
      event.preventDefault();
      activateCategory(category._id, activateOption, dropdownMenu);
    });
    dropdownMenu.appendChild(activateOption);
  }


  optionBtn.appendChild(dropdownMenu);
  optionCell.appendChild(optionBtn);
  row.appendChild(optionCell);

  row.classList.add('hoverRow');
  row.id = category._id;
  categoryTableContent.appendChild(row);
}

backBtn.addEventListener('click', function() {
  formInputs.forEach((element) => {
    element.style.display = 'block';
  });
  categoryBtnCount--;
  btnDiv.style.justifyContent = 'flex-end';
  backBtn.style.display = 'none';
  imageUpload.style.display = 'none';
  categoryBtn.innerHTML = 'Add picture';
  categoryForm.style.display = 'block';
  overlay.style.display = 'block';
});

fileBtn.addEventListener('change', function(event) {
  const url = URL.createObjectURL(event.target.files[0]);
  img.style.height = '100%';
  img.style.width = '100%';
  categoryImageError.style.display = 'none';
  img.src = url;
});

editFileBtn.addEventListener('change', function(event) {
  const url = URL.createObjectURL(event.target.files[0]);
  categoryEditImage.src = url;
});

editCancelBtn.addEventListener('click', function() {
  categoryUpdateForm.style.display = 'none';
  overlay.style.display = 'none';
});

category.addEventListener('click', function(event) {
  event.preventDefault();
  fetch('/admin/getCategories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((data)=> data.json()).then((data)=> {
    categoryTableContent.innerHTML = '';
    if (data.length == 0) {
      categoryNoContent.style.display = 'block';
    } else {
      categoryNoContent.style.display = 'none';
      data.forEach((category, index)=> {
        addCategoryList(category, index+1);
      });
    }
  });
});

editUpdateBtn.addEventListener('click', () =>{
  const description = categoryEditDescriptionInput.value;
  const name = categoryEditNameInput.value;
  if (name == '' || description == '') {
    editCategoryFormError.style.display = 'block';
  } else {
    fetch('/admin/csrf').then((csrf)=>csrf.json())
        .then((csrf)=> {
          fetch('/admin/categoryUpdate', {
            method: 'PUT',
            body: JSON.stringify({
              name: name,
              description: description,
              id: idField.value,
            }),
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrf,
            },
          }).then((data) => data.json()).then((data) => {
            if (data.success) {
              const row = document.getElementById(data.id);
              const elements = row.querySelectorAll('td');
              if (isFilePresent(editFileBtn)) {
                if (!isAllowedFileType(editFileBtn)) {
                  editCategoryFromError.innerHTML =
                     'Invalid file type, Only jpg, jpeg, and png are allowed';
                  editCategoryFormError.style.display = 'block';
                } else {
                  const formData = new FormData();
                  formData.append('file', editFileBtn.files[0]);
                  formData.append('image', data.image);
                  formData.append('id', data.id);
                  fetch('/admin/csrf').then((csrf)=>csrf.json())
                      .then((csrf)=> {
                        fetch('/admin/categoryImageUpdate', {
                          method: 'PUT',
                          headers: {
                            'X-CSRF-Token': csrf,
                          },
                          body: formData,
                        }).then((data) => data.json()).then((data) => {
                          if (data.success) {
                            // eslint-disable-next-line max-len
                            elements[1].querySelector('img').src = `/static/uploads/category/${data.newImage}`;
                          } else {
                            console.log(data.error);
                          }
                        });
                      });
                }
              }
              const date = new Date(data.date);
              categoryUpdateForm.style.display = 'none';
              overlay.style.display = 'none';
              elements[4].innerHTML = `on ${date.toLocaleDateString()}
               at ${date.toLocaleTimeString()} <br> by ${data.by}`;
              elements[2].innerHTML = name;
              elements[3].innerHTML = description;
            } else {
              alert(data.error);
            }
          });
        });
  }
});

// eslint-disable-next-line require-jsdoc
function deleteCategory(id) {
  fetch('/admin/deleteCategory', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: id,
    }),
  }).then((data)=> data.json()).then((data)=> {
    if (data.success) {
      const element = document.getElementById(id);
      const table = element.parentNode;
      table.removeChild(element);
      const rows = table.querySelectorAll('tr');
      if (rows.length== 0) {
        categoryNoContent.style.display = 'block';
      }
      let count = 0;
      rows.forEach((row)=> {
        row.querySelector('td').innerHTML = ++count;
      });
      indexNo--;
      // alert('Success');
    } else alert(data.error);
  });
};

function deactivateCategory(id, deactivateOption, dropdownMenu) {
  fetch('/admin/deactivateCategory', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: id,
    }),
  }).then((data)=> data.json()).then((data)=> {
    if (data.success) {
      dropdownMenu.removeChild(deactivateOption);
      const activateOption = document.createElement('a');
      activateOption.classList.add('dropdownListItem');
      activateOption.textContent = 'Activate';
      activateOption.addEventListener('click', (event)=> {
        event.preventDefault();
        activateCategory(id, activateOption, dropdownMenu);
      });
      dropdownMenu.appendChild(activateOption);
      const row = document.getElementById(id);
      row.querySelectorAll('td')[5].innerHTML =
       'Deactivated';
      const date = new Date(data.date);
      row.querySelectorAll('td')[4].innerHTML =
       `on ${date.toLocaleDateString()}
       at ${date.toLocaleTimeString()} <br> by ${data.by}`;
    } else {
      alert(data.error);
    }
  });
}

function activateCategory(id, activateOption, dropdownMenu) {
  fetch('/admin/activateCategory', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: id,
    }),
  }).then((data) => data.json()).then((data)=>{
    if (data.success) {
      dropdownMenu.removeChild(activateOption);
      const deactivateOption = document.createElement('a');
      deactivateOption.classList.add('dropdownListItem');
      deactivateOption.textContent = 'Deactivate';
      deactivateOption.addEventListener('click', (event)=> {
        event.preventDefault();
        deactivateCategory(id, deactivateOption, dropdownMenu);
      });
      dropdownMenu.appendChild(deactivateOption);
      const row = document.getElementById(id);
      row.querySelectorAll('td')[5].innerHTML =
       'Active';
      const date = new Date(data.date);
      row.querySelectorAll('td')[4].innerHTML =
        `on ${date.toLocaleDateString()}
        at ${date.toLocaleTimeString()} <br> by ${data.by}`;
    } else {
      alert(data.error);
    }
  });
}

function editCategory(id) {
  fetch('/admin/categoryDetails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: id,
    }),
  }).then((data) => data.json()).then((data) =>{
    if (data.success) {
      categoryUpdateForm.style.display = 'block';
      overlay.style.display = 'block';
      categoryEditNameInput.value = data.category.name;
      idField.value = data.category._id;
      categoryEditDescriptionInput.value = data.category.description;
      categoryEditImage.src = `/static/uploads/category/${data.category.image}`;
    } else {
      alert(data.error);
    }
  });
}
