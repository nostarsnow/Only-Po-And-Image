(function(window,$,undefined){
var nostar = ns = {
	clickLocked : false
};
var formatDate = ns.formatDate = function(date, format) { //格式化日期
    if (!date) return;
    if (!format) format = "yyyy-MM-dd HH:mm:ss";
    switch(typeof date) {
        case "string":
            date = new Date(date.replace(/-/, "/"));
            break;
        case "number":
            date = new Date(date);
            break;
    }
    if (!date instanceof Date) return;
    var dict = {
        "yyyy": date.getFullYear(),
        "M": date.getMonth() + 1,
        "d": date.getDate(),
        "H": date.getHours(),
        "m": date.getMinutes(),
        "s": date.getSeconds(),
        "MM": ("" + (date.getMonth() + 101)).substr(1),
        "dd": ("" + (date.getDate() + 100)).substr(1),
        "HH": ("" + (date.getHours() + 100)).substr(1),
        "mm": ("" + (date.getMinutes() + 100)).substr(1),
        "ss": ("" + (date.getSeconds() + 100)).substr(1)
    };
    return format.replace(/(yyyy|MM?|dd?|HH?|ss?|mm?)/g, function() {
        return dict[arguments[0]];
    });
};
var get = ns.get = {
	page : 0,
	allPage : 1,
	size : 20,
	title : {},
	replys : [],
	loaded : false
};
var push = ns.push = {
	page : 1,
	allPage : 1,
	size : 10,
	showReplys : [],
	type : '',
	typeChanged : false,
	paginationInit : false
};
var tips = ns.tips = {
	noTitle : "没有这个串！",
	noReplys : "该串还没有评论呢！",
	noMoreReplys : "没有更多评论了！",
	noName : "无名氏",
	noTitle : "无标题",
	noKuChuan : "请在ku岛的串下运行此插件！",
	noKu : "请在ku岛运行此插件！"
};
var api = ns.api = {
	host : window.location.href.split('?')[0].match(/(.*)\/(\d*)/),
	format : ".json",
	hostname : window.location.hostname
};
if ( api.host[2] == "" ){
	alert(ns.tips.noKuChuan);
	return false;
}else{
	api.host = api.host[0];
}
if ( api.hostname.indexOf('ku') > -1 ){
	api.imageServer = 'http://static.koukuko.com/h';
}else{
	alert(ns.tips.noKu);
	return false;
}
api.url = ns.api.url = api.host + api.format;
var pagination = {
	first : {
		can : '<a data-href="1">首页</a>',
		no : '<span data-href="1">首页</span>'
	},
	prev : {
		can : '<a data-href="prev">上一页</a>',
		no : '<span data-href="prev">上一页</span>'
	},
	next : {
		can : '<a data-href="next">下一页</a>',
		no : '<span data-href="next">下一页</span>'
	},
	last : {
		can : '<a data-href="last">尾页</a>',
		no : '<span data-href="last">尾页</span>'
	}
}
var $body = $("body");
var $poTitle = $(".h-threads-item-main");
var $showBox = $(".h-threads-list");
var $showEl = $("#h-content .h-threads-list .h-threads-item-replys");
var $pagination = $(".h-pagination");
var $onlyPo,$onlyImg,$page_first,$page_prev,$page_next,$page_last,$page_more,$page_now,$page_all,$loading;
var initLoading = function(){
	$loading = $('<div style="position:fixed;left:0;top:0;z-index:777;background-color:rgba(0,0,0,.7);width:100%;height:100%;display:none;"><div class="uk-progress uk-progress-small uk-progress-danger uk-progress-striped uk-active" style="position: absolute;width: 50%;height:15px;top: 0;left: 0;right: 0;bottom: 0;margin: auto;line-height: 15px;"><div class="uk-progress-bar" style="width: 100%;">Loading......</div></div></div>').appendTo($body);
	ns.load = function(){
		$loading.fadeIn(100);
	}
	ns.loadHide = function(){
		$loading.fadeOut(200);
	}
}
var initButton = function(){
	$onlyPo = $('<button class="uk-button uk-margin-left uk-margin-right onlyPo" data-type="po" type="button">只看po</button>');
	$onlyImg = $('<button class="uk-button onlyImg" data-type="image" type="button">只看图片</button>');
	$poTitle.find(".h-threads-info").append($onlyPo,$onlyImg);
	var buttonClick = function(){
		var $t = $(this),
			type = $t.data("type");
		if ( type === push.type ){
			return false;
		}
		push.typeChanged = true;
		push.page = 1;
		$onlyPo.removeClass("uk-button-primary");
		$onlyImg.removeClass("uk-button-primary");
		$t.addClass('uk-button-primary');
		push.type = type;
		$.when(getReplys())
		.done(function(){
			initPagination();
			if ( push.allPage <= 1 && push.showReplys.length < push.size ){
				$page_all.html( ( push.allPage <= 1 ? 1 : push.allPage ) );
				$page_more.remove();
				$page_next.after('<li class="page_last">' + pagination.last.can + '</li>');
				$page_last = $pagination.find(".page_last");
			}
			var nowPageSize = Math.ceil(push.showReplys.length/push.size);
			if ( nowPageSize > 2 ){
				for (var i = 2; i <= nowPageSize; i++) {
					$page_more.before('<li class="page_' + i + '"><a data-href="' + i + '">' + i + '</a></li>');
				};
			}
			if ( get.loaded ){
				if ( $pagination.find(".page_last").length < 1 ){
					$page_next.after('<li class="page_last">' + pagination.last.can + '</li>');
				}
				$page_last = $pagination.find(".page_last");
				$page_more.remove();
				$page_all.html(push.allPage);
			}
			pushHtml();
		})
	}
	$onlyPo.on("click",buttonClick);
	$onlyImg.on("click",buttonClick);
	$('html, body').animate({scrollTop:$showBox.offset().top},300);
}
var initPagination = function(){
	var html = '';
	html += '<li class="uk-disabled page_first">' + pagination.first.no + '</li>'+
			'<li class="uk-disabled page_prev">' + pagination.prev.no + '</li>'+
			'<li class="uk-active page_1"><a data-href="1">1</a></li>';
	if ( push.allPage === 1 && get.loaded ){
		html += '<li class="uk-disabled page_next">' + pagination.next.no + '</li>' +
				'<li class="uk-pagination-next page_page">页码：<span><page class="page_now">1</page> / <page class="page_all">?</page></span></li>'
	}else{
		html += '<li class="uk-disabled page_more"><a>...</a></li>'+
				'<li class="page_next">' + pagination.next.can + '</li>' + 
				'<li class="uk-pagination-next page_page">页码：<span><page class="page_now">1</page> / <page class="page_all">?</page></span></li>'
	}		
	$pagination.html(html);
	$page_first = $pagination.find(".page_first");
	$page_prev = $pagination.find(".page_prev");
	$page_next = $pagination.find(".page_next");
	$page_last = $pagination.find(".page_last");
	$page_more = $pagination.find(".page_more");
	$page_now = $pagination.find('.page_now');
	$page_all = $pagination.find(".page_all");
	if ( !push.paginationInit ){
		push.paginationInit = true;
		$pagination.on('click','li',function(){
			var $t = $(this);
			if ( $t.hasClass('uk-active') || $t.hasClass('page_more') || $t.hasClass('uk-disabled') || $t.hasClass('page_page') || ns.clickLocked ){
				return false;
			}
			ns.clickLocked = true;
			var pageHref = $t.find(':first').data("href"),
				replys = push.showReplys;
			if ( pageHref === 'next' ){	
				push.page++;
			}else if ( pageHref === 'prev' ){
				push.page--;
			}else if ( pageHref === 'last' ){
				push.page = push.allPage;
			}else{
				push.page = pageHref;
			}
			if ( push.page < 1 ){
				push.page = 1;
			}
			if ( push.page > push.allPage ){
				push.page = push.allPage;
			}
			if ( pageHref === 'next' ){
				var first = replys[push.size*(push.page-1)],
					last = replys[push.size*push.page];
				if ( $pagination.find(".page_"+push.page).length < 1 ){
					$pagination.find(".uk-active").removeClass('uk-active');
					$page_more.before('<li class="page_' + push.page + ' uk-active"><a data-href="' + push.page + '">' + push.page + '</a></li>');
				}
				if (  (first !== undefined && last !== undefined) || (last === undefined && get.loaded ) ){
					pushHtml();
				}else{
					$.when(getReplys(push.type))
					.done(function(){
						pushHtml();
					})
				}
			}else{
				pushHtml();
			}
		});
	}
}
function initReplys(){
	initImageBox();
    initContent();
}
var checkType = function(reply,type){
	type = type || push.type;
	if ( type === 'po' ){
		return reply.uid === get.title.uid;
	}
	if ( type === 'image' ){
		return (reply.image !== '' && reply.thumb !== '');
	}
}
var getReplys = function(type){
	var dtd = $.Deferred();
	type = type || push.type;
	ns.load();
	function ajax(){
		$.ajax({
			url: api.url,
			dataType: 'json',
			data: {
				page : ++get.page
			}
		})
		.done(function(data) {
			if ( get.page === 1 ){
				if ( data.code !== 200 ){
					alert(tips.noTitle);
					dtd.resolve();
					return;
				}
				get.allPage = data.page.size;
				get.title = data.threads;
			}
			if ( data.replys !== undefined && data.replys.length == 0 ){
				console.log(tips.noMoreReplys);
				get.page = get.allPage;
				get.loaded = true;
				dtd.resolve();
				return;
			}
			var replys = data.replys,
				poUid = data.threads.uid,
				showReplys = push.showReplys,
				lastPage = push.allPage,
				lastLength = showReplys.length;
			replys.map(function(reply,i){
				get.replys.push(reply);
				if ( checkType(reply,type) ){
					showReplys.push(i+(get.page-1)*get.size);
				}
			});
			push.allPage = Math.ceil(showReplys.length/push.size);
			if ( get.allPage === 1 ){
				get.page = get.allPage;
				get.loaded = true;
			}
			if ( (push.allPage > lastPage && showReplys.length >= push.size) || (lastLength > 0 && lastLength === showReplys.length && get.loaded ) ){
				dtd.resolve();
				return;
			}else{
				ajax();
			}
		});
	}
	if ( !get.loaded ){
		if ( get.replys.length > 0 && push.typeChanged ){
			push.showReplys.length = 0;
			get.replys.map(function(reply,i){;
				if ( checkType(reply,push.type) ){
					push.showReplys.push(i);
				}
			});
			push.allPage = Math.ceil(push.showReplys.length/push.size);
			if ( push.showReplys.length >= push.size ){
				dtd.resolve();
				return;
			}else{
				ajax();
			}
		}else{
			ajax();
		}
	}else{
		push.showReplys.length=0;
		get.replys.map(function(reply,i){;
			if ( checkType(reply,push.type) ){
				push.showReplys.push(i);
			}
		});
		push.allPage = Math.ceil(push.showReplys.length/push.size);
		dtd.resolve();
	}
	return dtd.promise();
}
function pushHtml(){
	$showEl.html(replysHtml(push.showReplys.slice(push.size*(push.page-1),push.size*push.page)));
	initReplys();
	$pagination.find(".uk-active").removeClass('uk-active');
	$pagination.find(".page_"+push.page).addClass('uk-active');
	$page_now.html(push.page);
	if ( push.page === push.allPage ){
		$page_more.remove();
		if ( $pagination.find(".page_last").length < 1 ){
			$page_next.after('<li class="page_last">' + pagination.last.can + '</li>');
		}
		$page_last = $pagination.find(".page_last");
		$page_all.html(push.allPage);
	}
	if ( push.page !== 1 ){
		$page_first.removeClass('uk-disabled').html(pagination.first.can);
		$page_prev.removeClass('uk-disabled').html(pagination.prev.can);
	}else{
		$page_first.addClass('uk-disabled').html(pagination.first.no);
		$page_prev.addClass('uk-disabled').html(pagination.prev.no);
	}
	if ( (push.page !== push.allPage || !get.loaded) && push.allPage > 1 ){
		$page_next.removeClass('uk-disabled').html(pagination.next.can);
		$page_last.removeClass('uk-disabled').html(pagination.last.can);
	}else{
		$page_next.addClass('uk-disabled').html(pagination.next.no);
		$page_last.addClass('uk-disabled').html(pagination.last.no);
	}
	$('html, body').animate({scrollTop:$showBox.offset().top},150,function(){
		ns.loadHide();
	});
	ns.clickLocked = false;
	push.typeChanged = false;
}
var replysHtml = ns.replysHtml = function(replys){
	var html = '';
	replys.map(function(value){
		reply = get.replys[value];
		html += '<div data-threads-id="' + reply.id + '" class="h-threads-item-reply">'+
					'<div class="h-threads-item-reply-icon">…</div>'+
					'<div class="h-threads-item-reply-main">'+
						'<div class="h-threads-info">'+
							'<span class="h-threads-info-title">'+
								(reply.title || ns.tips.noTitle) +
							'</span>' +
							'<span class="h-threads-info-email">' +
								(reply.name || ns.tips.noName) +
							'</span>' +
							'<span class="h-threads-info-createdat">' +
								formatDate(reply.createdAt) +
							'</span>' +
							'<span class="h-threads-info-uid">' +
								'ID:' + reply.uid +
								( reply.uid === get.title.uid ? '<span class="uk-text-primary uk-text-small">(PO主)</span>' : '') +
							'</span>' +
							'<span class="h-threads-info-report-btn">' +
								'[<a href="/值班室?r=' + reply.id + '">举报</a>]' +
							'</span>' +
							'<a href="/t/6501128?r=' + reply.id + '" class="h-threads-info-id">' +
								'No.' + reply.id + 
							'</a>' +
						'</div>';
		if ( reply.image !== "" || reply.thumb !== "" ){
			var imageUrl = api.imageServer + reply.image,
				thumbUrl = api.imageServer + reply.thumb;
			html += '<div class="h-threads-img-box">' +
						'<div class="h-threads-img-tool uk-animation-slide-top">' +
							'<span class="h-threads-img-tool-btn h-threads-img-tool-small uk-button-link">' +
								'<i class="uk-icon-minus"></i>收起' +
							'</span>' +
							'<a href="' + imageUrl +'" target="_blank" class="h-threads-img-tool-btn uk-button-link">' +
								'<i class="uk-icon-search-plus"></i>查看大图' +
							'</a>' +
							'<span class="h-threads-img-tool-btn h-threads-img-tool-left uk-button-link">' +
								'<i class="uk-icon-reply"></i>向左旋转' +
							'</span>' +
							'<span class="h-threads-img-tool-btn h-threads-img-tool-right uk-button-link">' +
								'<i class="uk-icon-share"></i>向右旋转' +
							'</span>' +
						'</div>' +
						'<a href="' + imageUrl +'" rel="_blank" target="_blank" class="h-threads-img-a">' +
							'<img data-src="' + thumbUrl +'" src="' + imageUrl +'" align="left" border="0" hspace="20" class="h-threads-img">' +
						'</a>' +
					'</div>';
		}
		html+=			'<div class="h-threads-content">' +
							reply.content +
						'</div>' +
					'</div>' +
				'</div>';
	});
	return html;
}
var init = function(){
	initLoading();
	initButton();
}
init();
if ( typeof define === "function" && define.amd ) {
	define("nostar", [], function() {
		return nostar;
	});
}
window.nostar = nostar;
})(window,jQuery);