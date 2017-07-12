var async = require('async');
var UserInfo = require('./userInfoModel.js');
var EmailMsg = require('./emailMsgModel.js');

//test: user score schema
var UserScore = require('./score.js');

//update score
/*
exports.addUpdateScore = function(user, gameScore, callback){
	var newScore = new UserScore({email: user, score: gameScore});
	console.log('from api.js: ' + newScore);
	newScore.save(function(err, score){
		if(err) return console.log(err);
	})
}
*/

exports.addUpdateScore = function ( user, gameScore, callback ) {
	//var collection = db.collection ;
	var collection = UserScore ;

	if (!collection.findOne(  {email : user} )){
		var newscore = new UserScore({email: user, score  : gameScore});
		newscore.save(function(err,raw){
			if(err) console.log(err); return;
			console.log('new score saved?? '+raw);
		});
	
	}


	else {
		//console.log('new score else phase!')
		var scoreInfo = {
			email: user,
			score: gameScore
		};
	
		collection.update(
			{email :  user},
			scoreInfo,
			callback) ;

	}
}

// Adds the user if it does not exist. Else update it.
exports.addUpdateUser = function (info, tokens) {

	var userInfo = {
		id : info.id || '',
		email : info.email,
		name : info.name || '',
		given_name : info.given_name || '',
		family_name : info.family_name || '',
		link : info.link || '',
		picture : info.picture || '',
		gender : info.gender || '',
		hd : info.hd || '',
		verified_email : info.verified_email || false,
		refresh_token : tokens.refresh_token || '',
		access_token : tokens.access_token || '',
    	role: info.role || 'unknown',
    	notes: info.notes || '',
    	loadingStatus: info.loadingStatus || 0
	};

	UserInfo.update({
		email : info.email
	}, //conditions
	
	userInfo, //update val
	{
		safe : true,
		upsert : true
	}, //options
	
		function (err, numberAffected, raw) { //callback
		if (err)
			return console.log('Error:api.js:addUser:update');
		console.log('The number of updated documents was %d', numberAffected);
		console.log('The raw response from Mongo was ', raw);
	});
}

//returns obj with all userInfo docs
exports.getAllUsers = function (callback) {
	UserInfo.find(function (err, users) {
		if (err) {
			//console.error(err);
			callback('api.js:cantGetAllUsers')
		} else {
			callback(null, users)
		}
	});
}

//batch query email ids
//@param {list} param - email address, date
//@return {list} list of email ids  
exports.getEmailID = function(param, callback){
	async.concat(param, asyncFunc, callback);
	function asyncFunc(arg, cb){
		return EmailMsg.find(arg, {msgid:1}).exec(cb);
	};
		
}

//update emailmsg's spam attribute
//TODO: search one another one and add to stream
// try $in and query only msgId
//@param {Object} param - {email, date}
exports.updateOneEmailToSpam = function(email, callback){
	EmailMsg.findOneAndUpdate({from:email}, {$set:{spam: true}}, {new: true}, callback);
}

// Adds email msg if it does not exist. Else update it.
exports.addUpdateEmailMsg = function (attrs, info, user, boxname) {

	/* attrs{ date: Thu Apr 03 2014 15:08:06 GMT-0400 (Eastern Daylight Time),
	flags: [],
	uid: 40131,
	modseq: '5220586',
	'x-gm-labels': [ '\\Important', 'SelfStudy' ],
	'x-gm-msgid': '1464391000410759949',
	'x-gm-thrid': '1464391000410759949' }
	 */

	var isSpam = false;
	if (boxname === "[Gmail]/Spam" || boxname === "Spam" ||
		boxname === "\\Junk") {
		isSpam = true
	}

	var emailMsg = {
		//id: Number,
		id : [attrs['x-gm-msgid'], user],
		user : user,
		from : info.from || [],
		to : info.to || [],
		cc : info.cc || [],
		bcc : info.bcc || [],
		subject : info.subject || '',
		date : info.date || '',
		labels : attrs['x-gm-labels'] || [],
		//flags: [String],
		spam : isSpam,
		msgid : attrs['x-gm-msgid'],
		thrid : attrs['x-gm-thrid'],
		size : attrs.size || 0
	};

	EmailMsg.update({
		id : [attrs['x-gm-msgid'], user]
	}, //conditions
		emailMsg, //update val
	{
		safe : true,
		upsert : true
	}, //options
		function (err, numberAffected, raw) { //callback
		if (err) {
			console.log('Error:api.js:addUpdateEmailMsg:update');
			console.log(err);
			return
		}
		//console.log('The number of updated documents was %d', numberAffected);
		//console.log('The raw response from Mongo was ', raw);
	});
}

