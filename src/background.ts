export type APIMessage  = RepeatAction | SingleAction | JumpAction | SwitchAction | StopAction | PauseAction | DownloadAction;

export interface RepeatAction {
    action: "repeatMode",
    value?: boolean,
}

export interface SingleAction {
    action: "singleMode",
    value?: boolean,
}

export interface JumpAction {
    action: "jump",
    direction: "left" | "right";
    time?: number,
}

export interface SwitchAction {
    action: "switchSong",
    direction: "prev" | "next",
}

export interface StopAction {
    action: "stop",
}

export interface PauseAction {
    action: "switchPause",
}

export interface DownloadAction {
    action: "download",
}


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
