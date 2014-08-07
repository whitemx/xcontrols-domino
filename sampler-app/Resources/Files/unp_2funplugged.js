/**
 * Copyright 2013 Teamstudio Inc Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law
 * or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License
 */

var unp = {
	_firstLoad : true,
	_oldiscrollbottom : ""
}

$(window).bind(
		"popstate",
		function() {
			if (!unp._firstLoad) {
				
			}
		});

unp.storePageRequest = function(url) {

	this._firstLoad = false;

	if (url.indexOf("#") > -1) {
		url = url.substring(0, url.indexOf(" #"));
	}
	if (url.indexOf("?") == -1) {
		url += "?";
	}
	url += "&history=true";
	history.pushState(null, "", url);
	// console.log("pushed " + url);

}

$(window).load( function() {
	// publish event when changing main menu option
		$("a[data-title]").on("click", function() {
			$.Topic("navigateTo").publish($(this).data("title"));
		});

		// destroy modals on close (to reload the contents when
		// using the remote property)
		$('body').on('hidden.bs.modal', '.modal', function() {
			$(this).removeData('bs.modal');
		});

		if (bootcards.isXS()) {
			// restrict footer to only 4 items
			var $footer = $(".navbar-fixed-bottom .btn-group");
			if ($footer.length > 0) {
				var $links = $('a', $footer);
				if ($links.length > 4) {
					$links.each( function(idx) {
						if (idx >= 4) {
							this.remove();
						}
					});
				}
			}
		}

		$('.navmenu').offcanvas( {
			toggle : false
		});
		$('.offcanvas-toggle').on('click', function() {
			$('.navmenu').offcanvas('toggle');
		})
		unp.initiscroll();
		try {
			$(".opendialoglink").click( function(event) {
				unp.openDialog($(this).attr('href'));
			});
		} catch (e) {

		}
		try {
			FastClick.attach(document.body);
		} catch (e) {
		}

		unp.initSearch();
		unp.highlightCurrentPage();
		unp.initCalendar();
		unp.initNavigator();
		$(document).ajaxStop( function() {
			unp.initRichText();
			unp.initReaderButtons();
			unp.highlightCurrentPage();
			unp.initCalendar();
		});
		
		//Open first item in flat view if necessary
		//highlight first list group option (if non active yet)
		if ($('[expand-first]').length == 0 || $('[expand-first="yes"]').length > 0){
			if ( $('.list-group a.active').length == 0 ) {
				if (!bootcards.isXS()){
					$('.list-group a').first().click();
				}
			}
		}
	});

unp.highlightCurrentPage = function(){
	var href = window.location.href;
	if (unpluggedserver){
		href = href.replace('.nsf', '.unp');
	}
	//Deal with footer links
	$(".navbar-fixed-bottom a").each(function(){
		if (href.indexOf($(this).attr('href')) > -1){
			$(this).addClass('active')
		}
	})
	//Deal with header links
	$(".navbar-fixed-top .navbar-nav a").each(function(){
		if (href.indexOf($(this).attr('href')) > -1){
			$(this).parent().addClass('active')
		}
	})
}

unp.initNavigator = function(){
	$('[data-toggle="collapse"]').click(function(){
		$(this).next().toggleClass('in');
		//$(this).find("i").toggleClass('fa-chevron-circle-right');
		//$(this).find("i").toggleClass('fa-chevron-circle-down');
	})
}

unp.initReaderButtons = function() {
	if ($(".fontsizebuttons").length > 0) {
		$(".input-search-frame").hide();
	} else {
		$(".input-search-frame").show();
	}
}

unp.initHideFooter = function() {
	try {
		$(':input, textarea, select').on('focus', function() {
			$(".footer").hide();
			_oldiscrollbottom = $(".iscrollcontent").css("bottom");
			$(".iscrollcontent").css("bottom", "0px");
		});
		$(':input, textarea, select').on('blur', function() {
			$(".footer").show();
			$("iscrollbottom").css("bottom", _oldiscrollbottom);
			window.scrollTo(0, 1);
		});
	} catch (e) {

	}
}

