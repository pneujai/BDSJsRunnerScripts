/*
 *  ____                     ____  __   _
 * |  _ \  _ __   ___  _   _|_  _|/ / _|_|
 * | |_) /| '_ \ / _ \| | | | | |/ /_| | |
 * |  __/ | | | |  __/| |_| |_| |____  | |
 * |_|    |_| |_|\___|\___._|___|    |_|_|
 *
 * @author PneuJai
 * @link https://pneujai.github.io/
 * @project PneuJai's Sign Edit
 * @version 1.0.1
 * @dependencies PneuJai's Nbt API, PneuJai's Form API
 *
*/

var NBT = getShareData("pNbtAPI").NBT, NamedTag = getShareData("pNbtAPI").NamedTag, ByteTag = getShareData("pNbtAPI").ByteTag, ShortTag = getShareData("pNbtAPI").ShortTag, IntTag = getShareData("pNbtAPI").IntTag, LongTag = getShareData("pNbtAPI").LongTag, FloatTag = getShareData("pNbtAPI").FloatTag, DoubleTag = getShareData("pNbtAPI").DoubleTag, ByteArrayTag = getShareData("pNbtAPI").ByteArrayTag, StringTag = getShareData("pNbtAPI").StringTag, ListTag = getShareData("pNbtAPI").ListTag, CompoundTag = getShareData("pNbtAPI").CompoundTag, IntArrayTag = getShareData("pNbtAPI").IntArrayTag;
var SimpleForm = getShareData("pFormAPI").SimpleForm, ModalForm = getShareData("pFormAPI").ModalForm, CustomForm = getShareData("pFormAPI").CustomForm;
function getUUIDByPlayername(playername) {
	if ((playername === undefined) || (playername === null)) {
		return undefined;
	}
	let onlinePlayersRaw = getOnLinePlayers();
	if (onlinePlayersRaw !== "null\n" && onlinePlayersRaw !== "null") {
		let onlinePlayers = JSON.parse(onlinePlayersRaw);
		return onlinePlayers.find(function (element) { return (element.playername === playername); }).uuid;
	}
	return undefined;
}

const pluginConfigRaw = fileReadAllText("plugin_data/SignEdit.json");
if (pluginConfigRaw === "undefined") {
	throw "StartUpError: Config file not found";
}
const pluginConfig = JSON.parse(pluginConfigRaw);

var pluginTmp = {};
pluginTmp.playersInSignEdit = [];
pluginTmp.signEditFormCallback = {};
pluginTmp.signEditData = {};
setBeforeActListener("onUseItem", function (eventDataRaw) {
	let eventData = JSON.parse(eventDataRaw);
	eventData.uuid = getUUIDByPlayername(eventData.playername);
	if (!(pluginConfig["ops-only"] && JSON.parse(getPlayerPermissionAndGametype(eventData.uuid)).permission < 2) && JSON.parse(getPlayerPermissionAndGametype(eventData.uuid)).permission >= 1 && eventData.itemid === pluginConfig["keyitem-id"] && eventData.itemaux === pluginConfig["keyitem-meta"]) {
		let targetBlock = NBT.parseFromNBTString(getStructure(eventData.dimensionid, JSON.stringify({ "x": eventData.position.x, "y": eventData.position.y + 1, "z": eventData.position.z }), JSON.stringify({ "x": eventData.position.x, "y": eventData.position.y + 1, "z": eventData.position.z }), false, true));
		let targetBlockName = targetBlock.getNamedTagEntry("structure").getNamedTagEntry("palette").getNamedTagEntry("default").getNamedTagEntry("block_palette").getValue()[0].getNamedTagEntry("name").getValue();
		if (targetBlockName === "minecraft:standing_sign" || targetBlockName === "minecraft:wall_sign" || targetBlockName === "minecraft:spruce_standing_sign" || targetBlockName === "minecraft:spruce_wall_sign" || targetBlockName === "minecraft:birch_standing_sign" || targetBlockName === "minecraft:birch_wall_sign" || targetBlockName === "minecraft:jungle_standing_sign" || targetBlockName === "minecraft:jungle_wall_sign" || targetBlockName === "minecraft:acacia_standing_sign" || targetBlockName === "minecraft:acacia_wall_sign" || targetBlockName === "minecraft:darkoak_standing_sign" || targetBlockName === "minecraft:darkoak_wall_sign" || targetBlockName === "minecraft:crimson_standing_sign" || targetBlockName === "minecraft:crimson_wall_sign" || targetBlockName === "minecraft:warped_standing_sign" || targetBlockName === "minecraft:warped_wall_sign") {
			if (!pluginTmp.playersInSignEdit.includes(eventData.uuid)) {
				pluginTmp.playersInSignEdit.push(eventData.uuid);
				let signTextLines = targetBlock.getNamedTagEntry("structure").getNamedTagEntry("palette").getNamedTagEntry("default").getNamedTagEntry("block_position_data").getValue()[0].getNamedTagEntry("block_entity_data").getNamedTagEntry("Text").getValue().split("\n");
				pluginTmp.signEditData[eventData.uuid] = { "x": eventData.position.x, "y": eventData.position.y + 1, "z": eventData.position.z };
				let signEditForm = new CustomForm();
				signEditForm.setTitle("Sign Edit");
				for (let i = 0; i < 4; i++) {
					signEditForm.addInput(`Line ${i + 1}`,"", signTextLines[i] ?? "");
				}
				let signEditFormId = signEditForm.sendToPlayer(eventData.uuid);
				pluginTmp.signEditFormCallback[signEditFormId] = function(eventData) {
					if (eventData.selected !== "null") {
						let targetBlock = NBT.parseFromNBTString(getStructure(eventData.dimensionid, JSON.stringify(pluginTmp.signEditData[eventData.uuid]), JSON.stringify(pluginTmp.signEditData[eventData.uuid]), false, true));
						targetBlock.getNamedTagEntry("structure").getNamedTagEntry("palette").getNamedTagEntry("default").getNamedTagEntry("block_position_data").getValue()[0].getNamedTagEntry("block_entity_data").getNamedTagEntry("Text").setValue(JSON.parse(eventData.selected).join("\n"));
						setStructure(targetBlock.toString(), eventData.dimensionid, JSON.stringify(pluginTmp.signEditData[eventData.uuid]), 0, false, true);
					}
					delete pluginTmp.signEditData[eventData.uuid];
					delete pluginTmp.signEditFormCallback[signEditFormId];
				}
			}
		}
	}
});
setBeforeActListener("onFormSelect", function (eventDataRaw) {
	let eventData = JSON.parse(eventDataRaw);
	eventData.uuid = getUUIDByPlayername(eventData.playername);
	if (pluginTmp.playersInSignEdit.includes(eventData.uuid)) {
		pluginTmp.playersInSignEdit.splice(pluginTmp.playersInSignEdit.indexOf(eventData.uuid), 1);
	}
	if (pluginTmp.signEditFormCallback[eventData.formid] != null) {
		pluginTmp.signEditFormCallback[eventData.formid](eventData);
	}
});
setBeforeActListener("onPlayerLeft", function (eventDataRaw) {
	let eventData = JSON.parse(eventDataRaw);
	if (pluginTmp.playersInSignEdit.includes(eventData.uuid)) {
		pluginTmp.playersInSignEdit.splice(pluginTmp.playersInSignEdit.indexOf(eventData.uuid), 1);
	}
});
