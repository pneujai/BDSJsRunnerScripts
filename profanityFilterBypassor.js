/*
 *  ____                     ____  __   _
 * |  _ \  _ __   ___  _   _|_  _|/ / _|_|
 * | |_) /| '_ \ / _ \| | | | | |/ /_| | |
 * |  __/ | | | |  __/| |_| |_| |____  | |
 * |_|    |_| |_|\___|\___._|___|    |_|_|
 *
 * @author PneuJai
 * @link https://pneujai.github.io/
 * @project Profanity Filter Bypassor
 * @version 1.0.0
 *
*/
const profanityFilter = fileReadAllText("profanity_filter.wlist").match(/[^\n\r]+/g);
setBeforeActListener("onInputText", function(eventDataRaw) {
	let eventData = JSON.parse(eventDataRaw);
	let filtered = false;
	for (let i = 0; i < profanityFilter.length; i++) {
		if (eventData.msg.match(new RegExp(profanityFilter[i], "g")) !== null) {
			let filteredText = "";
			for (let i1 = 0; i1 < profanityFilter[i].length; i1++) {
				filteredText += profanityFilter[i].charAt(i1) + String.fromCharCode(28);
			}
			filteredText = filteredText.slice(0, -1);
			eventData.msg = eventData.msg.replace(new RegExp(profanityFilter[i], "g"), filteredText);
			filtered = true;
		}
	}
	if (filtered) {
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== null) {
			let onlinePlayers = JSON.parse(onlinePlayersRaw);
			talkAs(onlinePlayers.find(function (element) { return (element.playername === eventData.playername); }).uuid, eventData.msg);
			return false;
		}
	}
});