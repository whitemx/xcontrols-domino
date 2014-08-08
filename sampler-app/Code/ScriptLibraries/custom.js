$(document).ready(function() {
	$(".fontawesome div").click(function(){
		showFontAwesomeDetails(this);
	})
	
	buildCharts();
})

$(document).ajaxComplete(function(){
	if (window.location.href.indexOf("UnpMain.xsp") > -1){
		//We need to re-init the charts
		buildCharts();
	}
	$(".fontawesome div").click(function(){
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
	$('head').append(
			$('<link rel="stylesheet" type="text/css" />').attr('href',
					'./unp/qunit-1.12.css?open&rnd=' + getRnd(10000)));
	$("#qunit")
			.html(
					"<p><i class=\"glyphicons stopwatch\" /> Running test, this can take up to 30 seconds...</p><p style=\"width: 100%; text-align: center; padding-top: 30px;\"><img src=\"ajax-loader.gif\" /></p>");
	$('#intro').hide();
	$("#qunit").show();
	$("#startbutton").hide();
	$("#upmarkiframe").attr("src", "UPMarkStart.xsp?starttime=" + Date.now());
}

function showFontAwesomeDetails(element){
	$("#fontawesomedetails").html(element.outerHTML);
	if (window.innerHeight > window.innerWidth && window.innerHeight < 700){
		$("#fontawesomedetails i").addClass("fa-5x");
		$("#fontawesomedetails div").attr("style", "text-align: center; padding-top: 100px;")
	}else{
	}
	$("#fontawesomedetails span").attr("style", "display: block;");
	unp.openDialog("dialogPopup");
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