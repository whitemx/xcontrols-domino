$(window).load( function() {
	$( document ).ajaxComplete(function() {
		start();
	});
	QUnit.done(function( details ) {
		try{
			$("#qunit-testresult").remove();
			$("#qunit-userAgent").remove();
			$("#qunit-banner").remove();
			$("#qunit-header").remove();
			$(".qunit-collapsed").remove();
			$("#qunit-testrunner-toolbar").remove();
			$("#qunit li span.runtime").addClass("pull-right");
			$("#qunit li span.runtime").addClass("badge");
			$("#qunit-tests").addClass("list-group");
			$("#qunit-tests li").addClass("list-group-item");
			$("#qunit-tests li a").remove();
			$("#qunit-tests li .counts").remove();
			$(".qunit-assert-list").remove();
			//$("#qunit-tests li.fail").addClass("list-group-item-danger");
			var initialpageload = $("#qunit-tests li .test-name").first().text();
			$("#qunit-tests li .test-name").first().text("Initial Page Load");
			$("#qunit-tests li .badge").first().text(initialpageload.substr(18));
			var total = 0;
			$("#qunit li span.badge").each(function(){
				total = total + parseInt($(this).text(), 10);
			})
			var html = '<li class="pass list-group-item"><span class="runtime pull-right badge">' + total + ' ms</span><h4 class="list-group-item-heading">TOTAL TIME</h4></li>';
			$("#qunit-tests").append(html);
			$("#qunit-tests strong").contents().unwrap();
			$('#qunit', window.parent.document).html("<p>The results below describe how long a series of tests took to run on your device. The time the tests take are very hardware dependent, so different devices will see different results.</p>" + $("#qunit").html());
			$("#starttestbutton", window.parent.document).show();
			
		}catch(e){
			
		}
	});
	var message;
	var starttime = Date.now();
	if (unp.getURLParameter("starttime") != ""){
		starttime = parseInt(unp.getURLParameter("starttime"), 10);
	}
	var endtime = Date.now();
	bLoaded = true;
	endtime = Date.now();
	test("Initial Page Load " + (endtime - starttime) + "ms", 1, function(){
		ok(true);
	});
	test("open flat view", 1, function(){
		stop();
		//console.log("open flat view");
		$(".litop2 li a").eq(5).click();
		ok(true);
	});
	test("open second doc", 1, function(){
		stop();
		//console.log("open first document");
		$("#list .list-group a").eq(1).click();
		ok(true);
	});
	
	test("edit document", 1, function(){
		stop();
		//console.log("edit document");
		$("#doccontent .panel .btn-primary").first().click();
		ok(true);
	});
	test("open filtered view", 1, function(){
		stop();
		//console.log("open filtered view");
		$(".litop2 li a").eq(5).click();
		ok(true);
	});
	test("open second doc", 1, function(){
		stop();
		//console.log("open first document");
		$("#list .list-group a").eq(1).click();
		ok(true);
	});
	test("edit document", 1, function(){
		stop();
		//console.log("edit document");
		$("#doccontent .panel .btn-primary").first().click();
		ok(true);
	});
	test("open typography read", 1, function(){
		stop();
		//console.log("open typography read");
		$(".litop2 li a").eq(0).click();
		ok(true);
	});
	test("open typography edit", 1, function(){
		stop();
		//console.log("open typography edit")
		$(".litop3 li a").eq(1).click();
		ok(true);
	});
	test("open contacts", 1, function(){
		stop();
		//console.log("open contacts by company");
		$(".litop5 li a").eq(0).click();
		ok(true);
	});
	test("open departments", 1, function(){
		stop();
		//console.log("open contacts")
		$(".litop5 li a").eq(1).click();
		ok(true);
	});
	test("open my activities", 1, function(){
		stop();
		//console.log("open media");
		$(".litop5 li a").eq(2).click();
		ok(true);
	});
});

function log(message){
	if (unpluggedserver) {
		alert(message);
	} else {
		console.log(message);
	}	
}