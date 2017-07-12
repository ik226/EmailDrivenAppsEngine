/*
Code for the query page. Called by routes.js
@requires: mongoDbApi

 */
var mongoDbApi = require('../mongodb/api.js');
var imap = require('../imap/imap.js');
var oauth2 = require('../oauth2/oauth2.js');
var constants = require('../constants.js');

var async = require('async');

module.exports = function (req, res) {

	var id = req.query.id;

	if (!id) {
		res.status(500).send('error:stats.js:no id provided')
		return
	}
	//TODO: remove data
	if (id == 'removeUser'){
		var email = req.query.email;
		//mongoDbApi.removeAllEmailMsg;
	}
	
	//whenever the app request user data from db, 
	//it updates emails from gmail(imap) and store them in db
	if (id == 'getUser') {
		var email = req.query.email;
				if (!email) {
					res.status(500).send('error:stats.js:getUser:no email provided')
					return
				}
				mongoDbApi.getUser(email, function (err, user) {
					if (err) { res.send(500, 'error:stats.js:getUser:01'); }
					else{
						//first visit: no user data stored yet.
						
						if(user.length==0){ res.status(200).send(JSON.stringify(user, null, "  ")); }
						else {
							// make token object to request new access token
							var newToken ={}
							newToken.access_token = user[0].access_token;
							newToken.refresh_token = user[0].refresh_token;
					
							//request new access token
							/* 
							oauth2.genNewAccessToken(newToken, function(err, tokens){
								var accessToken = tokens.access_token;
								xoauth2_token = oauth2.buildXoauth2Token(email, accessToken);
								//request imap to get emails
								imap.getEmails(xoauth2_token, email, function(result){
							
								}); 
							});
							*/
		      	  			res.status(200).send(JSON.stringify(user, null, "  "));
						}
					}
				});
		return;
		//print user with email
		/*
		var email = req.query.email;

		if (!email) {
			res.send(500, 'error:stats.js:getUser:no email provided')
			return
		}

		mongoDbApi.getUser(email, function (err, user) {
			if (err){	// error handling added
			//res.send(500, 'error:stats.js:getUser:01');
			res.status(500).send('error:stats.js:getUser:01');
			}
			//console.log(user);
			//console.log(user[0].access_token);
			//tokenAll = {};
			//tokenAll.access_token = user[0].access_token;
			//tokenAll.refresh_token = user[0].refresh_token;
			//accessToken = user[0].access_token;
			
			oauth2.getAuthTokens(tokenAll, constants.REDIRECT_URI, function(token){
				var accessToken = token.access_token;
				xoauth2_token = oauth2.buildXoauth2Token(email, accessToken);
			
			    imap.getEmails(xoauth2_token, email, function () {
			    	mongoDbApi.setUserLoadingStatus(email, 1);  
			    });
			})
			
      	  	//res.send(200, JSON.stringify(user, null, "  "));
			res.status(200).send(JSON.stringify(user, null, ' '));
		})
		
		console.log('stats:getUser after mongo access');
		return;
		*/
	}
  
  if (id == 'getUserLoadingStatus') {
    var email = req.query.email;
    
    mongoDbApi.getUserLoadingStatus(email, function (status) {
      console.log('status: ', status);
      res.writeHead(200, {
        "Content-Type" : "application/json"
      });
      res.write(JSON.stringify(status));
      res.end();
    })
	}
  
  

	/*
	// print all emails in db
	mongoDbApi.getAllEmailMsg(function (err, emailMsgs) {
	console.log(emailMsgs.length);
	emailMsgs.forEach(function (e) {
	if (e.subject == "[OAE] Videos" || 1 == 1) {
	console.log('> date: ', e.date);
	console.log('> subj: ', e.subject);
	console.log('> to: ', e.to);
	console.log('> cc: ', e.cc);
	console.log('> from: ', e.from);
	console.log('');
	}
	});
	})
	 */

	/*
	// print all emails count
	mongoDbApi.getAllEmailMsg(function (err, emailMsgs) {
	if (err)
	res.send(500, '<pre>' + 'error:stats.js:02' + '</pre > ');
	res.send(200, ' < pre > ' + JSON.stringify(emailMsgs.length, null, "  ") + ' <  / pre > ');
	})
	 */
	/*
	// print unique threads for user
	mongoDbApi.getUniqueThreads(' hammadmlk @ gmail.com ', function (err, results) {
	if (err)
	res.send(500, ' < pre > ' + ' error : stats.js : 03 ' + ' <  / pre > ');
	res.send(200, ' < pre > ' + JSON.stringify(results, null, "  ") + ' <  / pre > ');
	})
	 */

	if (id == "getAvgResponseTime") {
		// print avgResponseTimefor user
    var email = req.query.email;
		if (!email) {
			res.send(500, 'error:stats.js:getAvgResponseTime:no email provided')
			return
		}
    
		mongoDbApi.getResponseTimes(email, function (err, results) {
			if (err)
				res.send(500,' error : stats.js : 04 ');
				res.status(200).send(JSON.stringify(results, null, "  "));
		});
	}
	
	if (id == "getSpaceGameData") {
		email = req.query.email;
		
		//TODO: need to do getUser to check whether one's access token is not expired 
		//		so that one cannot bypass login process
		
		
		//incoming = req.query.incoming == true ? true : false;
		//console.log(email, incoming);

		// accumulate incoming and outgoing email data 
		// and send response at once
		var resFinal = {};
		async.waterfall([
			function(callback){
				mongoDbApi.getEmailsGroupedByHour(email, true, function (err, results) {
					if (err) { return callback(err); }
					resFinal['incoming'] = results;
					callback(null, resFinal);
				});
			},
			function(resFinal, callback){
				mongoDbApi.getEmailsGroupedByHour(email, false, function (err, results) {
					if (err) { return callback(err); }
					resFinal['outgoing'] = results;
					callback(null, resFinal);
				});
			}
		], function(err,result){
			if(err){
				res.writeHead(500, {
					"Content-Type" : "application/json"
				});
				res.write(JSON.stringify(' error : stats.js : 05 : ' + err));
				res.end();
				return
			}
			res.writeHead(200, {
				"Content-Type" : "application/json",

			});
			//res.cookie('emailType','email');
			res.write(JSON.stringify(result, null, "  "));
			res.end();
		});
		/*
		mongoDbApi.getEmailsGroupedByHour(email, incoming, function (err, results) {
			if (err) {
				res.writeHead(500, {
					"Content-Type" : "application/json"
				});
				res.write(JSON.stringify(' error : stats.js : 05 : ' + err));
				res.end();
				return
			}
			res.writeHead(200, {
				"Content-Type" : "application/json",
				//setting cookie with 0:outgoing, 1:incoming
				"Set-Cookie": results.incoming
			});
			//res.cookie('emailType','email');
			res.write(JSON.stringify(results, null, "  "));
			res.end();

		})
		*/
		return
	}
	/*
	//var responseData = {status:' sucess '};
	//res.writeHead(200, {"Content-Type": "application/json"});
	//res.write(JSON.stringify(responseData));
	//res.end();
	 */
	if(id == 'getSpamGameData'){
		var email = req.query.email;
		mongoDbApi.getSpamsByWeek(email, function(err, results){
			/*
			var mapped = results.map(function(doc){
				var mapResult = {};
				mapResult.from = doc.from[0];
				mapResult.numOfTo = doc.to.length;
				mapResult.numOfCc = doc.cc.length;
				mapResult.date = doc.date;
				return mapResult;
			});
			var newResults = {0: mapped};
			*/
			
			if (err) {
				res.writeHead(500, {
					"Content-Type" : "application/json"
				});
				res.write(JSON.stringify(' error : stats.js : 05 : ' + err));
				res.end();
				return
			}
			res.writeHead(200, {
				"Content-Type" : "application/json",
				
			});
			//res.cookie('emailType','email');
			//res.write(JSON.stringify(newResults, null, "  "));
			res.write(JSON.stringify(results, null, "  "));
			res.end();
		})
		
	}
	
	//handle post request for spam labeling
	if(id == 'postSpamData'){
		//if(spamData){console.log('spam received'); }
		//console.log(typeof spamData);
		//var ress = JSON.parse(spamData);
		var spamData = req.body;
		//console.log('ress: ' + ress, typeof(ress));
		//console.log(res[0]);
		//console.log(ress);
		
		
		var queryParam = [];
		spamData.forEach(function(d){
			var q = {};
			q.from = d.text;
			q.date = new Date(d.date);
			q.user = d.user;
			queryParam.push(q);
			
		});
		
		 
		mongoDbApi.getEmailID(queryParam, function(err, success){
			if(err) console.log(err);
			//var testOne = success[0].msgid;
			//console.log("is this the result??: " + success);
			//console.log(success);
			
			//var msgId = success[0].msgid;
			var msgId = success.map(function(d){
				return d.msgid;
			});
			var newLabel = 'SPAM';
			
			//oauth2.getUserEmailLabels(email, function(err, success){
			//	if(err) console.log(err);
			//	console.log(success);
			//});
			
			//add SPAM label to this email
			oauth2.modifyEmailLabel(msgId, newLabel, function(err, success){
				if(err) console.log(err);
				//console.log(success);
				res.end();
			});
			
			//TODO: modify those emails spam status in mongodb 
			
			//oauth2.getOneEmail(msgId, function(err, success){
			//	if(err) console.log(err);
			//	console.log(success);
			//});
			
		});
		
	}

}