unp.isAndroid = function() {
	return /android/i.test(navigator.userAgent.toLowerCase());
}

unp.isIOS = function() {
	return /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
}

unp.initRichText = function() {
	if ($("#editor-container").length > 0){
	 var editor = new Quill('#editor-container', {
		modules: {
		 'toolbar': { container: '#formatting-container' },
		 'image-tooltip': false,
		 'link-tooltip': false
	    }
	 });
	 editor.on('selection-change', function(range) {
	 });
	 editor.on('text-change', function(delta, source) {
		 $(".richtextsourcefield").val(editor.getHTML());
	 });
	 editor.setHTML($(".richtextsourcefield").val());
	}
}

unp.htmlDecode = function(input) {
	var e = document.createElement('div');
	e.innerHTML = input;
	return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

unp.getURLParameter = function(name) {
	return decodeURIComponent((new RegExp(
			'[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [
			, "" ])[1].replace(/\+/g, '%20'))
			|| null;
}

window.addEventListener('orientationchange', function() {
	unp.changeorientation();
})

unp.changeorientation = function() {
	unp.initiscroll();
	unp.initCalendar();
}

unp.allowFormsInIscroll = function() {
	[].slice.call(document.querySelectorAll('input, select, button, textarea'))
			.forEach(
					function(el) {
						el.addEventListener(
								('ontouchstart' in window) ? 'touchstart'
										: 'mousedown', function(e) {
									e.stopPropagation();
								})
					});
}

// var firedrequests = new Array();
unp.stopViewSpinner = function() {
	$(".loadmorelink").disabled = false;
	$("#loadmorespinner").hide();
}

var loadmoreloading = false;
var loadedurls = [];
unp.loadmore = function(dbName, viewName, summarycol, detailcol, category,
		xpage, refreshmethod, photocol, ajaxload, target) {
	if (($('.searchbox').val() == "" || $('.localsearchbox').val() == ""  || ($('.searchbox').length == 0 && $('.localsearchbox').length == 0)) && !loadmoreloading) {
		loadmoreloading == true;
		// try {
		$(".loadmorelink").hide();
		$("#loadmorespinner").show();
		setTimeout("unp.stopViewSpinner()", 5000);
		var itemlist = $("#list .list-group .list-group-item");
		var pos = itemlist.length;
		// console.log('Pos = ' + pos);
		var thisArea = $(".summaryDataRow");
		var url = "UnpFlatViewList.xsp?chosenView="
				+ encodeURIComponent(viewName) + "&summarycol="
				+ encodeURIComponent(summarycol) + "&detailcol="
				+ encodeURIComponent(detailcol) + "&photocol="
				+ encodeURIComponent(photocol) + "&category="
				+ encodeURIComponent(category) + "&xpage=" + xpage + "&dbName="
				+ dbName + "&refreshmethod=" + refreshmethod + "&start=" + pos
				+ "&ajaxload=" + ajaxload + "&target=" + target;
		if (loadedurls.indexOf(url) == -1) {
			loadedurls.push(url);
			// console.log('Loading ' + url);
			thisArea.load(url + " #results",
					function() {
						var firsturl = $(".summaryDataRow a").first().prop(
								'onclick');
						if ($("#list .panel .list-group a[onclick='" + firsturl
								+ "']").length > 0) {
							// console.log("We've already loaded " + firsturl);
				} else {
					// console.log('Adding ' + $('.summaryDataRow a').length + '
					// items to list');
					$("#list .panel .list-group ").append(
							$(".summaryDataRow .list-group-item"));
				}
				if ($(".summaryDataRow").text().indexOf("NOMORERECORDS") > -1) {
					// console.log('Reached end of view with ' + $("#list
					// .list-group a").length + ' elements');
					$("#pullUp").hide();
					$(".loadmorelink").hide();
					$("#loadmorespinner").hide();
				} else {
					$("#pullUp").show();
					$(".loadmorelink").show();
					$("#loadmorespinner").hide();
				}
				$(".summaryDataRow").empty();
				try {
					scrollContent.refresh();
				} catch (e) {
				}

				if ($("#pullUp").hasClass('loading')) {
					$("#pullUp").removeClass("loading");
				}
				loadmoreloading = false;
				return false;
			});
		} else {
			// console.log('We already loaded ' + url);
		}

	} else {
		// Don't load more when search is active
		if (loadmoreloading) {
			// console.log('Load More is loading...');
		}
	}
}

unp.openDocument = function(url, target, caller) {
	var thisArea = $("#" + target);
	thisArea.load(url.replace(" ", "%20") + " #" + target + ">div", function(
			data, status, xhr) {
		if (status == "error") {
			alert("An error occurred:\n\n" + xhr.status + " " + xhr.statusText
					+ "\n\n" + $(data).text());
			return false;
		} else {
			$('#list .active').removeClass('active');
			if (caller) {
				$(caller).addClass('active');
			}
			if (firedrequests != null) {
				firedrequests = new Array();
			}

			unp.storePageRequest(url);

			unp.initiscroll();
			if (url.indexOf("editDocument") > -1
					|| url.indexOf("newDocument") > -1) {
				unp.allowFormsInIscroll();
			}
			if ($("#input-search").hasClass("input-search")) {
				$(".iscrollcontent").css("top", "90px");
			}

			if (bootcards.isXS()) {
				if ($("#" + target).hasClass("hidden-xs")) {
					$("#" + target).removeClass("hidden-xs");
					$("#list").addClass("hidden-xs");
					$('.btn-menu').addClass('hidden');
					$('.btn-back').removeClass('hidden');
					$('#list').animate( {
						scrollTop : 0
					}, '500', 'easeOutExpo');
				} else {
					$("#" + target).addClass("hidden-xs");
					$("#list").removeClass("hidden-xs");
					$('.btn-menu').removeClass('hidden');
					$('.btn-back').addClass('hidden');
					$('#list').animate( {
						scrollTop : 0
					}, '500', 'easeOutExpo');
				}
			} else {
				window.scrollTo(0, 0);
			}
			return false;
		}
	});
	event.stopPropagation();
	return false;
}

unp.editDocument = function(xpage, unid){
	
	var url = xpage + '?action=editDocument&documentId=' + unid + ' .modal-content';
	$('#editModal .modal-content').load(url, function(response, status, xhr){
		//console.log(status);
		$('#editModal').modal();
		unp.initDeleteable();
		unp.initAutoComplete();
		unp.initRichText();
		unp.initToggle();
		unp.initDates();
	});
	return false;
}

unp.newDocument = function(xpage){
	
	var url = xpage + '?action=newDocument .modal-content';
	$('#editModal .modal-content').load(url, function(){
		$('#editModal').modal();
		unp.initDeleteable();
		unp.initAutoComplete();
		unp.initRichText();
		unp.initToggle();
		unp.initDate();
	});
}


unp.goback = function() {
	if (bootcards.isXS()) {
		if ($("#doccontent").hasClass("hidden-xs")) {
			$("#doccontent").removeClass("hidden-xs");
			$("#list").addClass("hidden-xs");
			$('.btn-menu').addClass('hidden');
			$('.btn-back').removeClass('hidden');
			$('#list').animate( {
				scrollTop : 0
			}, '500', 'easeOutExpo');
		} else {
			$("#doccontent").addClass("hidden-xs");
			$("#list").removeClass("hidden-xs");
			$('.btn-menu').removeClass('hidden');
			$('.btn-back').addClass('hidden');
			$('#list').animate( {
				scrollTop : 0
			}, '500', 'easeOutExpo');
		}
	} else {
		history.back()
	}
}

unp.saveDocument = function(formid, unid, viewxpagename, formname, parentunid, dbname) {
	var data = $("#editModal :input").serialize();
	$(".richtextsourcefield").each(function(){
		var source = $(this);
		var destfieldname = source.attr("fieldname");
		var richtext = encodeURIComponent($(this).val());
		data += "&richtext:" + destfieldname + "=" + richtext; 
	})
	$('#editModal input[type=checkbox]').each( function() {
		var val;
		if (!this.checked) {
			val = "off";
			if ($(this).attr('uncheckedValue')) {
				val = $(this).attr('uncheckedValue');
			}
			data += '&' + encodeURIComponent(this.name) + '=' + val;
		} else {
			val = "on";
			if ($(this).attr('checkedValue')) {
				val = $(this).attr('checkedValue');
			}
			var newval = encodeURIComponent(this.name) + '=' + val;
			var oldval = encodeURIComponent(this.name) + '=on'
			data = unp.replaceSubstring(data, oldval, newval);
		}
	});
	var url = 'UnpSaveDocument.xsp?unid=' + unid + "&formname=" + formname
			+ "&rnd=" + Math.floor(Math.random() * 1001);
	if (parentunid) {
		url += "&parentunid=" + parentunid;
	}
	if (dbname) {
		url += "&dbname=" + dbname;
	}
	var valid = unp.validate();
	if (valid) {
		$.ajax( {
			type : 'POST',
			url : url,
			data : data,
			cache : false,
			encoding : "UTF-8",
			beforeSend : function() {
		}
		}).done( function(response) {
			if (response.length == 32) {
				unp.openDocument(viewxpagename
						+ "?action=openDocument&documentId=" + response,
						"doccontent");
				unp.initiscroll();
				$('#editModal').modal('hide');
				unp.refreshCalendar();
			} else {
				alert(response);
			}
		});
	} else {
		return false;
	}
}

unp.replaceSubstring = function(inputString, fromString, toString) {
	if (inputString.indexOf(fromString) > -1){
		var newval = inputString.split(fromString);
		return newval[0] + toString + newval[1];
	}else{
		return inputString;
	}
}

unp.validate = function() {
	$('.has-error').removeClass('has-error');
	var valid = true;
	var msg = "Validation Errors:\n";
	$(".required").each( function() {
		if ($(this).val() == "") {
			var label = $("label[for='" + $(this).attr('id') + "']");
			msg += "Please complete " + label.text() + "\n";
			if (valid){
				$(this).focus();
			}
			valid = false;
			$(this).closest(".form-group").addClass('has-error');
		}
	})
	if (!valid){
		//alert(msg);
	}
	return valid;
}

var firedrequests;
unp.loadPage = function(url, target, menuitem, pushState) {

	var _pushState = true;
	if (arguments.length >= 4) {
		_pushState = pushState;
	}

	var thisArea = $("#" + target);
	thisArea.load(url, function(data, status, xhr) {
		if (status == "error") {
			alert("An error occurred:\n\n" + xhr.status + " " + xhr.statusText
					+ "\n\n" + $(data).text());
			return false;
		} else {

			if (firedrequests != null) {
				firedrequests = new Array();
			}

			if (_pushState) {
				unp.storePageRequest(url);
			}

			try {
				$('.categoryRow').first().click();
			} catch (e) {

			}

			return false;
		}
	});
	if (_pushState) {
		var menuitems = $("#menuitems li");
		menuitems.removeClass("viewMenuItemSelected");
		menuitems.removeClass("active");
		menuitems.addClass("viewMenuItem");
		$(".menuitem" + menuitem).removeClass("viewMenuItem");
		$(".menuitem" + menuitem).addClass("viewMenuItemSelected");
		$(".menuitem" + menuitem).addClass("active");
	}
}

unp.openPage = function(url, target) {
	window.location.href = url;
}

unp.initDeleteable = function() {
	$('.bootcards-clearinput').click(function(){
		$(this).blur();
		$(this).prev().val('');
		$(this).prev().focus();
	})
}

unp.initToggle = function(){
	$('.bootcards-toggle').click(function(){
		$(this).toggleClass('active');
		var checkboxes = $(this).parent().find('input [type="checkbox"]');
		if (checkboxes.length > 0){
			checkboxes[0].prop("checked", !checkboxes[0].prop("checked"));
		}
	})
}

unp.initDates = function(){
	//Now init datetime-local fields bloody Domino won't output correct format!
	$('[datevalue]').each(function(){
		var newval = moment(parseInt($(this).attr('datevalue'), 10)).format().substr(0, 16);
		$(this).attr('value', newval);
		$(this).attr('type', 'datetime-local');
	})
}

unp.initAutoComplete = function() {
	$(".autocomplete").each( function() {
		var thefield = $(this);
		var options = {
			serviceUrl : thefield.attr('auto-src')
		};
		var a = $(this).autocomplete(options);
	});
}

var touchmovehandler = function(e) {
	e.preventDefault();
}

var scrollContent;
var scrollMenu;
unp.initiscroll = function() {
	// Register the letter click events
	$(".bootcards-az-picker a").click( function(event) {
		event.stopPropagation();
		if ($(this).hasClass("switchletterlist")) {
			$(".atozpicker").toggle();
			$(".numberpicker").toggle();
		} else {
			unp.jumpToLetter($(this), event);
		}
		return false;
	});

	if (unp.isIOS() || unp.isAndroid()) {
		var navbarheight = 0;
		$('.navbar').each( function() {
			navbarheight += $(this).height();
		})
		$(".fullheightrow").height(($(window).height() - 44));
	}

	try {
		pullUpEl = document.getElementById('pullUp');
		pullUpOffset = pullUpEl.offsetHeight;
	} catch (e) {
	}

	if (unp.isIOS() || unp.isAndroid()) {
		$('#list')
				.scroll(
						function() {
							if ($(this)[0].scrollHeight - $(this).scrollTop() == $(
									this).outerHeight()) {
								unp.doflatviewscroll();
							}
						});
	} else {
		$(window).bind(
				'scroll',
				function() {
					if ($(document).height() <= ($(window).height()
							+ $(window).scrollTop() + 200)) {
						unp.doflatviewscroll();
					}
				})
	}

	$(".atozpicker").show();
}

unp.doflatviewscroll = function() {
	if (pullUpEl) {
		pullUpEl.className = 'flip';
		pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Release to refresh...';
		if (pullUpEl.className.match('flip')) {
			pullUpEl.className = 'loading';
			pullUpEl.querySelector('.pullUpLabel').innerHTML = '';
			$(".pullUpLabel").addClass('fa fa-spinner fa-spin');
			$(".loadmorebutton").click();
		}
	}
}

unp.jumpToLetter = function(letterelement, event) {
	$('#list').animate( {
		scrollTop : 0
	}, 0);
	var letter = letterelement.text();
	var list = $("#list .list-group a").each( function() {
		var summary = $(this).find("h4").text();
		var firstletter = summary.substring(0, 1);
		if (firstletter == letter) {
			$('#list').animate( {
				scrollTop : $(this).offset().top - 60
			}, 0);
			return false;
		} else if (firstletter > letter) {
			$('#list').animate( {
				scrollTop : $(this).offset().top - 120
			}, 0);
			return false;
		} else {
		}
	});
}

unp.openDialog = function(id) {
	if (id != null && id != "#") {
		$("." + id).modal('show');
	}
}

unp.accordionLoadMore = function(obj, viewName, catName, xpage, dbname,
		photocol) {
	
	var pos = $('.data-row').length;
	var thisUrl = "UnpAccordionViewList.xsp?chosenView="
			+ encodeURIComponent(viewName) + "&catFilter="
			+ encodeURIComponent(catName) + "&xpageDoc=" + xpage + "&start="
			+ pos + "&dbname=" + dbname + "&photocol=" + photocol;

	var tempHolder = $(".summaryDataRow");
	$(tempHolder).load(
			thisUrl + " #results a",
			function() {
				$(obj).after($(".summaryDataRow a"));
				if ($(obj).hasClass('load-more')){
					$(obj).remove();
				}else{
					//$(obj).addClass('active');
				}
			});

	$(obj).nextAll(".summaryDataRow:first").children(".accLoadMoreLink").show();

	// check if there's only 1 expanded category and set a class to create a
	// rounded bottom border
	if ($("#summaryList .categoryrow").length == 1) {
		$("#summaryList div.summaryDataRow ul.accordionRowSet li:last-child")
				.addClass("roundedBottom");
	}
}

unp.fetchDetails = function(obj, viewName, catName, xpage, dbname, photocol) {
	if (!$(obj).hasClass("collapsed")) {
		//We want to collapse the current category
		console.log('Collapsing rows...');
		$(obj).addClass("collapsed");
		$('.data-row').remove();
		$('.load-more').remove();
		//Scroll to the top of the object
		$('#list').scrollTop($('#list').scrollTop() + $(obj).position().top);
	} else {
		//We want to get a new category
		//First make sure that all other categories are closed
		$('#list .list-group-item').addClass('collapsed');
		$("#list .active").removeClass('active');
		$('.data-row').remove();
		$('.load-more').remove();
		console.log('Getting category ' + catName);
		$(obj).removeClass('collapsed');
		$('#list').scrollTop($('#list').scrollTop() + $(obj).position().top);
		unp.accordionLoadMore(obj, viewName, catName, xpage, dbname, photocol);
	}
}

unp.fetchMoreDetails = function(obj, viewName, catName, xpage, dbname, photocol) {

	unp.accordionLoadMore(obj, viewName, catName, xpage, dbname, photocol);
}

unp.syncAllDbs = function() {
	$.get("UnpSyncAll.xsp", function(data) {
		location.reload();
	});
}

function x$(idTag, param) { // Updated 18 Feb 2012
	idTag = idTag.replace(/:/gi, "\\:") + (param ? param : "");
	return ($("#" + idTag));
}

unp.increaseFontSize = function(button) {
	$(".typographyreadcontent").find("*").each(
			function() {
				$(this).css("font-size",
						(parseInt($(this).css("font-size"), 10) + 2) + "px");
				if (parseInt($(this).css("line-height"), 10) <= parseInt(
						$(this).css("font-size"), 10)) {
					$(this).css(
							"line-height",
							(parseInt($(this).css("line-height"), 10) + 2)
									+ "px");
				}
			});
}
unp.decreaseFontSize = function(button) {
	$(".typographyreadcontent").find("*").each(
			function() {
				var tagName = $(this).prop("tagName");
				var fontSize = parseInt($(this).css("font-size"), 10);
				var minFontSize = 4;
				if (tagName == "H1") {
					minFontSize = 28;
				} else if (tagName == "H2") {
					minFontSize = 24;
				} else if (tagName == "H3") {
					minFontSize = 18;
				} else if (tagName == "H4") {
					minFontSize = 12;
				} else if (tagName == "H5") {
					minFontSize = 8;
				}
				if (fontSize - 2 >= minFontSize) {
					$(this).css("font-size", (fontSize - 2) + "px");
					if (parseInt($(this).css("line-height"), 10) > 24) {
						$(this).css(
								"line-height",
								(parseInt($(this).css("line-height"), 10) - 2)
										+ "px");
					}
				}
			});
}

unp.initSearch = function() {
	$('.searchbox').keypress( function(e) {
		if (e.keyCode == 13) {
			event.preventDefault();
			unp.dosearch();
			e.stopPropagation();
			return false;
		}
	});
	$('.localsearchbox').keypress( function(e) {
		if (e.keyCode == 13) {
			event.preventDefault();
			unp.dolocalsearch();
			e.stopPropagation();
			return false;
		}
	});
}

unp.dosearch = function() {
	var searchbox = $('.searchbox').last();
	if (searchbox.val() != '') {
		var searchterm = searchbox.val();
		if (searchterm = "") {
			$(".clearsearchbutton").click();
		} else {
			var thisArea = $("#list .list-group");
			var url = searchbox.attr('search') + "&category="
					+ encodeURIComponent(searchbox.val().toLowerCase());
			thisArea.load(url + " #results a");
			$('.loadmorelink').hide();
			$('.pullupholder').hide();
			$('.clearsearchbutton').show();
			searchbox.blur();
		}
		$("#pullUp").removeClass("loading");
	}
}

unp.clearsearch = function(dbName, viewName, summarycol, detailcol, category,
		xpage, refreshmethod, photocol, ajaxload, target) {
	$('#list .list-group').empty();
	$('.loadmorelink').hide();
	$('.pullupholder').hide();
	$('.clearsearchbutton').hide();
	$('.searchbox').val('');
	$('.localsearchbox').val('');
	$("#pullUp").removeClass("loading");
	loadedurls = [];
	loadmoreloading = false;
	if ($('.accordion-list-group').length > 0){
		$('#list').load(window.location.href + ' #list>div', function(){
			unp.initSearch();
		});
	}else{
		unp.loadmore(dbName, viewName, summarycol, detailcol, category, xpage,
				refreshmethod, photocol, ajaxload, target);
	}
}

unp.dolocalsearch = function() {
	var searchbox = $('.localsearchbox').last();
	if (searchbox.val() != '') {
		var searchterm = searchbox.val().toLowerCase();
		$("#list .list-group a").each( function() {
			var test = $(this).text().toLowerCase();
			if (test.indexOf(searchterm) > -1) {
				$(this).removeClass("invalidsearchresult");
				$(this).show();
			} else {
				$(this).addClass("invalidsearchresult");
				$(this).hide();
			}
		});
		$('.loadmorelink').hide();
		$('.pullupholder').hide();
		$('.clearsearchbutton').show();
		searchbox.blur();
		$("#pullUp").removeClass("loading");
	}
	return false;
}

unp.initCalendar = function() {
	try {
		var calendaroptions = jQuery.parseJSON($('.calendarconfig').val());
		var buttons = calendaroptions.headerbuttonsrighttablet;
		var defaultView = calendaroptions.defaultviewtablet;
		if ($(window).width() < 400){
			buttons = calendaroptions.headerbuttonsrightphone;
			defaultView = calendaroptions.defaultviewphone;
		}

		var url = 'UnpCalendarData.xsp?viewname=' + calendaroptions.viewname;
		url += '&startdatefield=' + calendaroptions.startdatefield;
		url += '&enddatefield=' + calendaroptions.enddatefield;
		url += '&titlefield=' + calendaroptions.titlefield;
		url += '&viewxpage=' + calendaroptions.viewxpage;
		url += '&highlightfield=' + calendaroptions.highlightfield;
		url += '&highlighttest=' + calendaroptions.highlighttest;
		url += '&filter=' + calendaroptions.filter;
		url += '&catfield=' + calendaroptions.catfield;
		url += '&dbname=' + calendaroptions.dbname;
		$('#calendar').fullCalendar( {
			header : {
				left : calendaroptions.headerbuttonsleft,
				center : 'title',
				right : buttons
			}, 
			defaultView: defaultView, 
			events: url,
			timezone: 'local', 
			titleFormat: {
			    month: 'MMMM YYYY',
			    week: "MMM D",
			    day: 'MMM DD'
			}, 
			viewRender: function(view){
				var h;
				if (view.name.indexOf('agenda') > -1){
					h = 2500;
				}else{
					h = $(window).height() - 50;
				}
				//console.log("Setting height to: " + h);
				$('#calendar').fullCalendar('option', 'height', h);
			}
		});
		$('.fc-button').each(function(){
			$(this).removeClass();
			$(this).addClass('btn btn-default');
		})
		$('.fc-icon-left-single-arrow').parent().addClass('fa fa-arrow-left');
		$('.fc-icon-left-single-arrow').remove();
		$('.fc-icon-right-single-arrow').parent().addClass('fa fa-arrow-right');
		$('.fc-icon-right-single-arrow').remove();
	} catch (e) {

	}
}

unp.refreshCalendar = function(){
	try{
		$('#calendar').fullCalendar('refetchEvents');
	}catch(e){
		
	}
}