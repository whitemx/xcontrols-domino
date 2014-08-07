/**
 * Copyright 2013 Teamstudio Inc 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed 
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for 
 * the specific language governing permissions and limitations under the License
 */

/*
 * Returns the name of the current XPage e.g. UnpMain.xsp
 */
function getCurrentXPage(){
	if (!viewScope.containsKey("currentxpage")){
		var url = context.getUrl().toString();
		url = @Left(url, ".xsp") + ".xsp";
		if (url.indexOf(".nsf/") > -1){
			url = @Right(url, ".nsf/");
		}else{
			url = @Right(url, ".unp/");
		}
		viewScope.currentxpage = url;
	}
	return viewScope.currentxpage;
}

function matchCurrentURL(compare){
	var url = rightBack(context.getUrl().toString(), "/");
	if (url == rightBack(compare, "/")){
		return true;
	}else{
		return false;
	}
}

function rightBack(sourceStr, keyStr){
	try{
		arr = sourceStr.split(keyStr);
		return (sourceStr.indexOf(keyStr) == -1 | keyStr=='') ? '' : arr.pop()
	}catch(e){
		return "";
	}
}

/*
 * Returns the current db path in the format "/dir/mydb.nsf"
 */
function getDbPath(){
	if (!applicationScope.containsKey("dbpath")){
		applicationScope.dbpath = "/" + @ReplaceSubstring(database.getFilePath(), "\\", "/");
	}
	return applicationScope.dbpath;
}

function isUnpluggedServer(){
	if (!applicationScope.containsKey("unpluggedserver")){
		try{
			if (null != UnpluggedLib) {
				applicationScope.unpluggedserver = true;
				applicationScope.dominoserver = false;
			}else{
				applicationScope.unpluggedserver = false;
				applicationScope.dominoserver = true;
			}
		}catch(e){
			applicationScope.unpluggedserver = false;
			applicationScope.dominoserver = true;
		}
	}
	return applicationScope.unpluggedserver;
}

function isAndroid(){
	if (context.getUserAgent().getUserAgent().indexOf("Android") > -1){
		return true;
	}else{
		return false;
	}
}

function isIOS(){
	var useragent = context.getUserAgent().getUserAgent();
	if (useragent.indexOf("AppleWebKit") > -1 && useragent.indexOf("Mobile") > -1 && useragent.indexOf("Android") == -1){
		return true;
	}else{
		return false;
	}
}

function isDesktop(){
	return !isIOS() && !isAndroid();
}

function isPhone(){
	var useragent = context.getUserAgent().getUserAgent();
	if ((useragent.indexOf("iPhone") > -1 && useragent.indexOf("Mobile") > -1) || 
			(useragent.indexOf("Android") > -1)){
		return true;
	}else{
		return false;
	}
}

function getiOSVersion(){
	if (!isIOS()){
		return 0;
	}
	var useragent = context.getUserAgent().getUserAgent();
	useragent = rightBack(useragent, "/");
	useragent = @Left(useragent, useragent.length - 4);
	return parseInt(useragent, 10) - 4;
}

function isAjax(){
	if (requestScope.isajax == null){
		var rnd = context.getUrlParameter("rnd");
		var history = context.getUrlParameter("history");
		if (history == "true"){
			requestScope.isajax = false;	
		}else{
			if (rnd == "" || rnd == null || rnd == "undefined"){
				requestScope.isajax = false;
			}else{
				requestScope.isajax = true;
			}
		}
	}
	return requestScope.isajax;
}

function $A( object ){
	if( typeof object === 'undefined' || object === null ){ return []; }
	if( typeof object === 'string' ){ return [ object ]; }
	if( typeof object.toArray !== 'undefined' ){
		return object.toArray();
	}
	if( object.constructor === Array ){ return object; }  
	return [ object ];
}

function isEmpty( input ) {
	if (input == null || typeof input == 'undefined') {
	    return true;    
	}
	if (typeof input == 'string') {
	    return input.equals("");
	} else if (input.toString != null) {
	    return input.toString().equals("");
	}
	return false;
}

function timeSince(datetime){
	var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " yrs ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hrs ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " mins ago";
    }
    if (interval == 1){
    	return interval + " minute ago";	
    }
    return "just now";
}

function getFavorites(){
	var favorites = session.getEnvironmentString("ro.favorites." + @LowerCase(@ReplaceSubstring(database.getFilePath(), "\\", "")), true) + ",";
	if (favorites == null || favorites == "" || favorites == ","){
		return new Array();
	}else if(favorites.indexOf(",") > -1){
		return $A(favorites.split(","));
	}else{
		return $A(favorites);
	}
}
function setFavorites(favoritesarray){
	//print("Setting favorites: " + @Implode(favoritesarray));
	session.setEnvironmentVar("ro.favorites." + @LowerCase(@ReplaceSubstring(database.getFilePath(), "\\", "")), @Implode(@Trim(favoritesarray), ","), true);
	sessionScope.favorites = null;
}
function getDownloaded(){
	var downloaded = session.getEnvironmentString("ro.downloaded." + @LowerCase(@ReplaceSubstring(database.getFilePath(), "\\", "")), true);
	if (downloaded == null || downloaded == ""){
		return new Array();
	}else if(downloaded.indexOf(",") > -1){
		return downloaded.split(",");
	}else{
		return [downloaded];
	}
}
function setDownloaded(downloadedarray){
	session.setEnvironmentVar("ro.downloaded." + @LowerCase(@ReplaceSubstring(database.getFilePath(), "\\", "")), @Implode(@Trim(downloadedarray), ","), true);
	sessionScope.downloaded = null;
}