

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
		var year = document.body.getElementsByClassName("year")[0];
		var tags = document.body.getElementsByClassName("tags")[0];
		var tracks = document.body.querySelector(".tracks ul")!;

		var albumData = document.head.querySelector('script[type="application/ld+json"]');
		var linkData = document.head.querySelector('script[data-cart]');

		if(albumData && linkData) {
			var album = JSON.parse(albumData.innerHTML);
			var links = JSON.parse(linkData.getAttribute('data-tralbum')!);
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
			let releaseDate = new Date(published);
			year.textContent = releaseDate.getFullYear().toString();
			let tracksData = links['trackinfo'];
			for(let track of tracksData) {
				const trackLi = document.createElement("li");
				trackLi.textContent = track['title'];
				if(track['file']) {
					trackLi.setAttribute('data-src', track['file']['mp3-128']);
				} else {
					trackLi.classList.add("unavailable");
				}
				tracks.appendChild(trackLi);
			}
			
		} else {
			console.log("Couldn't get album data!");
		}

		preparePlayer();
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


function preparePlayer() {
	console.log("Preparing player");

	const audio = document.getElementById('audio') as (undefined | HTMLAudioElement);
	const playPauseBtn = document.getElementById('play-pause');
	const progressContainer = document.getElementById('progress-container');
	const progress = document.getElementById('progress');
	const currentTimeElem = document.getElementById('current-time');
	const durationElem = document.getElementById('duration');
	const tracks = document.querySelectorAll('.tracks ul li[data-src]');
	const title = document.getElementById('current-song-name');

	let repeatMode = false;
	let singleSongMode = false;

	if(!audio || !playPauseBtn || !progressContainer || !progress || !currentTimeElem || !durationElem || !tracks || !title) {
		console.error("Cannot initialize player!");
		return;
	}

	let currentTrack = 0;
	newTrack(tracks[0], 0);

	let isPlaying = false;

	playPauseBtn.addEventListener('click', () => {
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
	});

	audio.addEventListener('play', () => {
		isPlaying = true;
		playPauseBtn.textContent = '⏸';
	});

	audio.addEventListener('pause', () => {
		isPlaying = false;
		playPauseBtn.textContent = '⏵';
	});

	audio.addEventListener('timeupdate', () => {
		const { currentTime, duration } = audio;
		const progressPercent = (currentTime / duration) * 100;
		progress.style.width = `${progressPercent}%`;

		let minutes = Math.floor(currentTime / 60);
		let seconds = Math.floor(currentTime % 60);
		let secString = (seconds >= 10) ? `${seconds}` : `0${seconds}`;
		currentTimeElem.textContent = `${minutes}:${secString}`;

		if (duration) {
			let totalMinutes = Math.floor(duration / 60);
			let totalSeconds = Math.floor(duration % 60);
			let secString = (totalSeconds >= 10) ? `${totalSeconds}` : `0${totalSeconds}`;
			durationElem.textContent = `${totalMinutes}:${secString}`;
		}
	});

	function getNextIndex(currentIndex: number): number {
		if(singleSongMode) {
			return currentIndex;
		}
		return currentIndex == tracks.length - 1 ? 0 : currentIndex + 1;
	}

	function getPrevIndex(currentIndex: number): number {
		if(singleSongMode) {
			return currentIndex;
		}
		return currentIndex == 0 ? tracks.length - 1 : currentIndex - 1;
	}

	function normalMode(): boolean {
		return !repeatMode && !singleSongMode;
	}

	audio.addEventListener('ended', () => {
		tryNextSong();
	});

	function tryNextSong() {
		if(currentTrack === undefined) { return; }
		if(singleSongMode && !repeatMode) {
			resetTimer();
			return; 
		}
		const nextTrack = getNextIndex(currentTrack);
		if(nextTrack == 0 && normalMode()) { 
			resetTimer();
			return; 
		}
		newTrack(tracks[nextTrack], nextTrack);
	}

	function tryPrevSong() {
		if(currentTrack === undefined) { return; }
		if(singleSongMode && !repeatMode) {
			resetTimer();
			return; 
		}
		const nextTrack = getPrevIndex(currentTrack);
		if(nextTrack == tracks.length - 1 && normalMode()) { 
			resetTimer();
			return; 
		}
		newTrack(tracks[nextTrack], nextTrack);
	}

	function resetTimer() {
		if(!audio) return; 
		audio.currentTime = 0;
	}

	function jumpSeconds(s: number) {
		if(!audio) return; 
		audio.currentTime += s;
	}

	function stop() {
		if(!audio) return; 
		resetTimer();
		audio.pause();
	}

	function switchPlay() {
		if(!audio) return; 
		if(audio.paused) {
			audio.play();
		} else {
			audio.pause();
		}
	}

	document.addEventListener('keydown', (e) => {
		// TODO: move to API and make it controllable by tridactyl
		// TODO: add indicators for currently active modes
		if(e.key == 'r') {
			repeatMode = !repeatMode;
		} else if(e.key == 's') {
			singleSongMode = !singleSongMode;
		} else if(e.key == 'ArrowLeft') {
			jumpSeconds(-5);
		} else if(e.key == 'ArrowRight') {
			jumpSeconds(5);
		} else if(e.key == 'ArrowDown') {
			tryNextSong();
		} else if(e.key == 'ArrowUp') {
			tryPrevSong();
		} else if(e.key == 'S') {
			stop();
		} else if(e.key == 'p') {
			switchPlay();
		}
	}); 

	progressContainer.addEventListener('click', (e) => {
		const width = progressContainer.clientWidth;
		const clickX = e.offsetX;
		const duration = audio.duration;

		audio.currentTime = (clickX / width) * duration;
	});

	function newTrack(track: Element, index: number) {
		if(!audio || !title) {
			return;
		}
		audio.src = track.getAttribute('data-src')!;
		title.textContent = track.textContent;
		if(currentTrack !== undefined && currentTrack < tracks.length) {
			tracks[currentTrack].classList.remove("currentTrack");
		}
		track.classList.add("currentTrack");
		currentTrack = index;
		audio.play();
	}

	tracks.forEach((track, index) => {
		track.addEventListener('click', () => newTrack(track, index));
	});
}