//returns obj with all emailMsg docs
exports.getAllEmailMsg = function (callback) {
	EmailMsg.find(function (err, emailMsgs) {
		if (err) {
			console.error(err);
			callback('api.js:cantGetAllEmailMsg')
		} else {
			callback(null, emailMsgs)
		}
	});
}

exports.removeAllEmailMsg = function () {
	try {
		EmailMsg.collection.remove({});
		//EmailMsg.collection.remove(function (err) {
		//	if (err)
		//		throw err;
		//});
	} catch (err) {
		console.log(err);
	}
}

// updates the users email loading status. 1= ready, 0=pending, -1 error
// callback added
// set cookies that the loading is completed 
exports.setUserLoadingStatus = function(email, status, callback){ //omit input: callback 
  //
  var query = {email : email};
  
  UserInfo.update(query, {loadingStatus : status},
  	function (err, numberAffected, raw) {
  	  if (err){
  		  	console.log('error:api:setUserLoadingStatus',err)
        	return;
      }
  	  //console.log('The number of updated documents was %d', numberAffected);
  	  //console.log('The raw response from Mongo was ', raw);
    });
	// callback: res.cookie('loading',1)
	callback();
}

// gets the users email loading status. 1= ready, 0=pending, -1 error
exports.getUserLoadingStatus = function(email, callback){
  UserInfo
	.find({
		email : email
	}).exec(function(err, user){
        if (err)
          callback(-1);
        else if (typeof user[0] =='undefined' || user[0].hasOwnProperty('loadingStatus'))
          callback(-1);
        else
          callback(user[0].loadingStatus)
    });
}

// Return the user matching username
exports.getUser = function (email, callback) {
	UserInfo.find({
		email : email
	})
	//.where('name.last').equals('Ghost')
	//.where('age').gt(17).lt(66)
	//.where('likes').in(['vaporizing', 'talking'])
	//.limit(10)
	//.sort('-occupation')
	//.select('name email')
	.exec(callback);

}

exports.getUserToken = function(email, callback){
	UserInfo.find({
		email: email
	})
	.select('access_token refresh_token')
	.exec(callback);
}

// Return unique threads of a user
exports.getUniqueThreads = function (email, callback) {
	console.log("\n\n\nGet UniqueThreads:\n\n")

	var o = {};
	o.map = function () {
		emit(this.thrid, 1)
	}
	o.reduce = function (key, values) {
		return values.length
	}
	o.query = {
		user : email
	}

	EmailMsg.mapReduce(o, function (err, results) {
		callback(err, results)
	})

}

