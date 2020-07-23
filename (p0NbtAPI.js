/*
 *  ____                     ____  __   _
 * |  _ \  _ __   ___  _   _|_  _|/ / _|_|
 * | |_) /| '_ \ / _ \| | | | | |/ /_| | |
 * |  __/ | | | |  __/| |_| |_| |____  | |
 * |_|    |_| |_|\___|\___._|___|    |_|_|
 *
 * @author PneuJai
 * @link https://pneujai.github.io/
 * @project PneuJai's Nbt Api
 * @version 1.0.6
 * @usage var NBT = getShareData("pNbtAPI").NBT, NamedTag = getShareData("pNbtAPI").NamedTag, ByteTag = getShareData("pNbtAPI").ByteTag, ShortTag = getShareData("pNbtAPI").ShortTag, IntTag = getShareData("pNbtAPI").IntTag, LongTag = getShareData("pNbtAPI").LongTag, FloatTag = getShareData("pNbtAPI").FloatTag, DoubleTag = getShareData("pNbtAPI").DoubleTag, ByteArrayTag = getShareData("pNbtAPI").ByteArrayTag, StringTag = getShareData("pNbtAPI").StringTag, ListTag = getShareData("pNbtAPI").ListTag, CompoundTag = getShareData("pNbtAPI").CompoundTag, IntArrayTag = getShareData("pNbtAPI").IntArrayTag;
 *
*/

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
		let jsonRaw = text;
		let jsonRawToBeEscaped;
		let jsonRawQuoted = jsonRaw.match(/"[\s\S]*?"/g) ?? [];
		jsonRawToBeEscaped = jsonRawQuoted.filter(function (element) { return element.match(/\n/g) !== null; });
		for (let i = 0; i < jsonRawToBeEscaped.length; i++) {
			jsonRaw = jsonRaw.replace(jsonRawToBeEscaped[i], jsonRawToBeEscaped[i].replace(/\n/gm, "\\\\n"));
		}
		jsonRawToBeEscaped = jsonRawQuoted.filter(function (element) { return element.match(/\r/g) !== null; });
		for (let i = 0; i < jsonRawToBeEscaped.length; i++) {
			jsonRaw = jsonRaw.replace(jsonRawToBeEscaped[i], jsonRawToBeEscaped[i].replace(/\r/gm, "\\\\r"));
		}
		let json = JSON.parse(jsonRaw);
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
		return NBT.TAG_Compound;
	}
}
const pNbtAPI = { "NBT": NBT, "NamedTag": NamedTag, "ByteTag": ByteTag, "ShortTag": ShortTag, "IntTag": IntTag, "LongTag": LongTag, "FloatTag": FloatTag, "DoubleTag": DoubleTag, "ByteArrayTag": ByteArrayTag, "StringTag": StringTag, "ListTag": ListTag, "CompoundTag": CompoundTag, "IntArrayTag": IntArrayTag};
setShareData("pNbtAPI", pNbtAPI);