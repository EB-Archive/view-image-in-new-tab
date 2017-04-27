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

let imgs = document.getElementsByTagName("img");
for (let i = 0; i < imgs.length; i++) {
	/** @type HTMLElement */
	let img = imgs[i];
	if (img.hasAttribute("contextmenu") && !img.getAttribute("contextmenu").startsWith("eb-img-menu:")) {
		continue;
	}
	let menuId = "eb-img-menu:" + Math.floor(Math.random() * 65535 + 1).toString(16) + ":" + i.toString(16);

	/** @type HTMLMenuElement */
	let menu = document.createElement("menu");
	menu.setAttribute("type", "context");
	menu.setAttribute("id", menuId);
	/** @type HTMLMenuItemElement */
	let menuitem = document.createElement("menuitem");
	menuitem.setAttribute("label", "View Image in New Tab");
	menuitem.setAttribute("icon", browser.extension.getURL("icons/256/picture-go.png"))
	menuitem.addEventListener("click", (event) => {
		/** @type String */
		let url = img.getAttribute("src");
		if (url.startsWith("//")) {
			url = window.location.protocol + url;
		} else if (url.startsWith('/')) {
			url = window.location.protocol + "//" + window.location.host + url;
		} else {
			let protocolRegex = /^\w+:\/\//;
			let hostNameRegex = /^\w+.\w+/;
			if (!url.match(protocolRegex)) {
				if (url.match(hostNameRegex)) {
					url = window.location.protocol + "//" + url;
				} else {
					url = window.location.protocol + "//" + window.location.host + '/' + url;
				}
			}
		}
		// calling `browser.tabs.create({url: String(message.url)});` here causes an error for some odd reason
		browser.runtime.sendMessage({type: "createTab", url: url});
		event.preventDefault();
		event.stopImmediatePropagation();
		event.stopPropagation();
	});
	menu.appendChild(menuitem);
	let menus = img.getElementsByTagName("menu");
	for (let m of menus) {
		if (m.hasAttribute("id") && m.getAttribute("id").startsWith("new-tab-image@exe-boss:menu")) {
			img.removeChild(m);
		}
	}
	img.appendChild(menu);
	img.setAttribute("contextmenu", menuId)
}