// Return response times of user
exports.getResponseTimes = function (email, callback) {
	console.log("\n\n\nGet Average Response Time:\n\n")
	//mongodb mapReduce doc at http://docs.mongodb.org/manual/core/map-reduce/


	var o = {};
	o.scope = {
		email : email
	};
	o.query = {
		user : email
	} //query filter
	o.map = function () { //map func each msg
		emit(this.thrid, {
			val : [1],
			date : [this.date],
			msgid : [this.msgid],
			from : [this.from]
		})
	}
	o.reduce = function (thrid, values) { //reduce func
		var ans = {
			val : [],
			date : [],
			msgid : [],
			from : []
		}
		values.forEach(function (entry) {
			for (var i = 0; i < entry.val.length; i++) {
				ans.val.push(entry.val[i]);
				ans.date.push(entry.date[i]);
				ans.msgid.push(entry.msgid[i]);
				ans.from.push(entry.from[i]);
			}
		})
		return ans
	}
	o.finalize = function (thrid, reducedValue) {
		//return reducedValue //for debug
		/*
		Takes the reducedValue after mapReduce for a thread id (key) finishes.
		Sorts the messages on date.
		Computes response time of each response.
		returns the array of response times.
		Input:
	{ // reduced val object
		"_id": "the thread id or key",
		"value": { "val": [], "date": [], "msgid": [], "from": [[]] }
		}
		output: array of response time in seconds [int]
		 */

		/* Before we sort we need to change object of
		arrays to array of objects
		[{val: , date: , msgid, from}]
		then sort it on date
		 */
		var reducedValueSorted = [];
		for (var i = 0; i < reducedValue.val.length; i++) {
			reducedValueSorted.push({
				val : reducedValue.val[i],
				date : reducedValue.date[i],
				msgid : reducedValue.msgid[i],
				from : reducedValue.from[i]
			});
		}
		reducedValueSorted.sort(compareFunc);

		//compute response time of each response
		var resTime = responseTime(reducedValueSorted)
			return resTime;

		//compare function
		function compareFunc(a, b) {
			if (a.date < b.date)
				return -1;
			if (a.date > b.date)
				return 1;
			return 0; // a must be equal to b
		}

		/* Response time function
		@returns array of response time(in seconds) of each response
		input:
		Array of objects [{val, date, msgid, from[]},...]
		Logic: For each response, if there is a incoming message
		before it, calc response time from prev msg.
		 */
		function responseTime(val) {
			var resTime = []; //response times

			if (val.length < 2)
				return resTime //0 or 1 email in thread

			var replyPending = 0; //un-replied incoming email
			if (email !== val[0].from[0]) {
				replyPending = 1;
			} //1st was incoming

			//push time diff of each response
			for (var i = 1; i < val.length; i++) {
				if (val[i].from[0] === email && replyPending === 1) {
					//time diff
					resTime.push((val[i].date - val[i - 1].date) / 1000);
					replyPending = 0;
				}
				if (email !== val[i].from[0]) {
					replyPending = 1
				}
			}
			return resTime;
		}
	}

	//result is an array of {_id:thrid, value:[resTimes, ...]}
	EmailMsg.mapReduce(o, function (err, results) {
		//callback(err, results); return results //for debug
		var times = [];

		//make one array with all times
		for (var i = 0; i < results.length; i++) {
			for (var j = 0; j < results[i].value.length; j++) {
				times.push(results[i].value[j]);
			}
		}

		//var sum = times.reduce(function(previousValue, currentValue, index, array){
		//    return previousValue + currentValue;
		//});

		//results = times;//{t:sum/times.length}
		callback(err, times)
	})

}

// Return emailsGroupedByHour for a user of emails within 30days
exports.getEmailsGroupedByHour = function (email, incoming, callback) {
	//console.log("\n\n\nGet EmailsGroupedByHour:\n\n")
	//mongodb mapReduce doc at http://docs.mongodb.org/manual/core/map-reduce/
	//console.log(this);
	var monthBeforeToday = new Date().subtractDays(29);//.toDateString();
	
	var o = {};
	
	o.scope = {
		'email' : email
	};
	
	if (incoming === true){
		o.query = {
			'user' : email,
			'from' : { '$ne' : [email] },
			'date': { '$gte' : monthBeforeToday }
		};
	} //query filter
	else{
		o.query = {
			'user' : email,
			'from' : [email],
			'date' : { '$gte': monthBeforeToday }
			
		};
	}
	
	//map function emits (key: hour, value: {To,CC,From,size}) pair
	o.map = function () { //map func each msg
		//printjson(this);
		var hour;
		if (!this.date instanceof Date) {//if this.date is not Date obj
			hour = -1;
		}
		else {
			hour = this.date.getUTCHours();
		}
		var value = {
			numOfTo : [this.to.length],
			numOfCc : [this.cc.length],
			from : [this.from[0]],
			//add size
			//size: this.size || 0
			size : [this.size ? this.size : 0],
			date : [this.date]
		};
		//printjson(value);
		emit(hour, value)
	}
	o.reduce = function (hour, values) { //reduce func
		//printjson(values);
		var ans = {
			numOfTo : [],
			numOfCc : [],
			from : [],
			//add size of email
			//size: 0
			size: [],
			date: []
			
			
		};
		
		values.forEach(function (entry) {
			//printjson(entry);
			for (var i = 0; i < entry.numOfTo.length; i++) {
				ans.numOfTo.push(entry.numOfTo[i]);
				ans.numOfCc.push(entry.numOfCc[i]);
				ans.from.push(entry.from[i]);
				
				//assign size
				//ans.size = entry.size;
				ans.size.push(entry.size[i]);
				ans.date.push(entry.date[i]);
				
			}
		});
		//printjson(ans);
		return ans;
	}
	o.finalize = function (hour, reducedValue) {
		//THIS IS CALLED ONCE PER KEY(hour)
		//return reducedValue //for debug

		/* convert to array of objs (from obj of arrays)
		input:
	{"numOfTo": [], "numOfCc":[], "from":[]}
		output :
		[ {"numOfTo": 1, "numOfCc": 5,"from":"hhm38@cu.edu"}, {...}, ...]
		 */
		var hourDataArray = [];
		for (var i = 0; i < reducedValue.numOfTo.length; i++) {
			var obj = {};
			obj.numOfTo = reducedValue.numOfTo[i];
			obj.numOfCc = reducedValue.numOfCc[i];
			obj.from = reducedValue.from[i];
			//obj.size = reducedValue.size[i];
			obj.size = reducedValue.size[i];
			obj.date = reducedValue.date[i];
			hourDataArray.push(obj);
		}
		//printjson(hourDataArray);
		return hourDataArray;
	}

	//results is an array of [{_id:hour, value:hourDataArray}]
  	//hoursData is object {hour: hourDataArray, hour2:hour2DataArray...}
  
	EmailMsg.mapReduce(o, function (err, results) {
		//callback(err, results); return results //for debug
		//console.log('result length', results.length);
		/*
		if (results.length == 0) {
			err = "no results for email: " + email;
		}
		*/
		if(err) callback(err);
		var hoursData = {};
		
		
		for (var i = 0; i < results.length; i++) {
			hoursData[results[i]._id] = results[i].value
		}
		//console.log('hour data',hoursData);
		callback(err, hoursData);
	});	

}

