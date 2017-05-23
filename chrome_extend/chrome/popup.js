function tip(ops) {
	try {
		var notification = chrome.notifications;
		notification.clear("hexun_chrome");
		notification.create("hexun_chrome", ops);
	} catch (e) {
		console.log(e.message);
	}
}
jQuery(function() {
	new tip({
		iconUrl: "icon.png",
		type: "basic",
		title: "友情提示",
		message: "欢迎访问手机和讯网，手机和讯网用户提供最新最专业的财经资讯、视频，还有实时的股市行情、外汇期货基金等市场信息。"
	});
	jQuery(".goback").click(function(e) {
		e.preventDefault();
		jQuery(".miframe").attr("src", "http://m.hexun.com");
	});
	jQuery(".button").click(function(e) {
		e.preventDefault();
		var href = jQuery(this).attr("data-href");
		if (href) {
			new tip({
				iconUrl: "icon.png",
				type: "basic",
				title: "友情提示",
				message: "欢迎访问和讯网，和讯网-中国财经网络领袖和中产阶级网络家园，创立于1996年，是中国最早而且最大的财经门户网站，为您全方位提供财经资讯及全球金融市场行情，覆盖股票、基金、期货、股指期货、外汇、债券、保险、银行、黄金、理财、股吧、博客等财经综合信息。"
			});
			try {
				chrome.tabs.create({
					url: href
				});
			} catch (e) {
				console.log(e.message)
			}
		}
	});
	setTimeout(function() {
		jQuery(".startup").addClass('hide');
	}, 2500);
});