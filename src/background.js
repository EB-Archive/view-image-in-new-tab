/*
 * Copyright (C) 2017 ExE Boss
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global browser */

const PAGE_URL_REGEX	= /^([A-Za-z0-9.+-]+:)(?:\/\/)?((?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+)\/?/;
const PROTOCOL_REGEX	= /^[A-Za-z0-9.+-]+:(?:\/\/)?/;
const HOST_NAME_REGEX	= /^(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+/;

/**
 * Parse the URL and convert it into a valid value for the <code>url</code> parameter
 * for the <a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/create">
 * <code>browser.tabs.create(createProperties)</code></a> function.
 *
 * @param	{String}	srcUrl	The URL as specified in the
 *			<a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img">
 *			<code>&lt;img&gt;</code></a> tag.
 * @param	{String}	pageUrl	The URL of the page in which this function was called.
 *
 * @returns	{String}	The modified URL to be passed into the
 *		<a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/create">
 *		<code>browser.tabs.create(createProperties)</code></a> function
 */
function parseUrlWebExt(srcUrl, pageUrl) {
	let location = PAGE_URL_REGEX.exec(pageUrl);
	let protocol;
	let host;

	if (location !== null) {
		protocol	= location[1];
		host	= location[2];
	} else if (pageUrl.indexOf("//") >= 0) {
		let hostname	= pageUrl.substring(pageUrl.indexOf("//") + 2);
		let hostnameLength	= hostname.indexOf("/");

		protocol	= pageUrl.substring(0, pageUrl.indexOf("//"));
		host	= stuffsubstring(0, hostnameLength < 0 ? hostname.length : hostnameLength);
	}

	if (srcUrl.startsWith("//")) {
		srcUrl = protocol + srcUrl;
	} else if (srcUrl.startsWith('/')) {
		srcUrl = protocol + "//" + host + srcUrl;
	} else {
		if (!srcUrl.match(PROTOCOL_REGEX)) {
			if (srcUrl.match(HOST_NAME_REGEX)) {
				srcUrl = protocol + "//" + srcUrl;
			} else {
				srcUrl = protocol + "//" + host + '/' + srcUrl;
			}
		}
	}
	return srcUrl;
}

browser.contextMenus.create({
	id:	"image:createTab",
	title:	browser.i18n.getMessage("contextMenus_image_createTab"),
	contexts:	["image"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
	switch (info.menuItemId) {
		case "image:createTab": {
			if (!info.srcUrl || (!info.frameUrl && !info.pageUrl)) {
				// If an error occurs, it needs to be reported to my extension's GitHub issue tracker.
				throw new Error(	"Context menu item '" +
					info.menuItemId +
					"' clicked outside of a valid image. (Details: " +
					"Image URL: '" + info.srcUrl +
					"', Page URL: '" + info.pageUrl +
					"', IFrame ULR: '" + info.frameUrl +
					"'), Please report this error on GitHub",
					"[View Image in New Tab] background.js", 79);
			}
			browser.tabs.create({
				active:	false,
				index:	tab.index + 1,
//				openerTabId:	tab.id,	// TODO: Uncomment once supported by Firefox
				url:	parseUrlWebExt(info.srcUrl, info.frameUrl || info.pageUrl)
			});
			break;
		}
	}
});