// Return incoming emails within 7days for spam management game mode
exports.getSpamsByWeek = function(email, callback){
	//get dates of a week ago
	var weekBeforeToday = new Date().subtractDays(7).toDateString();
	
	var o = {};
	o.query = {'user': email, 'date': {'$gte': new Date(weekBeforeToday)}, 'spam': false};
	o.sort = {'date': 1}
	o.map = function () { //map func each msg
		
		var day;
		if (!this.date instanceof Date) {//if this.date is not Date obj
			day = -1;
		}
		else {
			day = this.date.getUTCDate();
		}
		var value = {
			numOfTo : [this.to.length],
			numOfCc : [this.cc.length],
			from : [this.from[0]],
			date : [this.date]
		};
		//printjson(value);
		emit(day, value);
	};
	
	o.reduce = function (day, values) { //reduce func
		//printjson(day, values);
		var ans = {
			numOfTo : [],
			numOfCc : [],
			from : [],
			date: []
			
			
		};
		
		values.forEach(function (entry) {
			//printjson(entry);
			for (var i = 0; i < entry.numOfTo.length; i++) {
				ans.numOfTo.push(entry.numOfTo[i]);
				ans.numOfCc.push(entry.numOfCc[i]);
				ans.from.push(entry.from[i]);
				ans.date.push(entry.date[i]);
				
			}
		});
		//printjson(ans);
		return ans;
	};
	
	o.finalize = function (day, reducedValue) {
		//THIS IS CALLED ONCE PER KEY(day)
		//return reducedValue //for debug

		/* convert to array of objs (from obj of arrays)
		input:
	{"numOfTo": [], "numOfCc":[], "from":[]}
		output :
		[ {"numOfTo": 1, "numOfCc": 5,"from":"hhm38@cu.edu"}, {...}, ...]
		 */
		//printjson(day);
		//printjson(reducedValue);
		var dayDataArray = [];
		for (var i = 0; i < reducedValue.numOfTo.length; i++) {
			var obj = {};
			obj.numOfTo = reducedValue.numOfTo[i];
			obj.numOfCc = reducedValue.numOfCc[i];
			obj.from = reducedValue.from[i];
			//obj.size = reducedValue.size[i];
			obj.date = reducedValue.date[i];
			dayDataArray.push(obj)
		}
		return dayDataArray;
	}

	//results is an array of [{_id:hour, value:hourDataArray}]
  	//hoursData is object {hour: hourDataArray, hour2:hour2DataArray...}
  
	EmailMsg.mapReduce(o, function (err, results) {
		//callback(err, results); return results //for debug
		/*
		if (results.length == 0 && incoming == true) {
			err = "no results for email: " + email;
		}
		*/
		if (err) callback(err)
		var daysData = {};
		
		
		for (var i = 0; i < results.length; i++) {
			//daysData[results[i]._id] = results[i].value
			daysData[i] = results[i].value;
		}
		
		callback(err, daysData);
	});
	//EmailMsg.find({'user': email, 'date': {'$gte': weekBeforeToday}, 'spam': false}, callback);
		
	
	
}
