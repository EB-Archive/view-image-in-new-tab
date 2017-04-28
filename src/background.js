/*
 * Copyright 2017 ExE Boss.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global browser */

const PAGE_URL_REGEX	= /^(\w+:)\/\/((?:[^\.\/]+\.)*\w+)\/?/;
const PROTOCOL_REGEX	= /^\w+:\/\//;
const HOST_NAME_REGEX	= /^\w+.\w+/;

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
	title:	"View Image in New Tab",
	contexts:	["image"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
	switch (info.menuItemId) {
		case "image:createTab": {
			if (!info.srcUrl || (!info.frameUrl && !info.pageUrl)) {
				console.error(	"Context menu item",
					info.menuItemId,
					"clicked outside of a valid image.",
					"(Info:", info, ',',
					"Tab:", tab, ')');
				break;
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
