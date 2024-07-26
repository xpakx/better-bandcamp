console.log("Injecting HTML");
fetch(browser.runtime.getURL("./pages/index.html"))
.then(response => response.text())
.then(html => {
	document.body.innerHTML = html;
});

console.log("Injecting CSS");
fetch(browser.runtime.getURL("./styles/styles.css"))
.then(response => response.text())
.then(css => {
	var style = document.createElement("style");
	style.innerHTML = css;
	document.head.insertAdjacentElement('beforeend', style);
});

