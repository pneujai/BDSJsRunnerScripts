/*
 *  ____                     ____  __   _
 * |  _ \  _ __   ___  _   _|_  _|/ / _|_|
 * | |_) /| '_ \ / _ \| | | | | |/ /_| | |
 * |  __/ | | | |  __/| |_| |_| |____  | |
 * |_|    |_| |_|\___|\___._|___|    |_|_|
 *
 * @author PneuJai
 * @link https://pneujai.github.io/
 * @project PneuJai's Command Parser API
 * @version 1.0.2
 * @usage var parseCommand = getShareData("parseCommand");
 *
*/

setShareData("parseCommand", function(commandRaw) {
	let command = {};
	command.raw = commandRaw;
	command.tmp0 = command.raw;
	if (command.tmp0.charAt(0) == "/") {
		command.tmp0 = command.tmp0.substring(1).split(" ")[0];
	}
	command.method = command.tmp0.split(" ")[0].toLowerCase();
	
	command.tmp0 = command.raw.replace(command.raw.split(" ")[0], "");
	if (command.tmp0.charAt(0) == " ") {
		command.tmp0 = command.tmp0.substring(1);
	}
	command.args = [];
	command.tmp1 = {};
	command.tmp1.startEscape = false;
	command.tmp1.startJSON = false;
	command.tmp1.objectCount = 0;
	command.tmp1.startSelector = false;
	for (let i = 0; i < command.tmp0.split(" ").length; i++) {
		if (command.tmp0.split(" ")[i] !== "") {
			if (command.tmp1.startEscape) {
				command.args[command.args.length - 1] += " " + command.tmp0.split(" ")[i];
				if (command.tmp0.split(" ")[i].charAt(command.tmp0.split(" ")[i].length - 1) === "\"") {
					command.tmp1.startEscape = false;
				}
			} else if (command.tmp1.startJSON) {
				command.args[command.args.length - 1] += " " + command.tmp0.split(" ")[i];
				if (command.tmp0.split(" ")[i].match(/{/g) !== null) {
					command.tmp1.objectCount += command.tmp0.split(" ")[i].match(/{/g).length;
				}
				if (command.tmp0.split(" ")[i].match(/}/g) !== null) {
					command.tmp1.objectCount -= command.tmp0.split(" ")[i].match(/}/g).length;
				}
				if (command.tmp1.objectCount === 0) {
					command.tmp1.startJSON = false;
				}
			} else if (command.tmp1.startSelector) {
				command.args[command.args.length - 1] += " " + command.tmp0.split(" ")[i];
				if (command.tmp0.split(" ")[i].charAt(command.tmp0.split(" ")[i].length - 1) === "]") {
					command.tmp1.startSelector = false;
				}
			} else {
				if ((command.tmp0.split(" ")[i].charAt(0) === "\"") && (command.tmp0.split(" ")[i].charAt(command.tmp0.split(" ")[i].length -1) !== "\"")) {
					command.tmp1.startEscape = true;
				}
				if (command.tmp0.split(" ")[i].charAt(0) === "{") {
					command.tmp1.startJSON = true;
					if (command.tmp0.split(" ")[i].match(/{/g) !== null) {
						command.tmp1.objectCount += command.tmp0.split(" ")[i].match(/{/g).length;
					}
					if (command.tmp0.split(" ")[i].match(/}/g) !== null) {
						command.tmp1.objectCount -= command.tmp0.split(" ")[i].match(/}/g).length;
					}
				}
				if (command.tmp0.split(" ")[i].charAt(0) === "[") {
					command.tmp1.startSelector = true;
					command.args[command.args.length - 1] += " " + command.tmp0.split(" ")[i];
				} else {
					command.args.push(command.tmp0.split(" ")[i]);
				}
			}
		}
	}
	for (let i = 0; i < command.args.length; i++) {
		if ((command.args[i].charAt(0) === "\"") && (command.args[i].charAt(command.args[i].length - 1) === "\"")) {
			command.args[i] = command.args[i].slice(1, -1);
		}
	}
	delete command.tmp0;
	delete command.tmp1;
	return command;
});

setBeforeActListener("onInputCommand", function (eventDataRaw) {
	let eventData = JSON.parse(eventDataRaw);
	eventData.command = getShareData("parseCommand")(eventData.cmd);
	//eventData.command returns
	//{"raw":"/give \"that player\" stone 1 0 {\"can_place_on\": {\"blocks\": [\"grass\", \"air\"]}}","method":"give","args":["\"that player\"","stone","1","0","{\"can_place_on\": {\"blocks\": [\"grass\", \"air\"]}}"]}
	//from command
	//give "that player" stone 1 0 {"can_place_on": {"blocks": ["grass", "air"]}}
	
	/* Logging command to console */
	log(eventData.command.method);
	for (let i = 0; i < eventData.command.args.length; i++) {
		log(eventData.command.args[i])
	}
	//logs
	/*
	give
	that player
	stone
	1
	0
	{"can_place_on": {"blocks": ["grass", "air"]}}
	*/
	//from command
	//give "that player" stone 1 0 {"can_place_on": {"blocks": ["grass", "air"]}}
});