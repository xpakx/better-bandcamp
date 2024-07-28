export type APIMessage  = RepeatAction;

export interface RepeatAction {
    action: "repeatMode",
    value?: boolean;
}
console.log("Started");

browser.runtime.onMessageExternal.addListener((message: APIMessage) => {
	console.log("Got API message", message);
	getActiveTabId()
	.then(id => sendToTab(message, id));
});

async function getActiveTabId(): Promise<number | undefined> {
	return browser.tabs.query({ "currentWindow": true, "active": true })
	.then((tabs) => getTabId(tabs));
}

function getTabId(tab: browser.tabs.Tab[]): number | undefined {
	return tab.length > 0 ? tab[0].id : undefined;
}

function sendToTab(message: APIMessage, id?: number) {
	console.log("Active tab: " + id)
	if (!id) {
		return;
	}
	browser.tabs.sendMessage(id, message)
	.then(response => {
		console.log(response)
	});
}
