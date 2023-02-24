/* eslint-disable */


document.addEventListener("DOMContentLoaded", function() {
  // hide all content by default
  var content = document.querySelectorAll("#content > div");
  for (var i = 0; i < 4; i++) {
    content[i].style.display = "none";
  }
  document.getElementById('dashboard-content').style.display= 'block';
  // show the content for the selected option
  var links = document.querySelectorAll("#sidebar a");
  for (var i = 0; i < 5; i++) {
    links[i].addEventListener("click", function(event) {
      event.preventDefault();

        // remove the active class from all links
        for (var j = 0; j < 5; j++) {
          links[j].classList.remove("active");
        }
  
        // add the active class to the clicked link
        this.classList.add("active");

      // hide all content
      for (var j = 0; j < 4; j++) {
        content[j].style.display = "none";
      }

      // show the content for the selected option
      var id = this.getAttribute("href").substring(1);
      document.getElementById(id + "-content").style.display = "block";
    });
  }
})


const users = document.getElementById('users');
const tableBody = document.querySelector('#table-body');
users.addEventListener('click', function(e){
  e.preventDefault();
  fetch('/admin/getusers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
    
  }).then((response) => response.json()).then((data)=>{
    tableBody.innerHTML = '';
    data.forEach((person, index) => {
      const row = document.createElement("tr");
     
      const noCell = document.createElement('td');
      noCell.textContent = index +1;
      row.appendChild(noCell);


      const profilePictureCell = document.createElement("td");
      profilePictureCell.textContent = 'sample';
      row.appendChild(profilePictureCell);

      const nameCell = document.createElement("td");
      nameCell.textContent = `${person.firstName} ${person.lastName}`;
      row.appendChild(nameCell);

      const emailCell = document.createElement("td");
      emailCell.textContent = person.email;
      row.appendChild(emailCell);

      const phoneNoCell = document.createElement("td");
      phoneNoCell.textContent = person.PhoneNo || "Not Added";
      row.appendChild(phoneNoCell);
      
      const statusCell = document.createElement("td");
    
    
      if (person.isBlocked){
        const unblockBtn = document.createElement('button');
        unblockBtn.classList.add('unblockBtn');
        unblockBtn.innerHTML = 'Unblock'
        statusCell.appendChild(unblockBtn);
        unblockBtn.onclick = function(){
          unblockUser(person._id, statusCell, unblockBtn);
        }
      } else {
        const blockButton = document.createElement('button');
        blockButton.classList.add('blockButton');
        blockButton.innerHTML = 'Block';
        blockButton.id = person._id + 'block';
        statusCell.appendChild(blockButton);
        blockButton.onclick = function() {
          blockUser(person._id, statusCell, blockButton);
        }
      }
      row.appendChild(statusCell);


      
     row.classList.add('hoverRow');
      tableBody.appendChild(row);
    });
  })
})

function blockUser(id, statusCell, blockButton) {
  fetch('/admin/block-user', {
    method: 'PUT',
    body: JSON.stringify({
      id: id,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response)=> response.json()).then(data =>{
    if (data.success) {
      statusCell.removeChild(blockButton);
      const unblockBtn = document.createElement('button');
      unblockBtn.classList.add('unblockBtn');
      unblockBtn.innerHTML = 'Unblock';
      unblockBtn.onclick = function () {
        unblockUser(id, statusCell, unblockBtn)
        
      };
      statusCell.appendChild(unblockBtn);
    } else {
      if (data.error) {
        alert(data.error)
      }  else alert('user may have deleted their  account already');
    }
  })
}

function unblockUser(id, statusCell, unblockBtn) {
  fetch('/admin/unblock-user', {
    method: 'PUT',
    body: JSON.stringify({
      id: id,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response)=> response.json()).then(data =>{
    if (data.success) {
      statusCell.removeChild(unblockBtn)
      
      const blockButton = document.createElement('button');
      blockButton.classList.add('blockButton');
      blockButton.innerHTML = 'Block';
      blockButton.onclick = function () {
        blockUser(id, statusCell, blockButton)
      }
      statusCell.appendChild(blockButton);
    } else {
      alert('failed')
    }
  })
}

