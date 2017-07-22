//npm install amdefine
/*
if (typeof define != 'function' ){
	var define = require('amdefine')(module);
}
*/
define(function () {
	//var http = require('http');
	
	return {
		func1 : function () {
			alert('f1')
		},
		
		UTCHourToLocalHour : function (UTChour) {
      var d = new Date();
      d.setUTCHours(UTChour);
      var localHour = UTChour;
      var str = "";
      if(localHour<12){
        str = localHour + ":00 AM";
      } else if (localHour == 12 ){
        str = localHour + " Noon";
      } else {
          str = (localHour-12) + ":00 PM";
      }     
      return str;
            
      var localHour = d.getHours(); //converts to local timezone;
			var str = "";
			if(localHour==0) {
				str = "12:00AM (Midnight)";
			}else if (localHour==12){
				str = localHour+":00PM (Noon)";
			}else if(localHour<12){
 				str = localHour + ":00AM";
			}else{
				str = (localHour-12)+":00PM";
			}      
			return str;
		},
		
		getJson : function (url, callback) {
			//open url with GET. Convert response to JSON n return it.
			//callback(err, json)
			xmlhttp = new XMLHttpRequest();
			
			//it says it is good practice to "open" xhr before "onreadystatechange"
			// async == false: the send() method does not return until the response is received.
			// do we want this to be asynchronous? yes, we are retreiving email data (in JSON) as a 
			// "whole" at once, not "piece by piece" each time 
			// xmlhttp.open("GET", url, true);
			/*
				synchronous request is deprecated.....:
					If async is false, current global object is a Window object, 
					and the timeout attribute value is not zero 
					or the responseType attribute value is not the empty string, 
					then throw an InvalidAccessError exception.
				It appears that our condition wouldn't cause trouble..
				
				we need helper that "aggregates" all pieces into a whole object 
				after it completely received data 
			*/
			
			
			xmlhttp.open("GET", url, true);
			
			xmlhttp.onreadystatechange = function () {
				if (xmlhttp.readyState == 0) {}
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					//success
					//console.log(xmlhttp.getResponseHeader('Set-Cookie'));
					var res = xmlhttp.responseText;
					//console.log(res);
					var resJson = JSON.parse(res);
					callback(null, resJson);
				} else if (xmlhttp.readyState == 4) {
					//fail
					callback('error loading json ' + url);
				} else if (xmlhttp.status == 100){
					loadingListener();
				}
			}
			
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlhttp.send();
			//if we want synchronous flow, then do not use onreadystatechange function and callback inside
			/*
			var res = xmlhttp.responseText;
			console.log(typeof res);
			if(typeof res == Object){
				var resJson = JSON.parse(res);
			}
			callback(null, resJson);
			*/
		},
		
		validateEmail : function (email) {
			var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
			if (!emailReg.test(email) || email == '') {
				return false;
			} else {
				return true;
			}
		},
		getCookie : function (cname) {
			var name = cname + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i].trim();
				if (c.indexOf(name) == 0)
					return c.substring(name.length, c.length);
			}
			return "";
		},
		setCookie : function (cname, cvalue, exmins) {
			var d = new Date();
			d.setTime(d.getTime() + (exmins * 60 * 1000));
			var expires = "expires=" + d.toGMTString();
			var domain = "path=/;"
				document.cookie = cname + "=" + cvalue + "; " + domain + expires;
		}
	}
});
