

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

		if(albumData ) {
			var album = JSON.parse(albumData.innerHTML);
			console.log(album);
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
			let tracksData = album['track']['itemListElement'];
			for(let track of tracksData) {
				const trackLi = document.createElement("li");
				trackLi.textContent = track['item']['name'];
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

