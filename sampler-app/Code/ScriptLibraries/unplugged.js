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

window.onpopstate = function(event) {
	if (event.state){
		window.location.href = document.location;
	}
};

unp.storePageRequest = function(url) {

	this._firstLoad = false;

	if (url.indexOf("#") > -1) {
		url = url.substring(0, url.indexOf(" #"));
	}
	if (url.indexOf("?") == -1) {
		url += "?";
	}
	url += "&history=true";
	history.replaceState({unp: true}, "", url);
	// console.log("pushed " + url);

}

$(window).load( function() {
	bootcards.init( {
        offCanvasHideOnMainClick : true,
        enableTabletPortraitMode : true,
        offCanvasBackdrop : true, 
        disableRubberBanding : true, 
        mainContentEl: $('#doccontent')
    });
	unp.initPage();
	unp._firstLoad = false;
});

unp.initPage = function(){
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

	// $('.offcanvas-toggle').on('click', function() {
	// $("#slideInMenu").toggleClass("active");
	// })
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
	unp.initAZPicker();
	
	unp.photoUploader.init();
	unp.fixPortrait();

	$(document).ajaxStop( function() {
		$(".offcanvas-left").removeClass("active");
		// do some cleaning up first
        if (bootcards.listOffcanvasToggle) {
            bootcards.listOffcanvasToggle.remove();
            bootcards.listTitleEl.remove();
            Bootcards.OffCanvas.$menuTitleEl.remove();
        }
        bootcards.mainContentEl = $('#doccontent');
        bootcards.listOffcanvasToggle = null;
        bootcards.listTitleEl = null;
        Bootcards.OffCanvas.$menuTitleEl = null;
        bootcards.listEl = null;
        bootcards.cardsEl = null;
		bootcards._setOrientation(true);
		if (bootcards.listTitleEl) {
			bootcards.listTitleEl.find('button').show();
		}

	    unp.initRichText();
		unp.initReaderButtons();
		unp.highlightCurrentPage();
		unp.initCalendar();
		unp.initAZPicker();
		
		unp.photoUploader.init();
		
	});
	
	// Open first item in flat view if necessary
	// highlight first list group option (if non active yet)
	if ($('[expand-first]').length == 0 || $('[expand-first="yes"]').length > 0){
		if ( $('.list-group a.active').length == 0 ) {
			if (!bootcards.isXS()){
				$('.list-group a').first().click();
			}
		}
	}
}

unp.highlightCurrentPage = function(){
	var href = window.location.href;
	if (unpluggedserver){
		href = href.replace('.nsf', '.unp');
	}
	// Deal with footer links
	$(".navbar-fixed-bottom a").each(function(){
		if (href.indexOf($(this).attr('href')) > -1){
			$(this).addClass('active')
		}
	})
	// Deal with header links
	$(".navbar-fixed-top .navbar-nav a").each(function(){
		if (href.indexOf($(this).attr('href')) > -1){
			$(this).parent().addClass('active')
		}
	})
}

