/* eslint-disable */
const form = document.getElementById("banner-form");
const bannerName = document.getElementById("banner-name");
const bannerTitle = document.getElementById("banner-title");
const actionLink = document.getElementById("action-link");
const actionText = document.getElementById("action-text");
const description = document.getElementById("description");
const bannerImage = document.getElementById("banner-image");
const Img = document.getElementById('Img');

form.addEventListener("submit", (event) => {
	event.preventDefault();

	if (bannerName.value.trim() === "") {
		alert("Please enter a banner name.");
		bannerName.focus();
		return;
	}

	if (bannerTitle.value.trim() === "") {
		alert("Please enter a banner title.");
		bannerTitle.focus();
		return;
	}

	if (actionLink.value.trim() === "") {
		alert("Please enter an action link.");
		actionLink.focus();
		return;
	}

	if (actionText.value.trim() === "") {
		alert("Please enter an action text.");
		actionText.focus();
		return;
	}

	if (description.value.trim() === "") {
		alert("Please enter a description.");
		description.focus();
		return;
	}



	form.submit();
});
let oldName;
window.addEventListener('DOMContentLoaded', function () {
   oldName  = bannerName.value;
})

bannerName.addEventListener("change", function() {
    if (oldName !== bannerName.value) {
        fetch(`/admin/banners/name/${bannerName.value}`, {
					  Origin: 'fetch',
            method: 'GET',
        }).then((response)=> response.json()).then((data)=> {
            if (data.success) {}
						else alert(data.error.message);
        } );
    }
   
});

bannerImage.addEventListener("change", (event) => {
    const url = URL.createObjectURL(event.target.files[0]);
    Img.src = url;
});
