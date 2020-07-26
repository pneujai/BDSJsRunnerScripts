
/*jshint esversion: 9 */
/*
 *  ____                     ____  __   _
 * |  _ \  _ __   ___  _   _|_  _|/ / _|_|
 * | |_) /| '_ \ / _ \| | | | | |/ /_| | |
 * |  __/ | | | |  __/| |_| |_| |____  | |
 * |_|    |_| |_|\___|\___._|___|    |_|_|
 *
 * @author PneuJai
 * @link https://pneujai.github.io/
 * @project PneuJai's BDSJsRunner API
 * @version 1.0.1
 * @usage runScript(getShareData("loadPneuAPI"));
 *
*/
var Debugger = {};
Debugger.enabled = true; //Enable debugger feature;
log("Checking update for plugin...");
request("http://61.239.26.108:3390/projects/update_check.php", "GET", "id=mcjsr.papi&version=1.0.1", function (response) {
	if (response !== "") {
		let pluginInfo = JSON.parse(response);
		let current_version = pluginInfo["version_current"].split(".");
		let latest_version = pluginInfo["version_latest"].split(".");
		if (current_version.length === latest_version.length) {
			for (let i = 0; i < current_version.length; i++) {
				if (current_version[i] < latest_version[i]) {
					log(`Plugin ${pluginInfo.name} is outdated! Update it at ${pluginInfo.update_link}`);
					return;
				}
			}
			log(`Plugin ${pluginInfo.name} is up to date!`);
		}
	} else {
		log("Failed to check for update.");
	}
});
if (Debugger.enabled) {
	Debugger.debugging = false;
	setBeforeActListener("onServerCmd", function (eventDataRaw) {
		let eventData = JSON.escapeAndParse(eventDataRaw);
		if (eventData.cmd.startsWith(">")) {
			log(runScript(eventData.cmd.substring(1)));
			return false;
		}
	});
}

setShareData("pneuAPI_Tmp", {
	"playerMap": {},
	"serverLock": false,
	"serverForward": {
		"enabled": false,
		"ip": "",
		"port": 0
	}
});
setAfterActListener("onLoadName", function(eventDataRaw) {
	let eventData = JSON.escapeAndParse(eventDataRaw);
	let pneuAPI_Tmp = getShareData("pneuAPI_Tmp");
	pneuAPI_Tmp.playerMap[eventData.uuid] = eventData.playername;
	setShareData("pneuAPI_Tmp", pneuAPI_Tmp);
	if (pneuAPI_Tmp.serverLock) {
		transferserver(eventData.uuid, "", 0);
	}
	if (pneuAPI_Tmp.serverForward.enabled) {
		transferserver(eventData.uuid, pneuAPI_Tmp.serverForward.ip, pneuAPI_Tmp.serverForward.port);
	}
});

setAfterActListener("onPlayerLeft", function(eventDataRaw) {
	let eventData = JSON.escapeAndParse(eventDataRaw);
	let pneuAPI_Tmp = getShareData("pneuAPI_Tmp");
	delete pneuAPI_Tmp.playerMap[eventData.uuid];
	setShareData("pneuAPI_Tmp", pneuAPI_Tmp);
});

const pneuAPI = {};
function setInterval(code, millisec) {
	let timeoutfuncs = function() {
		setTimeout(code, 0);
		setTimeout(timeoutfuncs, millisec);
	};
	timeoutfuncs();
}
pneuAPI.setInterval = setInterval;

