/*
 *  ____                     ____  __   _
 * |  _ \  _ __   ___  _   _|_  _|/ / _|_|
 * | |_) /| '_ \ / _ \| | | | | |/ /_| | |
 * |  __/ | | | |  __/| |_| |_| |____  | |
 * |_|    |_| |_|\___|\___._|___|    |_|_|
 *
 * @author PneuJai
 * @link https://pneujai.github.io/
 * @project PneuJai's Form Api
 * @version 1.0.2
 * @usage var SimpleForm = getShareData("pFormAPI").SimpleForm, ModalForm = getShareData("pFormAPI").ModalForm, CustomForm = getShareData("pFormAPI").CustomForm;
 *
*/
const pFormAPI = {};
pFormAPI.SimpleForm = class {
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
};
pFormAPI.ModalForm = class {
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
		return this.button1
	}
	setButton2(text) {
		this.button2 = String(text);
	}
	getButton2(text) {
		return this.button2
	}
};
pFormAPI.CustomForm = class {
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
};
setShareData("pFormAPI", pFormAPI);