unp.initNavigator = function(){
	$('[data-toggle="collapse"]').unbind();
	$('[data-toggle="collapse"]').click(function(){
		console.log("toggling in for " + $(this).next().attr('id'));
		$(this).next().toggleClass('in');
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
	/*
	 * try { $(':input, textarea, select').on('focus', function() {
	 * $(".footer").hide(); _oldiscrollbottom =
	 * $(".iscrollcontent").css("bottom"); $(".iscrollcontent").css("bottom",
	 * "0px"); }); $(':input, textarea, select').on('blur', function() {
	 * $(".footer").show(); $("iscrollbottom").css("bottom", _oldiscrollbottom);
	 * window.scrollTo(0, 1); }); } catch (e) {
	 *  }
	 */
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
			}, 
			styles: {
			    'body': {
					'font-size': '15px;', 
					'padding': '12px;', 
					'font-family': '"Helvetica Neue",Helvetica,Arial,sans-serif;', 
					'line-height': '1.5'
			    },
			    'a': {
			      'text-decoration': 'none'
			    }
			  }
		});
		editor.on('selection-change', function(range) {
			if (!range){
				$("#editor-container").blur();
			}
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
	var isPortrait = ($(window).width() > $(window).height())? false : true;
	if (!isPortrait){
		if (!$("#list").hasClass("col-sm-5")){
			$("#list").addClass("col-sm-5");
		}
		if ($("#doccontent").hasClass("col-xs-12")){
			$("#doccontent").removeClass("col-xs-12");
		}
		if (!$("#doccontent").hasClass("col-sm-7")){
			$("#doccontent").addClass("col-sm-7");
		}
	}
}

unp.fixPortrait = function(){
	var isPortrait = ($(window).width() > $(window).height())? false : true;
	if (isPortrait){
		// $("#list").css("top", "40px");
	}else{
		// $("#list").css("top", "0px");
	}
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

unp.stopViewSpinner = function() {
	$(".loadmorelink").disabled = false;
	$("#loadmorespinner").hide();
}

var loadmoreloading = false;
var loadedurls = [];
unp.loadmore = function(dbName, viewName, summarycol, detailcol, category,
		xpage, refreshmethod, photocol, ajaxload, callback, target) {
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
				+ "&ajaxload=" + ajaxload + "&target=" + target + "&callback=" + callback;
		if (loadedurls.indexOf(url) == -1) {
			loadedurls.push(url);
			// console.log('Loading ' + url);
			thisArea.load(url + " #results",
				function() {
					var firsturl = $(".summaryDataRow a").first().prop('onclick');
					if ($("#list .panel .list-group a[onclick='" + firsturl + "']").length > 0) {
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
				}
			);
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

unp.loadmoredetailed = function(dbName, viewName, summarycol, detailcol1, detailcol2, detailcol3, category,
		xpage, refreshmethod, photocol, ajaxload, callback, target) {
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
		var url = "UnpDetailedViewList.xsp?chosenView="
				+ encodeURIComponent(viewName) + "&summarycol="
				+ encodeURIComponent(summarycol) + 
				"&detailcol1=" + encodeURIComponent(detailcol1) + 
				"&detailcol2=" + encodeURIComponent(detailcol2) + 
				"&detailcol3=" + encodeURIComponent(detailcol3) +
				"&photocol=" + encodeURIComponent(photocol) + "&category="
				+ encodeURIComponent(category) + "&xpage=" + xpage + "&dbName="
				+ dbName + "&refreshmethod=" + refreshmethod + "&start=" + pos
				+ "&ajaxload=" + ajaxload + "&target=" + target + "&callback=" + callback;
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

unp.openDocument = function(url, target, caller, callback) {
	var thisArea = $("#" + target);
	$('#list .active').removeClass('active');
	if (caller) {
		$(caller).addClass('active');
	}
	thisArea.load(url.replace(" ", "%20") + "&min=true #" + target + ">div", function(
			data, status, xhr) {
		thisArea.show();
		if (status == "error") {
			alert("An error occurred:\n\n" + xhr.status + " " + xhr.statusText
					+ "\n\n" + $(data).text());
			return false;
		} else {
			if (firedrequests != null) {
				firedrequests = new Array();
			}

			unp.storePageRequest(url);

			unp.initiscroll();
			if (url.indexOf("editDocument") > -1
					|| url.indexOf("newDocument") > -1) {
				unp.allowFormsInIscroll();
			}

			if (bootcards.isXS()) {
				if ($("#" + target).hasClass("hidden-xs")) {
					$("#" + target).removeClass("hidden-xs");
					$("#list").addClass("hidden-xs");
					$('.btn-menu').addClass('hidden');
					$('.btn-back').removeClass('hidden');
					$(".bootcards-az-picker").hide();
					try{
						$('#list').animate( {
							scrollTop : 0
						}, '500', 'easeOutExpo');
					}catch(e){
						
					}
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
			if (callback){
				callback();
			}
			return false;
		}
	});
	return false;
}

unp.editDocument = function(xpage, unid, callback){
	
	var url = xpage + '?action=editDocument&documentId=' + unid + ' .modal-content';
	$('#editModal .modal-dialog').load(url, function(response, status, xhr){
		// console.log(status);
		$('#editModal').modal();
		unp.initDeleteable();
		unp.initAutoComplete();
		unp.initRichText();
		unp.initToggle();
		unp.initDates();
		if (unpluggedserver){
			setTimeout(function(){
				$("#editModal .modal-dialog").height($("#editModal .modal-body").height());
			}, 1000);
		}else{
			// $("#editModal .modal-dialog").height($("#editModal
			// .modal-body").height());
		}
		if (callback){
			callback();
		}
	});
	if (!unp.isIE() && !unp.isFF()){
		return false;
	}
}

unp.newResponse = function(parentunid, xpage){
	
	var url = xpage + '?parentunid=' + parentunid + ' .modal-content';
	$('#editModal .modal-dialog').load(url, function(response, status, xhr){
		// console.log(status);
		$('#editModal').modal();
		unp.initDeleteable();
		unp.initAutoComplete();
		unp.initRichText();
		unp.initToggle();
		unp.initDates();
		if (unpluggedserver){
			setTimeout(function(){
				$("#editModal .modal-dialog").height($("#editModal .modal-body").height());
			}, 1000);
		}else{
			// $("#editModal .modal-dialog").height($("#editModal
			// .modal-body").height());
		}
	});
	if (!unp.isIE() && !unp.isFF()){
		return false;
	}
}

unp.isIE = function(){
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
        return true;
    else
        return false;
}

unp.isFF = function() {
	if (window.navigator.userAgent.indexOf("Firefox") > 1){
		return true;
	}else{
		return false;
	}
}

unp.newDocument = function(xpage){
	
	var url = xpage + '?action=newDocument .modal-content';
	$('#editModal .modal-content').load(url, function(){
		$('#editModal').modal();
		unp.initDeleteable();
		unp.initAutoComplete();
		unp.initRichText();
		unp.initToggle();
		unp.initDates();
		if (unpluggedserver){
			setTimeout(function(){
				$("#editModal .modal-dialog").height($("#editModal .modal-body").height());
			}, 1000);
		}else{
			// $("#editModal .modal-dialog").height($("#editModal
			// .modal-body").height());
		}
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
		$(".bootcards-az-picker").show();
		$(".bootcards-az-picker a").unbind();
		unp.initAZPicker();
	} else {
		history.back()
	}
}

unp.saveDocument = function(formid, unid, viewxpagename, formname, parentunid, dbname, callback) {
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
				if ($('.flatview').length > 0){
					var obj = $.parseJSON($('.flatview').attr('refreshdetails'));
					var url = 'UnpFlatViewRefreshItem.xsp?chosenView=' + obj.viewname;
					url += '&summarycol=' + obj.summarycolumn + '&detailcol=' + obj.detailcolumn;
					url += '&photocol=' + obj.photocolumn + '&category=' + obj.categoryfilter;
					url += '&xpage=' + obj.xpagedoc + '&dbName=' + obj.dbname;
					url += '&refreshmethod=pull&ajaxload=' + obj.ajaxload + '&target=doccontent';
					var el = $('[unid="' + response + '"]');
					var pos = $(".flatview a").index(el);
					url += '&start=' + pos;
					$.ajax({
						type: 'GET', 
						url: url,
						cache: false, 
						encoding: 'UTF-8'
					}).done(function(response2){
						$('[unid="' + response + '"]').replaceWith(response2);
						$('[unid="' + response + '"]').addClass('active');
					})
				}
				if (callback){
					callback();
				}
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
	$("[datevalue]").each(function(){
		if ($(this).val() != "" && !moment($(this).val()).isValid() && !unp.isDate($(this).val())){
			var label = $("label[for='" + $(this).attr('id') + "']");
			msg += "Enter valid date for " + label.text() + "\n";
			if (valid){
				$(this).focus();
			}
			valid = false;
			$(this).closest(".form-group").addClass('has-error');
		}
	})
	if (!valid){
		// alert(msg);
	}
	return valid;
}

unp.isDate = function(txtDate)
{
    var reg = /^(0[1-9]|1[012])([\/-])(0[1-9]|[12][0-9]|3[01])\2(\d{4})$/;
    return reg.test(txtDate);
}


var firedrequests;
unp.loadPage = function(url, target, menuitem, pushState) {

	var _pushState = true;
	if (arguments.length >= 4) {
		_pushState = pushState;
	}

	var thisArea = $("#" + target);
	thisArea.load(url.replace(" ", "%20") + "&min=true #" + target + ">div", function(data, status, xhr) {
		if (status == "error") {
			alert("An error occurred:\n\n" + xhr.status + " " + xhr.statusText
					+ "\n\n" + $(data).text());
			return false;
		} else {
			// $("#slideInMenu").removeClass("active");
			// $('.offcanvas-toggle').on('click', function() {
			// $("#slideInMenu").toggleClass("active");
			// })
			unp.initPage();
			if (_pushState) {
				unp.storePageRequest(url);
			}
			
			return false;
		}
	});
}

unp.openPage = function(url, target) {
	window.location.href = url;
}

unp.initDeleteable = function() {
	$('.bootcards-clearinput').click(function(){
		$(this).blur();
		$(this).prev().val('');
		$(this).prev().focus();
		return false
	})
}

unp.initToggle = function(){
	$('.bootcards-toggle').click(function(){
		$(this).toggleClass('active');
		var checkboxes = $(this).parent().find('input');
		if (checkboxes.length > 0){
			$(checkboxes[0]).prop("checked", $(this).hasClass("active"));
		}
	})
}

unp.initDates = function(){
	// Now init datetime-local fields bloody Domino won't output correct format!
	$('[datetimevalue]').each(function(){
		var newval = moment(parseInt($(this).attr('datetimevalue'), 10)).format().substr(0, 16);
		$(this).attr('value', newval);
		$(this).attr('type', 'datetime-local');
	})
	$('[datevalue]').each(function(){
		var newval = moment(parseInt($(this).attr('datevalue'), 10)).format('YYYY-MM-DD').substr(0, 16);
		$(this).attr('value', newval);
		$(this).attr('type', 'date');
	})
}

unp.initAutoComplete = function() {
	$(".typeahead").each( function() {
		$(this).typeahead({source: eval($(this).attr('jslist'))});
	});
}

var touchmovehandler = function(e) {
	e.preventDefault();
}

unp.initAZPicker = function() {
	
	var azPicker = $(".bootcards-az-picker");
	
	if (azPicker.length > 0) {
		// Register the letter click events
		// $("a", azPicker).unbind();
		$("a", azPicker).off().on('click', function(event) {
			
			var $this = $(this);
			
			event.stopPropagation();
			event.preventDefault();
			if ($this.hasClass("switchletterlist")) {
				$(".atozpicker").toggle();
				$(".numberpicker").toggle();
			} else {
				unp.jumpToLetter($this, event);
			}
			return false;
			
		});
		
		// move the az picker to a different location so we can give it a fixed
		// position
		if ( azPicker.parents("#list").length > 0) {
			
			// determine the width of the list column
			var $list = $("#list");
			var classList = $list.attr('class').split(/\s+/);
			var colClass = "";
			$.each( classList, function(index, entry) {
				if (entry.indexOf('col-') ==0 ) {
					colClass = entry;
					return;
				}
				
			});
			
			// translate the column name to one of the 'push' classes
			var colSize = colClass.substring( colClass.lastIndexOf('-') + 1 );
			var colPushClass = colClass.substring( 0, colClass.lastIndexOf('-')) + "-push-" + colSize;
			
			// move the picker as a direct child of the #main el so we can give
			// it fixed positioning
			azPicker
			    .appendTo( $('#main') )
			    .addClass(colPushClass)
		
		}
		
	}
	
}

var scrollContent;
var scrollMenu;
unp.initiscroll = function() {
	
	if(unp.isIOS){
		bootcards.disableRubberBanding();
	}
	
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
	
	var $list = $('#list');
	
	$list.animate( {
        scrollTop : 0
    }, 0);
	
	var letter = letterelement.text().toLowerCase();
	var sel = "#list .list-group a";
	if ($(".bootcards-list-subheading").length > 0){
		sel = ".bootcards-list-subheading"
	}
	
	var $sel = $(sel);
	
	var scrollTop = null;

	var scrolled = false;	
	$sel.each( function(idx, entry) {
		var $entry = $(entry);
		
		var summary = "";
		if ($entry.prop('tagName').toLowerCase() == "a"){
			summary = $entry.find("h4").text();
		}else{
			summary = $entry.text();
		}
		var firstletter = summary.substring(0, 1).toLowerCase();
		scrollTop = null;
        
        if (firstletter == letter) {
            scrollTop = $entry.offset().top - 60;
        } else if (firstletter > letter) {
            scrollTop = $entry.offset().top - 120;
        }

        if (scrollTop !== null) {
            $list.animate( {
                scrollTop : scrollTop
            }, 0);
            scrolled = true;
            return false; 
        }
	});
	
	if (!scrolled) {

		var $last = $( $sel[$sel.length-1] );
		$list.animate( {
			scrollTop : $last.offset().top - 120
		}, 0);
	}
	
}

unp.openDialog = function(id) {
	if (id != null && id != "#") {
		$("." + id).modal('show');
	}
}

unp.closeDialog = function(id) {
	if (id != null && id != "#") {
		$("." + id).modal('hide');
	}
}

unp.accordionLoadMore = function(obj, viewName, catName, xpage, dbname,
		photocol, summarycol, detailcol, callback) {
	
	var pos = $('.data-row').length;
	var thisUrl = "UnpAccordionViewList.xsp?chosenView="
			+ encodeURIComponent(viewName) + "&catFilter="
			+ encodeURIComponent(catName) + "&xpageDoc=" + xpage + "&start="
			+ pos + "&dbname=" + dbname + "&photocol=" + photocol + "&summarycol="
			+ summarycol + "&detailcol=" + detailcol + "&callback=" + callback;

	var tempHolder = $(".summaryDataRow");
	$(tempHolder).load(
			thisUrl + " #results a",
			function() {
				$(obj).after($(".summaryDataRow a"));
				if ($(obj).hasClass('load-more')){
					$(obj).remove();
				}else{
					// $(obj).addClass('active');
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

unp.fetchDetails = function(obj, viewName, catName, xpage, dbname, photocol, summarycol, detailcol, callback) {
	if (!$(obj).hasClass("collapsed")) {
		// We want to collapse the current category
		console.log('Collapsing rows...');
		$(obj).addClass("collapsed");
		$('.data-row').remove();
		$('.load-more').remove();
		// Scroll to the top of the object
		$('#list').scrollTop($('#list').scrollTop() + $(obj).position().top);
	} else {
		// We want to get a new category
		// First make sure that all other categories are closed
		$('#list .list-group-item').addClass('collapsed');
		$("#list .active").removeClass('active');
		$('.data-row').remove();
		$('.load-more').remove();
		console.log('Getting category ' + catName);
		$(obj).removeClass('collapsed');
		$('#list').scrollTop($('#list').scrollTop() + $(obj).position().top);
		unp.accordionLoadMore(obj, viewName, catName, xpage, dbname, photocol, summarycol, detailcol, callback);
	}
}

unp.fetchMoreDetails = function(obj, viewName, catName, xpage, dbname, photocol, summarycol, detailcol, callback) {

	unp.accordionLoadMore(obj, viewName, catName, xpage, dbname, photocol, summarycol, detailcol, callback);
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
			unp.dosearch();
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	});
	$('.localsearchbox').keypress( function(e) {
		if (e.keyCode == 13) {
			e.preventDefault();
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
		xpage, refreshmethod, photocol, ajaxload, callback, target) {
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
				refreshmethod, photocol, ajaxload, callback, target);
	}
}

unp.clearsearchdetailed = function(dbName, viewName, summarycol, detailcol1, detailcol2, detailcol3, category,
		xpage, refreshmethod, photocol, ajaxload, callback, target) {
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
		unp.loadmoredetailed(dbName, viewName, summarycol, detailcol1, detailcol2, detailcol3, category, xpage,
				refreshmethod, photocol, ajaxload, callback, target);
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
		var calendaroptions = jQuery.parseJSON("{" + $('.calendarconfig').val() + "}");
		var buttons = calendaroptions.headerbuttonsrighttablet;
		var defaultView = calendaroptions.defaultviewtablet;
		var title = 'title';
		if ($(window).width() < 400){
			buttons = calendaroptions.headerbuttonsrightphone;
			defaultView = calendaroptions.defaultviewphone;
			title = '';
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
		url += '&callback=' + calendaroptions.callback;
		$('#calendar').fullCalendar( {
			header : {
				left : calendaroptions.headerbuttonsleft,
				center : title,
				right : buttons
			}, 
			defaultView: defaultView, 
			events: url,
			timezone: 'local', 
			titleFormat: {
			    month: 'MMM YYYY',
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
				// console.log("Setting height to: " + h);
				$('#calendar').fullCalendar('option', 'height', h);
			}
		});
		$('.fc-button').each(function(){
			// $(this).removeClass();
			// $(this).addClass('btn btn-default');
		})
		// $('.fc-icon-left-single-arrow').parent().addClass('fa
		// fa-arrow-left');
		// $('.fc-icon-left-single-arrow').remove();
		// $('.fc-icon-right-single-arrow').parent().addClass('fa
		// fa-arrow-right');
		// $('.fc-icon-right-single-arrow').remove();
	} catch (e) {

	}
}

unp.refreshCalendar = function(){
	try{
		$('#calendar').fullCalendar('refetchEvents');
	}catch(e){
		
	}
}

/* photo uploader */

unp.photoUploader = {
	targetWidth : 0,
	targetHeight : 0,
	doCrop : false,
	customSelect : null,
	orientation : 0
};

unp.photoUploader.init = function() {
	
	this.customSelect = $('.js-custom-select-var').text();
	
	if (this.customSelect != null && this.customSelect.length>0) {
	
		// move the 'photo select' button to a custom location
		var move = $('.js-photouploader-upload');
		var to = $(this.customSelect);
		
		if (move.length==1 && to.length==1) {
			move.appendTo(to);
			
			// hide the default photo select
			$('.js-photouploader .photoUpload').hide();

		}
	}
	
}
	
unp.photoUploader.loadImage = function( file) {
	
	loadImage(
	        file,
	        function (canvas) {
	        	
	        	// clean up
	            $('.js-photouploader-preview img, .js-photouploader canvas').remove();
	            
	            canvas.id = 'photoUploadCanvas';
	        	
	        	$('.js-photouploader-preview').append(canvas);
	        	$('.js-photouploader-rotate').removeClass('hidden');
	        	$('.js-photouploader-preview .fa').addClass('hidden');
	        },
	        {
	        	maxWidth : unp.photoUploader.targetWidth,
	        	maxHeight : unp.photoUploader.targetHeight,
	        	crop : unp.photoUploader.doCrop,
	        	canvas : true,
	        	orientation : unp.photoUploader.orientation
	        }
	);

}
	
unp.photoUploader.rotateImage = function(clockWise) {
	
	var $resizeFileUpload = $('.js-photouploader-upload');
	
	if ( $resizeFileUpload[0].files.length === 0) {
		return;
	}
	var file = $resizeFileUpload[0].files[0];

	if (this.orientation == 0) {
		this.orientation = (clockWise ? 6 : 8);
	} else if (this.orientation == 6) {
		this.orientation = (clockWise ? 3 : 0);
	} else if (this.orientation == 3) {
		this.orientation = (clockWise ? 8 : 6);
	} else if (this.orientation == 8) {
		this.orientation = (clockWise ? 0 : 3);
	}
	
	this.loadImage(file);
}

/* end photo uploader */

// hide / show a spinner icon in a button
unp.showSpinner = function(targetEl) {
	
	var $target = $(targetEl);
	var $icon = ($target.prop('tagName') == "I" ? $target : $target.children("i") );
	
	if ($icon.length>0) {
		$icon.data( 'orig-class', $icon.attr('class') );
		$icon
			.removeClass()
			.addClass("fa fa-spinner fa-spin");
	}
	
}

unp.hideSpinner = function(targetEl) {
	
	var $target = $(targetEl);
	var $icon = ($target.prop('tagName') == "I" ? $target : $target.children("i") );
	var origClass = $icon.data('orig-class');
	
	if ($icon.length>0 && origClass) {
		$icon
			.removeClass()
			.addClass(origClass);
	}
}

/**
 * Code for login taken from openntf.org under the Apache license
 */
unp.config = {};
unp.config.loggedInMessage = "Login successful, redirecting...";
unp.config.loginFailMessage = "Username / password incorrect, please try again";
unp.config.loginFailReason2Message = "Username / password incorrect, please try again.";
unp.config.loginFailReason3Message = "Session has expired. You must log in again.";
unp.config.loginFailReason4Message = "Session out of sync, server clocks may be out of sync.";
unp.config.loginFailReason5Message = "Your account has been locked out.";
unp.config.urlAfterLogin = "/";
unp.config.urlLoginNSF = "names.nsf";
unp.login = function() {
	var config = unp.config;
	var un = $("#username").val();
	var p = $("#password").val();
	if (un == "") {
		alert('Username is mandatory');
		return false;
	} else if (p == "") {
		alert('Password is mandatory');
		return false;
	};
	config.urlAfterLogin = decodeURIComponent($.urlParam('redirectto'));

	var loginurl = config.urlLoginNSF.split('.nsf')[0] + '.nsf?Login';
	$.ajax( {
		type : 'POST',
		url : loginurl,
		data : {
			"username": un,
			"password": p
		},
		cache : false,
		encoding : "UTF-8",
		beforeSend : function() {
	}
	}).done( function(response) {
		var responseLogin = response;
		responseLogin.toLowerCase();

		if (getCookie('DomAuthSessId') != null || getCookie('LtpaToken') != null) {
			$("#divLoginMessage").show();
			dojo.byId("divLoginMessage").innerHTML = config.loggedInMessage;
			dojo.byId("divLoginMessage").className = "alert alert-success";
			if (config.urlAfterLogin == "" || config.urlAfterLogin == "/") {
				window.location.reload()
			} else {
				window.location.href = config.urlAfterLogin;
			};

		} else {
			$("#divLoginMessage").show();
			dojo.byId("divLoginMessage").className = "alert alert-danger";
			if (responseLogin.toLowerCase().indexOf('input name' + '=\"reasontype\"') == -1) {
				dojo.byId("divLoginMessage").innerHTML = config.loginFailMessage;
			} else {
				var reasonFail = responseLogin.toLowerCase().substring(
					responseLogin.toLowerCase().indexOf('input name' +
						'=\"reasontype\"'), (responseLogin.toLowerCase().indexOf(
						'input name' + '=\"reasontype\"') + 80));
				var reasonNr = reasonFail.substring(reasonFail.indexOf('value') + 7, (reasonFail.indexOf('value') + 8));
				if (reasonNr == "2") {
					dojo.byId("divLoginMessage").innerHTML = config.loginFailReason2Message;
				}
				if (reasonNr == "3") {
					dojo.byId("divLoginMessage").innerHTML = config.loginFailReason3Message;
				}
				if (reasonNr == "4") {
					dojo.byId("divLoginMessage").innerHTML = config.loginFailReason4Message;
				}
				if (reasonNr == "5") {
					dojo.byId("divLoginMessage").innerHTML = config.loginFailReason5Message;
				}
			}

		}
	});

};

function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}
