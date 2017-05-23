'use strict';
(function(win) {
	var doc = win.document;
	//doc.domain = "hexun.com";
	Date.prototype.format = function(fmt) {
		var o = {
			"M+": this.getMonth() + 1,
			"d+": this.getDate(),
			"h+": this.getHours(),
			"m+": this.getMinutes(),
			"s+": this.getSeconds(),
			"q+": Math.floor((this.getMonth() + 3) / 3),
			"S": this.getMilliseconds()
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	};

	function each(obj, callback) {
		var len = obj.length,
			i;
		for (i = 0; i < len; i++) {
			var result = callback.call(obj[i], i, obj[i]);
			if (result == false) break;
		}
	}

	function mix(a, b) {
		a = a || {};
		for (var c in b) a[c] = b[c];
		return a;
	}

	function dir(elem, dir) {
		var matched = [];
		while ((elem = elem[dir]) && elem.nodeType !== 9) {
			if (elem.nodeType === 1) {
				matched.push(elem);
			}
		}
		return matched;
	}

	function stringify(a) {
		var c = [];
		for (var b in a) c.push(b + "=" + encodeURIComponent(a[b]));
		return c.join('&')
	}

	function getElemAttr(elem, key, tag, attr) {
		var a = dir(elem, key),
			value = [];
		if (a.length > 0) {
			each(a, function(i, item) {
				if (item.tagName && item.tagName.toLowerCase() == tag) {
					each(attr.split(','), function(x, b) {
						if (item.getAttribute(b) || item[b]) {
							value.push(item.getAttribute(b) || item[b]);
						} else {
							value.push("");
						}
					})
				}
			})
		}
		return value;
	}

	function bindHandle(elem, eventName, fn) {
		if (elem.attachEvent) {
			elem.attachEvent("on" + eventName, fn);
		} else if (elem.addEventListener) {
			elem.addEventListener(eventName, fn, false)
		} else {
			elem["on" + eventName] = fn;
		}
	}
	var getCookieid = function(key) {
			var aCookie = doc.cookie.split(";"),
				result = false;
			each(aCookie, function(i, item) {
				//console.log(item)
				var aCrumb = item.split("=");
				if (key === aCrumb[0].replace(/^\s*|\s*$/, "")) {
					if (/aaa/.test(key)) {
						result = unescape(aCrumb[2]).split("&")[0];
					} else if (/bbb/.test(key)) {
						var v = unescape(aCrumb[1]).split("|")[0];
						if (typeof(v) != "undefined" && v != "") {
							result = v;
						}
					} else if (/ccc/.test(key)) {
						result = aCrumb[1];
					}
				}
			})
			return result ? result : 0;
		},
		cookies = [],
		name = ["aaa", "bbb", "ccc"],
		i;
	each(name, function(i, item) {
		var v = getCookieid(item);
		cookies.push(v != 0 && v != "0" ? v : 0);
	});

	var ua = navigator.userAgent.toLowerCase(),
		isMobile = /\/\/m\.aaa\.com/.test(location.href);//ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1 || ua.indexOf("ios") > -1 || ua.indexOf("android") > -1 || ua.indexOf("adr") > -1 || ua.indexOf("linux;") > -1 || ua.indexOf("mobile") > -1;
	//console.log("track_device:" + isPC);
	//console.log(cookies);
	if (cookies.length > 0) {
		bindHandle(document, "click", function(e) {
			var self = e.target,
				tag = self.tagName.toLowerCase(),
				data = {},
				time = new Date();
			if (!isMobile) {
				if (cookies[0] != "0" && cookies[0] != 0 && cookies[0] != undefined) {
					mix(data, {
						cid: cookies[0]
					});
				}
			} else {
				if (cookies[2] != "0" && cookies[2] != 0 && cookies[2] != undefined) {
					mix(data, {
						cid: cookies[2]
					});
				}
			}
			if (cookies[1] != "0" && cookies[1] != 0 && cookies[1] != undefined) mix(data, {
				userid: cookies[1]
			});
			time = time.format("yyyyMMddhhmmss");
			mix(data, {
				timestamp: time,
				action_type: "view"
			});
			//console.log(self)
			switch (tag) {
				case "a":
				case "em":
				case "span":
				case "strong":
				case "i":
					if (/^em|^span|^strong|^i/.test(tag)) {
						var result = getElemAttr(self, "parentNode", "a", "href,title,innerText,n-datagrand");
						if (result.length > 0) {
							mix(data, {
								url: result[0] || "",
								tagname: "a",
								title: result[1] || "",
								text: result[2] || "",
								action_type: result[3] || "view"
							});
						}
					} else {
						mix(data, {
							url: self.href,
							tagname: tag,
							title: self.title,
							text: self.innerText,
							action_type: self.getAttribute("n-datagrand") || self["n-datagrand"] || "view"
						});
					}
					break;
				case "img":
					var result = getElemAttr(self, "parentNode", "a", "href,title,n-datagrand");
					if (result.length > 0) {
						mix(data, {
							url: result[0] || "",
							title: result[1] || "",
							tagname: tag,
							alt: self.alt,
							src: self.src,
							action_type: result[2] || "view"
						});
					}
					break;
			}

			if (data.url != "" && /\/\d{4,4}\-\d{2,2}\-\d{2,2}\/(\d+)\.html/.test(data.url)) {
				var reg = /\/\d{4,4}\-\d{2,2}\-\d{2,2}\/(\d+)\.html/.exec(data.url);
				if (reg) data.newsid = reg[1];
				reg && reg[1] && (data.itemid = (/blog/.test(data.url) ? "b_" : "c_") + reg[1]);
			}
			//console.log(stringify(data), data)
			if (data.itemid) {
				var img = document.createElement("img");
				img.src = "//aaa?" + (data.cid && "cid=" + data.cid || "") + (data.itemid && "&itemid=" + data.itemid || "") + "&action_type=" + data["action_type"] + "&timestamp=" + data.timestamp;
				img.style.cssText = "display:none";
				document.body.appendChild(img);
			}
		});
	}
})(this)