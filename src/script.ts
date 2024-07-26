

document.addEventListener("DOMContentLoaded", () => {

	console.log("Injecting HTML");
	fetch(browser.runtime.getURL("./pages/index.html"))
	.then(response => response.text())
	.then(html => {
		document.body.innerHTML = html;

		// TODO: not found
		var img = document.body.querySelector(".cover img") as HTMLImageElement;
		var title = document.body.getElementsByClassName("title")[0];
		var artist = document.body.getElementsByClassName("artist")[0];
		var tags = document.body.getElementsByClassName("tags")[0];
		var tracks = document.body.querySelector(".tracks ul")!;

		var albumData = document.head.querySelector('script[type="application/ld+json"]');
		var linkData = document.head.querySelector('script[data-cart]');

		if(albumData && linkData) {
			var album = JSON.parse(albumData.innerHTML);
			var links = JSON.parse(linkData.getAttribute('data-tralbum')!);
			console.log(links);
			img.src = album['image'];
			artist.textContent = album['byArtist']['name']
			title.textContent = album['name'];

			let keywords = album['keywords'];
			for(let keyword of keywords) {
				const tag = document.createElement("span");
				tag.classList.add("tag");
				tag.textContent = keyword;
				tags.appendChild(tag);
			}
			let published = album['datePublished'];
			let tracksData = links['trackinfo'];
			for(let track of tracksData) {
				const trackLi = document.createElement("li");
				trackLi.textContent = track['title'];
				trackLi.setAttribute('data-src', track['file']['mp3-128']);
				tracks.appendChild(trackLi);
			}
			
		} else {
			console.log("Couldn't get album data!");
		}
	});

	console.log("Injecting CSS");
	fetch(browser.runtime.getURL("./styles/styles.css"))
	.then(response => response.text())
	.then(css => {
		var style = document.createElement("style");
		style.innerHTML = css;
		document.head.insertAdjacentElement('beforeend', style);
	});


});