JSON.escapeAndParse = function(text, reviver = null) {
	let jsonRaw = text;
	let jsonRawToBeEscaped;
	let jsonRawQuoted = jsonRaw.match(/"[\s\S]*?"/g) ?? [];
	jsonRawToBeEscaped = jsonRawQuoted.filter(function (element) {
		return element.match(/\n/g) !== null;
	});
	for (let i = 0; i < jsonRawToBeEscaped.length; i++) {
		jsonRaw = jsonRaw.replace(jsonRawToBeEscaped[i], jsonRawToBeEscaped[i].replace(/\n/gm, "\\\\n"));
	}
	jsonRawToBeEscaped = jsonRawQuoted.filter(function (element) {
		return element.match(/\r/g) !== null;
	});
	for (let i = 0; i < jsonRawToBeEscaped.length; i++) {
		jsonRaw = jsonRaw.replace(jsonRawToBeEscaped[i], jsonRawToBeEscaped[i].replace(/\r/gm, "\\\\r"));
	}
	jsonRaw = jsonRaw.replace(/\/\/.*/gm, "").replace(/\/\*.*?\*\//gms, "");
	return JSON.parse(jsonRaw, reviver);
};
pneuAPI.escapeAndParse = JSON.escapeAndParse;

Object.prototype.serialize = function() {
	let result = [];
	for (var item in this)
	if (this.hasOwnProperty(item)) {
		result.push(encodeURIComponent(item) + "=" + encodeURIComponent(this[item]));
	}
	return result.join("&");
};
pneuAPI.serialize = Object.prototype.serialize;

class Command {
	constructor(command = "") {
		let tmp0 = command;
		if (tmp0.charAt(0) == "/") {
			tmp0 = tmp0.substring(1).split(" ")[0];
		}
		this.method = tmp0.split(" ")[0].toLowerCase();
		tmp0 = command.replace(command.split(" ")[0], "");
		if (tmp0.charAt(0) == " ") {
			tmp0 = tmp0.substring(1);
		}
		this.args = [];
		let tmp1 = {};
		tmp1.startEscape = false;
		tmp1.startJSON = false;
		tmp1.objectCount = 0;
		tmp1.startSelector = false;
		for (let i = 0; i < tmp0.split(" ").length; i++) {
			if (tmp0.split(" ")[i] !== "") {
				if (tmp1.startEscape) {
					this.args[this.args.length - 1] += " " + tmp0.split(" ")[i];
					if (tmp0.split(" ")[i].charAt(tmp0.split(" ")[i].length - 1) === "\"") {
						tmp1.startEscape = false;
					}
				} else if (tmp1.startJSON) {
					this.args[this.args.length - 1] += " " + tmp0.split(" ")[i];
					if (tmp0.split(" ")[i].match(/{/g) !== null) {
						tmp1.objectCount += tmp0.split(" ")[i].match(/{/g).length;
						console.log(tmp1.objectCount);
					}
					if (tmp0.split(" ")[i].match(/}/g) !== null) {
						tmp1.objectCount -= tmp0.split(" ")[i].match(/}/g).length;
						console.log(tmp1.objectCount);
					}
					if (tmp1.objectCount === 0) {
						tmp1.startJSON = false;
					}
				} else if (tmp1.startSelector) {
					this.args[this.args.length - 1] += " " + tmp0.split(" ")[i];
					if (tmp0.split(" ")[i].charAt(tmp0.split(" ")[i].length - 1) === "]") {
						tmp1.startSelector = false;
					}
				} else {
					if ((tmp0.split(" ")[i].charAt(0) === "\"") && (tmp0.split(" ")[i].charAt(tmp0.split(" ")[i].length -1) !== "\"")) {
						tmp1.startEscape = true;
					}
					if (tmp0.split(" ")[i].charAt(0) === "{") {
						tmp1.startJSON = true;
						if (tmp0.split(" ")[i].match(/{/g) !== null) {
							tmp1.objectCount += tmp0.split(" ")[i].match(/{/g).length;
						console.log(tmp1.objectCount);
						}
						if (tmp0.split(" ")[i].match(/}/g) !== null) {
							tmp1.objectCount -= tmp0.split(" ")[i].match(/}/g).length;
						console.log(tmp1.objectCount);
						}
					}
					if (tmp0.split(" ")[i].charAt(0) === "[") {
						tmp1.startSelector = true;
						this.args[this.args.length - 1] += " " + tmp0.split(" ")[i];
					} else {
						this.args.push(tmp0.split(" ")[i]);
					}
				}
			}
		}
		for (let i = 0; i < this.args.length; i++) {
			if ((this.args[i].charAt(0) === "\"") && (this.args[i].charAt(this.args[i].length - 1) === "\"")) {
				this.args[i] = this.args[i].slice(1, -1);
			}
		}
		/*
		for (let i = 0; i < this.args.length; i++) {
			if ((this.args[i].charAt(0) === "{") && (this.args[i].charAt(this.args[i].length - 1) === "}")) {
				this.args[i] = JSON.escapeAndParse(this.args[i]);
			}
		}
		*/
	}
}
pneuAPI.Command = Command;

class SimpleForm {
	constructor(title = "", content = "", buttons = []) {
		this.type = "form";
		this.title = String(title);
		this.content = String(content);
		this.buttons = buttons;
	}
	stringify() {
		return JSON.stringify(this);
	}
	sendToPlayer(uuid) {
		return sendCustomForm(uuid, this.stringify());
	}
	setTitle(title) {
		this.title = String(title);
	}
	getTitle() {
		return this.title;
	}
	getContent() {
		return this.content;
	}
	setContent(content) {
		this.content = String(content);
	}
	addButton(text, imageType = -1, imagePath = "") {
		let content = {};
		content.text = String(text);
		if (imageType !== -1) {
			content.image = {};
			content.image.type = imageType === 0 ? "path" : "url";
			content.image.data = imagePath;
		}
		this.buttons.push(content);
	}
}

pneuAPI.SimpleForm = SimpleForm;
class ModalForm {
	constructor(title = "", content = "", button1 = "", button2 = "") {
		this.type = "modal";
		this.title = String(title);
		this.content = String(content);
		this.button1 = String(buttons1);
		this.button2 = String(buttons2);
	}
	stringify() {
		return JSON.stringify(this);
	}
	sendToPlayer(uuid) {
		return sendCustomForm(uuid, this.stringify());
	}
	setTitle(title) {
		this.title = String(title);
	}
	getTitle() {
		return this.title;
	}
	getContent() {
		return this.content;
	}
	setContent(content) {
		this.content = String(content);
	}
	setButton1(text) {
		this.button1 = String(text);
	}
	getButton1(text) {
		return this.button1;
	}
	setButton2(text) {
		this.button2 = String(text);
	}
	getButton2(text) {
		return this.button2;
	}
}

pneuAPI.ModalForm = ModalForm;
class CustomForm {
	constructor(title = "", content = []) {
		this.type = "custom_form";
		this.title = String(title);
		this.content = content;
	}
	stringify() {
		return JSON.stringify(this);
	}
	sendToPlayer(uuid) {
		return sendCustomForm(uuid, this.stringify());
	}
	setTitle(title) {
		this.title = String(title);
	}
	getTitle() {
		return this.title;
	}
	addLabel(text) {
		let content = {};
		content.type = "label";
		content.text = String(text);
		this.addContent(content);
	}
	addToggle(text, _default = null) {
		let content = {};
		content.type = "toggle";
		content.text = String(text);
		if (_default !== null) {
			content.default = Boolean(_default);
		}
		this.addContent(content);
	}
	addSlider(text, min, max, step = -1, _default = -1) {
		let content = {};
		content.type = "slider";
		content.text = String(text);
		content.min = Number(min);
		content.max = Number(max);
		if (step !== -1) {
			content.step = step;
		}
		if (_default !== -1) {
			content.default = _default;
		}
		this.addContent(content);
	}
	addStepSlider(text, steps, defaultIndex = -1) {
		let content = {};
		content.type = "step_slider";
		content.text = String(text);
		content.steps = steps;
		if (defaultIndex !== -1) {
			content.default = defaultIndex;
		}
		this.addContent(content);
	}
	addDropdown(text, options, _default = null) {
		let content = {};
		content.type = "dropdown";
		content.text = String(text);
		content.options = options;
		content.default = Number(_default);
		this.addContent(content);
	}
	addInput(text, placeholder = "", _default = null) {
		let content = {};
		content.type = "input";
		content.text = String(text);
		content.placeholder = String(placeholder);
		content.default = String(_default);
		this.addContent(content);
	}
	addContent(content) {
		this.content.push(content);
	}
}
pneuAPI.CustomForm = CustomForm;
class NBT {
  static TAG_End = 0;
	static TAG_Byte = 1;
	static TAG_Short = 2;
	static TAG_Int = 3;
	static TAG_Long = 4;
	static TAG_Float = 5;
	static TAG_Double = 6;
	static TAG_ByteArray = 7;
	static TAG_String = 8;
	static TAG_List = 9;
	static TAG_Compound = 10;
	static TAG_IntArray = 11;
	static createTag(type, name, value) {
		switch (type) {
			case this.TAG_Byte:
				return new ByteTag(name, value);
			case this.TAG_Short:
				return new ShortTag(name, value);
			case this.TAG_Int:
				return new IntTag(name, value);
			case this.TAG_Long:
				return new LongTag(name, value);
			case this.TAG_Float:
				return new FloatTag(name, value);
			case this.TAG_Double:
				return new DoubleTag(name, value);
			case this.TAG_ByteArray:
				return new ByteArrayTag(name, value);
			case this.TAG_String:
				return new StringTag(name, value);
			case this.TAG_List:
				return new ListTag(name, value);
			case this.TAG_Compound:
				return new CompoundTag(name, value);
			case this.TAG_IntArray:
				return new IntArrayTag(name, value);
			default:
				throw `InvalidArgumentException: Unknown NBT tag type ${type}`;
		}
	}
	static parseFromJSON(tags) {
		let tagTypes = ["End","Byte","Short","Int","Long","Float","Double","Byte Array","String","List","Compound","IntArray"];
		let type = tagTypes.indexOf(tags.tagType);
		let name = tags.name !== undefined ? tags.name : "";
		let value;
		switch (type) {
			case 0:
				break;
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 11:
				value = tags.value;
				break;
			case 9:
			case 10:
				value = [];
				for (let i = 0; i < tags.value.length; i++) {
					value.push(NBT.parseFromJSON(tags.value[i]));
				}
				break;
		}
		return NBT.createTag(type, name, value);
	}
	static parseFromNBTString(text) {
		let json = JSON.escapeAndParse(text);
		let type = json.cv !== undefined ? json.cv.tt : json.tt;
		let name = json.ck !== undefined ? json.ck : "";
		json.value = json.cv !== undefined ? json.cv.tv : json.tv;
		let value;
		switch (type) {
			case 0:
				break;
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 11:
				value = json.value;
				break;
			case 9:
			case 10:
				value = [];
				if (json.value !== null) {
					for (let i = 0; i < json.value.length; i++) {
						value.push(NBT.parseFromNBTString(JSON.stringify(json.value[i])));
					}
				}
				break;
		}
		return NBT.createTag(type, name, value);
	}
}
pneuAPI.NBT = NBT;
class NamedTag {
	constructor(name = "") {
		if (typeof name !== "string") {
			throw `TypeError: invalid arguments`;
		}
		if (name.length > 32767) {
			throw `InvalidArgumentException: Tag name cannot be more than 32767 bytes, got length ${name.length}`;
		}
	}
	getName() {
		return this.ck !== undefined ? this.ck : "";
	}
	getValue() {
		return this.cv !== undefined ? this.cv.tv : this.tv;
	}
	setName(name) {
		if (typeof name !== "string") {
			throw `TypeError: invalid arguments`;
		}
		this.ck = name;
	}
	setValue(value) {
		if (this.cv !== undefined) {
			this.cv.tv = value;
		} else {
			this.tv = value;
		}
	}
	toString() {
		return JSON.stringify(this);
	}
	parseToJSON() {
		let tagTypes = ["End","Byte","Short","Int","Long","Float","Double","Byte Array","String","List","Compound","IntArray"];
		let output = {};
		let tagType = this.cv !== undefined ? this.cv.tt : this.tt;
		output.tagType = tagTypes[tagType];
		if (this.ck !== undefined) {
			output.name = this.ck;
		}
		switch (tagType) {
			case 0:
				break;
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 11:
				output.value = this.cv !== undefined ? this.cv.tv : this.tv;
				break;
			case 9:
			case 10:
				output.value = [];
				let value = this.cv !== undefined ? this.cv.tv : this.tv;
				for (let i = 0; i < value.length; i++) {
					output.value.push(value[i].parseToJSON());
				}
		}
		return output;
	}
}
pneuAPI.NamedTag = NamedTag;
class ByteTag extends NamedTag {
	constructor(name = "", value = 0) {
		super(name);
		if (typeof name !== "string" || !Number.isInteger(value)) {
			throw `TypeError: invalid arguments`;
		}
		if (value < -128 || value > 127) {
			throw `RangeError: precision is out of range`;
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_Byte;
	}
}
pneuAPI.ByteTag = ByteTag;
class ShortTag extends NamedTag {
	constructor(name = "", value = 0) {
		super(name);
		if (typeof name !== "string" || !Number.isInteger(value)) {
			throw `TypeError: invalid arguments`;
		}
		if (value < -0x8000 || value > 0x7fff) {
			throw `RangeError: precision is out of range`;
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_Short;
	}
}
pneuAPI.ShortTag = ShortTag;
class IntTag extends NamedTag {
	constructor(name = "", value = 0) {
		super(name);
		if (typeof name !== "string" || !Number.isInteger(value)) {
			throw `TypeError: invalid arguments`;
		}
		if (value < -0x80000000 || value > 0x7fffffff) {
			throw `RangeError: precision is out of range`;
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_Int;
	}
}
pneuAPI.IntTag = IntTag;
class LongTag extends NamedTag {
	constructor(name = "", value = 0) {
		super(name);
		if (typeof name !== "string" || !Number.isInteger(value)) {
			throw `TypeError: invalid arguments`;
		}
		if (value < -9223372036854775808 || value > 9223372036854775807) {
			throw `RangeError: precision is out of range`;
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_Long;
	}
}
pneuAPI.LongTag = LongTag;
class FloatTag extends NamedTag {
	constructor(name = "", value = 0) {
		super(name);
		if (typeof name !== "string" || typeof value !== "number") {
			throw `TypeError: invalid arguments`;
		}
		/*
		if ((value > 0 && (value < Math.pow(10, -308) || value > Math.pow(10, 308))) || (value < 0 && (value < 3.4 * Math.pow(10, 38) || value > -1.18 * Math.pow(10, -38)))){
			throw `RangeError: precision is out of range`;
		}
		*/
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_Float;
	}
}
pneuAPI.FloatTag = FloatTag;
class DoubleTag extends NamedTag {
	constructor(name = "", value = 0) {
		super(name);
		if (typeof name !== "string" || typeof value !== "number") {
			throw `TypeError: invalid arguments`;
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_Double;
	}
}
pneuAPI.DoubleTag = DoubleTag;
class ByteArrayTag extends NamedTag {
	constructor(name = "", value = "") {
		super(name);
		if (typeof name !== "string" || typeof value !== "string") {
			throw `TypeError: invalid arguments`;
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_ByteArray;
	}
}
pneuAPI.ByteArrayTag = ByteArrayTag;
class StringTag extends NamedTag {
	constructor(name = "", value = "") {
		super(name);
		if (typeof name !== "string" || typeof value !== "string") {
			throw `TypeError: invalid arguments`;
		}
		if (value.length > 32767) {
			throw `InvalidArgumentException: StringTag cannot hold more than 32767 bytes, got string of length ${value.length}`;
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_String;
	}
}
pneuAPI.StringTag = StringTag;
class ListTag extends NamedTag {
	constructor(name = "", value = []) {
		super(name);
		if (typeof name !== "string" || !Array.isArray(value)) {
			throw `TypeError: invalid arguments`;
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_List;
	}
	offsetExists(offset) {
		return this.cv !== undefined ? this.cv.tv[offset] !== undefined : this.tv[offset] !== undefined;
	}
	offsetGet(offset) {
		return this.cv !== undefined ? this.cv.tv[offset] : this.tv[offset];
	}
	offsetSet(offset, value) {
		if (value instanceof NamedTag) {
			if (this.cv !== undefined) {
				this.cv.tv[offset] = value;
			}	else {
				this.tv[offset] = value;
			}
		} else {
		throw (`TypeError: Value set by offsetSet must be an instance of NamedTag`);
		}
	}
	offsetUnset(offset) {
		delete this.cv !== undefined ? this.cv.tv[offset] : this.tv[offset];
	}
	push(tag) {
		if (value instanceof NamedTag) {
			if (this.cv !== undefined) {
				this.cv.tv.push(value);
			}	else {
				this.tv.push(value);
			}
		} else {
		throw (`TypeError: Value set by push must be an instance of NamedTag`);
		}
	}
	pop() {
		if (this.cv !== undefined) {
			this.cv.tv.pop();
		}	else {
			this.tv.pop();
		}
	}
	unshift(tag) {
		if (tag instanceof NamedTag) {
			if (this.cv !== undefined) {
				this.cv.tv.unshift(tag);
			}	else {
				this.tv.unshift(tag);
			}
		} else {
		throw (`TypeError: Value set by unshift must be an instance of NamedTag`);
		}
	}
	shift() {
		if (this.cv !== undefined) {
			this.cv.tv.shift();
		}	else {
			this.tv.shift();
		}
	}
	remove(offset) {
		delete this.cv !== undefined ? this.cv.tv[offset] : this.tv[offset];
	}
	get(offset) {
		return this.cv !== undefined ? this.cv.tv[offset] : this.tv[offset];
	}
	first(){
		return this.cv !== undefined ? this.cv.tv[0] : this.tv[0];
	}
	last(){
		return this.cv !== undefined ? this.cv.tv[this.cv.tv.length - 1] : this.tv[this.tv.length - 1];
	}
	set(offset, value) {
		if (value instanceof NamedTag) {
			if (this.cv !== undefined) {
				this.cv.tv[offset] = value;
			}	else {
				this.tv[offset] = value;
			}
		} else {
		throw (`TypeError: Value set by set must be an instance of NamedTag`);
		}
	}
	isset(offset) {
		return this.cv !== undefined ? this.cv.tv[offset] !== undefined : this.tv[offset] !== undefined;
	}
	empty(offset) {
		return this.cv !== undefined ? this.cv.tv.length === 0 : this.tv.length === 0;
	}
	getNamedTagEntry(name) {
		if (this.cv !== undefined) {
			return this.cv.tv.find(function (element) { return element.ck === name; });
		} else {
			return this.tv.find(function (element) { return element.ck === name; });
		}
	}
	removeNamedTagEntry(name) {
		if (this.cv !== undefined) {
			this.cv.tv.splice(this.cv.tv.indexOf(this.cv.tv.find(function (element) { return element.ck === name; })), 1);
		} else {
			this.tv.splice(this.tv.indexOf(this.tv.find(function (element) { return element.ck === name; })), 1);
		}
	}
}
pneuAPI.ListTag = ListTag;
class CompoundTag extends NamedTag {
	constructor(name = "", value = []) {
		super(name);
		if (typeof name !== "string" || !Array.isArray(value)) {
			throw `TypeError: invalid arguments`;
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_Compound;
	}
	offsetExists(offset) {
		return this.cv !== undefined ? this.cv.tv[offset] !== undefined : this.tv[offset] !== undefined;
	}
	offsetGet(offset) {
		return this.cv !== undefined ? this.cv.tv[offset] : this.tv[offset];
	}
	offsetSet(offset, value) {
		if (value instanceof NamedTag) {
			if (this.cv !== undefined) {
				this.cv.tv[offset] = value;
			}	else {
				this.tv[offset] = value;
			}
		} else {
		throw (`TypeError: Value set by offsetSet must be an instance of NamedTag`);
		}
	}
	offsetUnset(offset) {
		delete this.cv !== undefined ? this.cv.tv[offset] : this.tv[offset];
	}
	push(tag) {
		if (value instanceof NamedTag) {
			if (this.cv !== undefined) {
				this.cv.tv.push(value);
			}	else {
				this.tv.push(value);
			}
		} else {
		throw (`TypeError: Value set by push must be an instance of NamedTag`);
		}
	}
	pop() {
		if (this.cv !== undefined) {
			this.cv.tv.pop();
		}	else {
			this.tv.pop();
		}
	}
	unshift(tag) {
		if (tag instanceof NamedTag) {
			if (this.cv !== undefined) {
				this.cv.tv.unshift(tag);
			}	else {
				this.tv.unshift(tag);
			}
		} else {
		throw (`TypeError: Value set by unshift must be an instance of NamedTag`);
		}
	}
	shift() {
		if (this.cv !== undefined) {
			this.cv.tv.shift();
		}	else {
			this.tv.shift();
		}
	}
	remove(offset) {
		delete this.cv !== undefined ? this.cv.tv[offset] : this.tv[offset];
	}
	get(offset) {
		return this.cv !== undefined ? this.cv.tv[offset] : this.tv[offset];
	}
	first(){
		return this.cv !== undefined ? this.cv.tv[0] : this.tv[0];
	}
	last(){
		return this.cv !== undefined ? this.cv.tv[this.cv.tv.length - 1] : this.tv[this.tv.length - 1];
	}
	set(offset, value) {
		if (value instanceof NamedTag) {
			if (this.cv !== undefined) {
				this.cv.tv[offset] = value;
			}	else {
				this.tv[offset] = value;
			}
		} else {
		throw (`TypeError: Value set by set must be an instance of NamedTag`);
		}
	}
	isset(offset) {
		return this.cv !== undefined ? this.cv.tv[offset] !== undefined : this.tv[offset] !== undefined;
	}
	empty(offset) {
		return this.cv !== undefined ? this.cv.tv.length === 0 : this.tv.length === 0;
	}
	getNamedTagEntry(name) {
		if (this.cv !== undefined) {
			return this.cv.tv.find(function (element) { return element.ck === name; });
		} else {
			return this.tv.find(function (element) { return element.ck === name; });
		}
	}
	removeNamedTagEntry(name) {
		if (this.cv !== undefined) {
			this.cv.tv.splice(this.cv.tv.indexOf(this.cv.tv.find(function (element) { return element.ck === name; })), 1);
		} else {
			this.tv.splice(this.tv.indexOf(this.tv.find(function (element) { return element.ck === name; })), 1);
		}
	}
}
pneuAPI.CompoundTag = CompoundTag;
class IntArrayTag extends NamedTag {
	constructor(name = "", value = []) {
		super(name);
		if (typeof name !== "string" || !Array.isArray(value)) {
			throw `TypeError: invalid arguments`;
		}
		for (let i = 0; i < value.length; i++) {
			if (!Number.isInteger(value[i])) {
				throw `TypeError: invalid arguments`;
				//continue;
			}
		}
		if (name === "") {
			this.tt = this.getType();
			this.tv = value;
		} else {
			this.ck = name;
			this.cv = {};
			this.cv.tt = this.getType();
			this.cv.tv = value;
		}
	}
	getType() {
		return NBT.TAG_IntArray;
	}
}
pneuAPI.IntArrayTag = IntArrayTag;
class Player {
	constructor(uuid) {
		this.uuid = uuid;
		this.xuid = this.getXUIDByUUID(this.uuid);
	}
	static getUUIDByPlayername(playername) {
		if ((playername === undefined) || (playername === null)) {
			return undefined;
		}
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			let onlinePlayers = JSON.escapeAndParse(onlinePlayersRaw);
			return onlinePlayers.find(function (element) { return (element.playername === playername); }).uuid;
		}
		return undefined;
	}
	static getXUIDByPlayername(playername) {
		if ((playername === undefined) || (playername === null)) {
			return undefined;
		}
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			let onlinePlayers = JSON.escapeAndParse(onlinePlayersRaw);
			return onlinePlayers.find(function (element) { return (element.playername === playername); }).uuid;
		}
		return undefined;
	}
	static getPlayernameByUUID(uuid) {
		if ((uuid === undefined) || (uuid === null)) {
			return undefined;
		}
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			let onlinePlayers = JSON.escapeAndParse(onlinePlayersRaw);
			return onlinePlayers.find(function (element) { return (element.uuid === uuid); }).playername;
		}
		return undefined;
	}
	static getXUIDByUUID(uuid) {
		if ((uuid === undefined) || (uuid === null)) {
			return undefined;
		}
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			let onlinePlayers = JSON.escapeAndParse(onlinePlayersRaw);
			return onlinePlayers.find(function (element) { return (element.uuid === uuid); }).xuid;
		}
		return undefined;
	}
	static getPlayernameByXUID(xuid) {
		if ((uuid === undefined) || (uuid === null)) {
			return undefined;
		}
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			let onlinePlayers = JSON.escapeAndParse(onlinePlayersRaw);
			return onlinePlayers.find(function (element) { return (element.xuid === xuid); }).playername;
		}
		return undefined;
	}
	static getUUIDByXUID(xuid) {
		if ((uuid === undefined) || (uuid === null)) {
			return undefined;
		}
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			let onlinePlayers = JSON.escapeAndParse(onlinePlayersRaw);
			return onlinePlayers.find(function (element) { return (element.xuid === xuid); }).uuid;
		}
		return undefined;
	}
	getAbility(key) {
		let playerAbilitiesRaw = getPlayerAbilities(this.uuid);
		if (playerAbilitiesRaw !== undefined) {
			let playerAbilities = JSON.escapeAndParse(playerAbilitiesRaw);
			return playerAbilities[key];
		}
		return undefined;
	}
	setAbility(key, value) {
		let playerAbilities = {};
		playerAbilities[key] = value;
		return setPlayerAbilities(this.uuid, JSON.stringify(playerAbilities));
	}
	getAttribute(key) {
		let playerTempAttributesRaw = getPlayerTempAttributes(this.uuid);
		if (playerTempAttributesRaw !== undefined) {
			let playerTempAttributes = JSON.escapeAndParse(playerTempAttributesRaw);
			return playerTempAttributes[key];
		}
		return undefined;
	}
	setAttribute(key, value) {
		let playerTempAttributes = {};
		playerTempAttributes[key] = value;
		return setPlayerTempAttributes(this.uuid, JSON.stringify(playerTempAttributes));
	}
	getMaxAttribute(key) {
		let playerMaxAttributesRaw = getPlayerMaxAttributesRaw(this.uuid);
		if (playerMaxAttributesRaw !== undefined) {
			let playerMaxAttributes = JSON.escapeAndParse(playerMaxAttributesRaw);
			return playerMaxAttributes[key];
		}
		return undefined;
	}
	setMaxAttribute(key, value) {
		let playerMaxAttributes = {};
		playerMaxAttributes[key] = value;
		return setPlayerMaxAttributes(this.uuid, JSON.stringify(playerMaxAttributes));
	}
	getDimension() {
		let playerRaw = selectPlayer(this.uuid);
		if (playerRaw !== undefined) {
			let player = JSON.escapeAndParse(playerRaw);
			return player.dimensionid;
		}
		return undefined;
	}
	getPosition() {
		let playerRaw = selectPlayer(this.uuid);
		if (playerRaw !== undefined) {
			let player = JSON.escapeAndParse(playerRaw);
			return player.XYZ;
		}
		return undefined;
	}
	getDisplayPosition() {
		let playerRaw = selectPlayer(this.uuid);
		if (playerRaw !== undefined) {
			let player = JSON.escapeAndParse(playerRaw);
			return {"x": parseInt(player.XYZ.x), "y": parseInt(player.XYZ.y - 1), "z": parseInt(player.XYZ.z)};
		}
		return undefined;
	}
	getDisplayName() {
		return this.getPlayernameByUUID(this.uuid);
	}
	setDisplayName(value) {
		return reNameByUuid(this.uuid, value);
	}
	getOriginalName() {
		return JSON.escapeAndParse(getShareData("pneuAPI_PlayerMap"))[this.uuid];
	}
	getGamemode() {
		let playerPermissionAndGametypeRaw = getPlayerPermissionAndGametype(this.uuid);
		if (playerPermissionAndGametypeRaw !== undefined) {
			playerPermissionAndGametype = JSON.escapeAndParse(playerPermissionAndGametypeRaw);
			return playerPermissionAndGametype.gametype;
		}
		return undefined;
	}
	setGamemode(value) {
		let playerPermissionAndGametype = {};
		playerPermissionAndGametype["gametype"] = value;
		return setPlayerPermissionAndGametype(this.uuid, JSON.stringify(playerPermissionAndGametype));
	}
	getPermissionLevel() {
		let playerPermissionAndGametypeRaw = getPlayerPermissionAndGametype(this.uuid);
		if (playerPermissionAndGametypeRaw !== undefined) {
			playerPermissionAndGametype = JSON.escapeAndParse(playerPermissionAndGametypeRaw);
			return playerPermissionAndGametype.permission;
		}
		return undefined;
	}
	setPermissionLevel(value) {
		let playerPermissionAndGametype = {};
		playerPermissionAndGametype["permission"] = value;
		return setPlayerPermissionAndGametype(this.uuid, JSON.stringify(playerPermissionAndGametype));
	}
	getOpLevel() {
		let playerPermissionAndGametypeRaw = getPlayerPermissionAndGametype(this.uuid);
		if (playerPermissionAndGametypeRaw !== undefined) {
			playerPermissionAndGametype = JSON.escapeAndParse(playerPermissionAndGametypeRaw);
			return playerPermissionAndGametype.oplevel;
		}
		return undefined;
	}
	setOpLevel(value) {
		let playerPermissionAndGametype = {};
		playerPermissionAndGametype["oplevel"] = value;
		return setPlayerPermissionAndGametype(this.uuid, JSON.stringify(playerPermissionAndGametype));
	}
	addEffect(effect = 1, duration = 6000, amplifier = 0, hideParticles = false, ambient = false) {
		return setPlayerEffects(this.uuid, NBT.createTag(9, "", [NBT.createTag(10, "", [NBT.createTag(1, "Ambient", Number(ambient)), NBT.createTag(1, "Amplifier", Number(amplifier)), NBT.createTag(1, "DisplayOnScreenTextureAnimation", 0), NBT.createTag(3, "Duration", Number(duration)), NBT.createTag(1, "Id", Number(effect)), NBT.createTag(1, "ShowParticles", Number(!hideParticles))])]).toString());
	}
	isAlive() {
		let playerAttributesRaw = getPlayerAttributes(this.uuid);
		if (playerAttributesRaw !== undefined) {
			let playerAttributes = JSON.escapeAndParse(playerAttributesRaw);
			return playerAttributes.health > 0;
		}
		return false;
	}
	isStanding() {
		let playerRaw = selectPlayer(this.uuid);
		if (playerRaw !== undefined) {
			let player = JSON.escapeAndParse(playerRaw);
			return player.isstand;
		}
		return undefined;
	}
	isFlying() {
		let abilitiesRaw = getPlayerAbilities(this.uuid);
		if (abilitiesRaw !== undefined) {
			let abilities = JSON.escapeAndParse(abilitiesRaw);
			return abilities.flying;
		}
		return undefined;
	}
	isOnline() {
		if (selectPlayer(this.uuid) !== undefined) {
			return true;
		}
		return false;
	}
	isOp() {
		let permissionAndGametypeRaw = getPlayerPermissionAndGametype(this.uuid);
		if (permissionAndGametypeRaw !== undefined) {
			let permissionAndGametype = JSON.escapeAndParse(permissionAndGametypeRaw);
			return permissionAndGametype.permission === 2;
		}
		return undefined;
	}
	isWhitelisted() {
		let whitelistRaw = fileReadAllText("whitelist.json");
		if (whitelistRaw !== undefined) {
			let whitelist = JSON.escapeAndParse(whitelistRaw);
			if (whitelist.find(function(element) { return element.xuid == this.xuid; }) !== undefined) {
				return true;
			}
		}
		return false;
	}
	executeCommand(command) {
		return runcmdAs(this.uuid, command);
	}
	talk(message) {
		return talkAs(this.uuid, message);
	}
	sendMessage(message) {
		return runcmd(`tellraw "${this.getPlayernameByUUID(this.uuid)}" {"rawtext":[{"text":"${message}"}]}`);
	}
	sendWhisper(sender, message) {
		runcmd(`execute "${this.getPlayernameByUUID(this.uuid)}" ~ ~ ~ summon minecraft:pig "${sender}" ~ 0 ~`);
		return runcmd(`execute @e[name="${sender}",c=1] ~ ~ ~ w "${this.getPlayernameByUUID(this.uuid)}" ${message}`);
	}
	kill() {
		return this.setAttribute("health", 0);
	}
	kick() {
		return runcmd(`kick "${this.getDisplayName()}"`);
	}
	mute() {
		return this.setAbility("mute", true);
	}
	unmute() {
		return this.setAbility("mute", false);
	}
	transferServer(address, port = 19132) {
		return transferserver(this.uuid, address, port);
	}
	teleport(x, y, z, dimension = this.getDimension()) {
		return teleport(this.uuid, x, y, z, dimension);
	}
	getInventory(inventory) {
		let playerItemsRaw = getPlayerItems(this.uuid);
		if (playerItemsRaw !== undefined) {
			let playerItems = JSON.escapeAndParse(playerItemsRaw);
			switch (inventory) {
				case "armor":
					return NBT.parseFromNBTString(JSON.stringify(playerItems["Armor"]));
				case "enderchest":
					return NBT.parseFromNBTString(JSON.stringify(playerItems["EnderChestInventory"]));
				case "inventory":
					return NBT.parseFromNBTString(JSON.stringify(playerItems["Inventory"]));
				case "mainhand":
					let playerSelectedItemRaw = getPlayerSelectedItem(this.uuid);
					if (playerSelectedItemRaw !== undefined) {
						let playerSelectedItem = JSON.escapeAndParse(playerSelectedItemRaw);
						return NBT.parseFromNBTString(JSON.stringify(playerSelectedItem["selecteditem"]));
					}
					return undefined;
				case "offhand":
					return NBT.parseFromNBTString(JSON.stringify(playerItems["Offhand"]));
			}
		}
		return undefined;
	}
	replaceItem(slotType, slotId, item) {
		switch (inventory) {
			case "armor":
				return playerItems["Armor"];
			case "enderchest":
				return playerItems["EnderChestInventory"];
			case "inventory":
				return playerItems["Inventory"];
			case "mainhand":
				
			case "offhand":
				
		}
		return false;
	}
	addItem(item) {
		
	}
	removeItem(item) {
		
	}
}
pneuAPI.Player = Player;
class Server {
	static getOnlinePlayers() {
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			return JSON.escapeAndParse(onlinePlayersRaw);
		}
		return null;
	}
	static getOnlineOps() {
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			JSON.escapeAndParse(onlinePlayersRaw).filter(function(element) {
				let permissionAndGametypeRaw = getPlayerPermissionAndGametype(element.uuid);
				if (permissionAndGametypeRaw !== undefined) {
					let permissionAndGametype = JSON.escapeAndParse(permissionAndGametypeRaw);
					return permissionAndGametype.permission === 2;
				}
			});
		}
		return null;
	}
	static getOnlineMembers() {
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			JSON.escapeAndParse(onlinePlayersRaw).filter(function(element) {
				let permissionAndGametypeRaw = getPlayerPermissionAndGametype(element.uuid);
				if (permissionAndGametypeRaw !== undefined) {
					let permissionAndGametype = JSON.escapeAndParse(permissionAndGametypeRaw);
					return permissionAndGametype.permission === 1;
				}
			});
		}
		return null;
	}
	static getOnlineVisitors() {
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			JSON.escapeAndParse(onlinePlayersRaw).filter(function(element) {
				let permissionAndGametypeRaw = getPlayerPermissionAndGametype(element.uuid);
				if (permissionAndGametypeRaw !== undefined) {
					let permissionAndGametype = JSON.escapeAndParse(permissionAndGametypeRaw);
					return permissionAndGametype.permission === 0;
				}
			});
		}
		return null;
	}
	static stop() {
		runcmd(`stop`);
	}
	static lock(timeout = 0) {
		let pneuAPI_Tmp = getShareData("pneuAPI_Tmp");
		pneuAPI_Tmp.serverLock = true;
		setShareData("pneuAPI_Tmp", pneuAPI_Tmp);
		if (timeout !== 0) {
			setTimeout(function() {
				this.unlock();
			}, timeout);
		}
	}
	static unlock(timeout = 0) {
		let pneuAPI_Tmp = getShareData("pneuAPI_Tmp");
		pneuAPI_Tmp.serverLock = false;
		setShareData("pneuAPI_Tmp", pneuAPI_Tmp);
		if (timeout !== 0) {
			setTimeout(function() {
				this.lock();
			}, timeout);
		}
	}
	static log(message) {
		logout(message);
	}
	static logInfo(message) {
		log(`[${TimeNow()} INFO] ${messsage}`);
	}
	static executeCommand(command) {
		return runcmd(command);
	}
	static getProperties(key = "") {
		let file = fileReadAllText("server.properties").replace(/#.*|;.*/g, "");
		let properties = {};
		for (let i = 0; i < file.match(/.*=/g).length; i++) {
			properties[file.match(/.*=/g)[i].slice(0, -1)] = file.match(/=.*/g)[i].slice(1);
		}
		if (key === "") {
			return properties;
		} else {
			return properties[key];
		}
	}
	static getWhitelist() {
		return JSON.escapeAndParse(fileReadAllText("whitelist.json") ?? "[]");
	}
	static transferAllPlayers(address, port = 19132) {
		let onlinePlayersRaw = getOnLinePlayers();
		if (onlinePlayersRaw !== "null" && onlinePlayersRaw !== "null\n") {
			let onlinePlayers = JSON.escapeAndParse(onlinePlayersRaw);
			onlinePlayers.forEach(function(currentValue) {
				return transferserver(currentValue.uuid, address, port);
			});
		}
		return false;
	}
	static setTransferForward(address, port = 19132) {
		let pneuAPI_Tmp = getShareData("pneuAPI_Tmp");
		pneuAPI_Tmp.serverForward.enabled = true;
		pneuAPI_Tmp.serverForward.ip = address;
		pneuAPI_Tmp.serverForward.port = port;
		setShareData("pneuAPI_Tmp", pneuAPI_Tmp);
		this.transferAllPlayers(address, port);
	}
	static unsetTransferForward() {
		let pneuAPI_Tmp = getShareData("pneuAPI_Tmp");
		pneuAPI_Tmp.serverForward.enabled = false;
		setShareData("pneuAPI_Tmp", pneuAPI_Tmp);
	}
}
pneuAPI.Server = Server;
class Block {
	constructor(name) {
		
	}
}
pneuAPI.Block = Block;
class Level {
	static getBlock(x, y, z, dimension) {
		return getStructure(dimension, JSON.stringify({ "x": x, "y": y + 1, "z": z }), JSON.stringify({ "x": x, "y": y + 1, "z": z }), false, true);
	}
	static setBlock(x, y, z, dimension, block) {
		
	}
}
pneuAPI.Level = Level;
setShareData("pneuAPI", pneuAPI);
setShareData("loadPneuAPI", `JSON.escapeAndParse = getShareData("pneuAPI").escapeAndParse; Object.prototype.serialize = getShareData("pneuAPI").serialize; var setInterval = getShareData("pneuAPI").setInterval, Command = getShareData("pneuAPI").Command, SimpleForm = getShareData("pneuAPI").SimpleForm, ModalForm = getShareData("pneuAPI").ModalForm, CustomForm = getShareData("pneuAPI").CustomForm, NBT = getShareData("pneuAPI").NBT, NamedTag = getShareData("pneuAPI").NamedTag, ByteTag = getShareData("pneuAPI").ByteTag, ShortTag = getShareData("pneuAPI").ShortTag, IntTag = getShareData("pneuAPI").IntTag, LongTag = getShareData("pneuAPI").LongTag, FloatTag = getShareData("pneuAPI").FloatTag, DoubleTag = getShareData("pneuAPI").DoubleTag, ByteArrayTag = getShareData("pneuAPI").ByteArrayTag, StringTag = getShareData("pneuAPI").StringTag, ListTag = getShareData("pneuAPI").ListTag, CompoundTag = getShareData("pneuAPI").CompoundTag, IntArrayTag = getShareData("pneuAPI").IntArrayTag, Player = getShareData("pneuAPI").Player, Server = getShareData("pneuAPI").Server, Block = getShareData("pneuAPI").Block, Level = getShareData("pneuAPI").Level;);;`);
