$(document).ready(function() {
	$(".fontawesomeicons a.bootcards-summary-item").click(function(){
		showFontAwesomeDetails(this);
	})
	buildCharts();
})

$(document).ajaxComplete(function(){
	if (window.location.href.indexOf("UnpMain.xsp") > -1){
		//We need to re-init the charts
		buildCharts();
	}
	$(".fontawesomeicons a.bootcards-summary-item").click(function(){
		showFontAwesomeDetails(this);
	})	
	/*
	 * If we're running inside an iFrame we might be in the Restyler, so go and see if we need to do anything
	 */
	try{
		var isInIframe = (window.location != window.parent.location) ? true : false;
		if (isInIframe){
			window.parent.processAllSettings();
		}
	}catch(e){
		
	}
	
	//Test To See if we need to remove a second buttons div
	if ($(".buttons").length > 1){
		$(".buttons").eq(1).hide();
	}
	
	if ($(".pagetitle").text() != ""){
		$(".navbar-brand").text($(".pagetitle").text());
	}
	
})

function myCallBackFunction() {
	alert("This is custom code called by the OK	button using the callback custom property");
}

function switchCSS(obj, newcss) {
	$("#footerTabBar li").removeClass("tabSelected");
	$(obj).addClass("tabSelected");
	$("[unp-id='primarycss']").attr("href", newcss);
	jQuery.get("SwitchCSS.xsp?css=" + newcss);
}

function initDialog() {
	setTimeout( function() {
		try {
			$(".opendialoglink").click( function(event) {
				openDialog($(this).attr('href'));
			});
		} catch (e) {

		}
	}, 1000);
}

function readForm(url, index) {
	loadPage(url + ' #contentwrapper', 'content', index);
}

function adjustIFrameSize() {
	setTimeout( function() {
		$("iframe").height($(window).height() - 120);
	}, 1500);
}

function buildCharts() {
	if ($(".chartpanelelement").length > 0){
		var names = [ 'Allan Long', 'Darcy Raffield', 'Darren Eno',
				'Erik Leavell', 'Jack Floyd', 'Kurt Lobo', 'Tan Ser' ];
		var piedata = [];
		var tablerows = "";
		for ( var i = 0; i < names.length; i++) {
			var value = getRnd();
			piedata.push( {
				'label' : names[i],
				value : value
			});
			
			tablerows += "<tr><td>" + names[i] + "</td><td>" + value + "</td></tr>\n";
		}
		$(".table tbody").html(tablerows);
		Morris.Donut({
			  element: 'pie1',
			  data: piedata,
			  formatter: function (x) { return x}
			}).on('click', function(i, row){
			  //console.log(i, row);
		});
	}
}

function isPhone() {
	var isPhone = document.width <= 480;
	return isPhone;
}

function getRnd(max) {
	if (!max) {
		max = 30
	}
	return parseInt(Math.random() * max);
}

function labelFormatter(label, series) {
	return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>"
			+ label + "<br/>" + Math.round(series.percent) + "%</div>";
}

function startTest() {
	//$('head').append(
	//		$('<link rel="stylesheet" type="text/css" />').attr('href',
	//				'./unp/qunit-1.12.css?open&rnd=' + getRnd(10000)));
	$("#qunit")
			.html(
					"<p><i class=\"fa fa-spinner fa-spin\"></i> Running test, this can take up to 30 seconds...</p>");
	$("#results-card").show();
	$("#qunit").show();
	$("#starttestbutton").hide();
	$("#upmarkiframe").attr("src", "UPMarkStart.xsp?starttime=" + Date.now());
}

function toggleChartData() {
	var $ev = $(event.target)
	var $chart = $ev.parents('.bootcards-chart');
	if ($chart.length>0) {
		$chart.fadeOut( 'fast', function()  {
			$chart
				.siblings('.bootcards-table')
					.fadeIn('fast');
		});
	} else {
		var $data = $ev.parents('.bootcards-table');
		$data.fadeOut( 'fast', function()  {
			$data
				.siblings('.bootcards-chart')
					.fadeIn('fast');
		});
	}			
}

function myCallBackFunction(){
	alert("This is custom code called by the OK	button using the callback custom property");
}

function showFontAwesomeDetails(element){
	$(".modal-title").text($(element).find("h4").text());
	$(".modal-body").html($(element).html());
	if (!$(".modal-body").hasClass("text-center")){
		$(".modal-body").addClass("text-center");
	}
	$(".modal-body fa-3x").removeClass("fa-3x").addClass("fa-4x");
	$(".modal-body h4").removeClass("hidden");
	unp.openDialog('fa-alert');
	//<a class="bootcards-summary-item"><i class="fa fa-3x  fa-adn"></i><h4 class="hidden">fa-adn</h4></a>
}
