var express = require('express');
var cookieParser = require('cookie-parser');
// logger
var logger = require('morgan');
//cross origin resource sharing
var cors = require('cors');
var http = require('http');
var bodyParser = require('body-parser');
//var passport = require('passport');
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

//internal modules
var routes = require('./routes/routes.js');
var mongoose = require('mongoose');
var proto = require('./prototypes.js');
var oauth2 = require('./oauth2/oauth2.js');
var mongoApi = require('./mongodb/api.js');
var constant = require('./constants.js');

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);



app.use(express.static(__dirname + '/public'));
app.use(cookieParser('=(*hj1!yat*vz=w6vlu1te9e&k4cp_3(w1$*!tf5ei$58&(sk5'));
app.use(bodyParser());
app.use(logger()); //morgan

var corsOptions = {
	origin: 'http://localhost:5001',
	optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
//manual cors middleware config
// acess control allow orign and etc
app.use(function(req, res, next){
	var responseSettings = {
	        "AccessControlAllowOrigin": 'http://localhost:5001/',
	        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
	        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
	        "AccessControlAllowCredentials": true
	    };

	    /**
	     * Headers
	     */
	    res.setHeader("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
	    res.setHeader("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
	    res.setHeader("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
	    res.setHeader("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);
		
	    if ('OPTIONS' == req.method) {
	        res.send(200);
	    }
	    else {
			console.log(res.rawHeaders)
	        next();
	    }
})

// connect to Mongo when the app initializes
//mongoose.connect('mongodb://localhost/testDB');
mongoose.connect('mongodb://localhost/db');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('\n---DB Connected---');
});

//var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;

//app.use(express.session({ secret: 'SECRET'})); //need to change 'SECRET'
//app.use(passport.initialize());
//app.use(passport.session());
/*
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new LocalStrategy(
	{
		usernameField: 'email'
	}, 
	function verify(email, done){
		mongoDbApi.getUser(email, function(err, user){
			if(err) return done(err);
			//if(!user) return done(null, false);
			done(null, user);
		})
	})
);

//TODO: passport authentication
//console.log(req, res);
function handleAuthentication(req, res, next){
			passport.authenticate('local', function(err, user){
				if(err) return console.log('err'+err); //next(err);
				console.log('user'+req.user);
				//console.log(req.login);
				
				
				req.login(user, function(err){
					if(err) return console.log(err);
					next();
				});
				
			});
			next();
			
}

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()) { return next(); }
	return console.log('not authorized'); //req.json()
		
}
*/
app.get('/home', routes.home);
//app.get('/query', routes.query);
app.get('/stats.json', routes.stats); //middleware: isLoggedIn
app.post('/stats.json', routes.stats);
app.get('/login', routes.login); 
app.get('/oauth2callback', routes.oauth2callback); //middleware: handleAuthentication

//no use since we call imap.getEmail inside oauth2callback
app.get('/getEmails', routes.getEmails);

//TODO:after access token is received, we redirect to mode selection page
//app.get('/modeSelection', ensureAuthenticated, render mode selection page)

//socket.io communication: retrieve score from client after the game is ended.
io.on('connection', function(socket){
	socket.on('score', function(data){
		//console.log(data.score);
		var email = data.email;
		var score = data.score;
		console.log(data);
		mongoApi.addUpdateScore(email, score, function(err, success){
			if(err) console.log(err);
			console.log(success);
		});
	});
	
	//TODO: needs to be inside stats.js
	socket.on('spams', function(spamData){
		if(spamData){console.log('spam received'); }
		//console.log(typeof spamData);
		var ress = JSON.parse(spamData);
		//console.log(res[0]);
		//console.log(ress);
		
		var queryParam = [];
		ress.forEach(function(d){
			var q = {};
			q.from = d.text;
			q.date = new Date(d.date);
			q.user = d.user;
			queryParam.push(q);
			
		});
		
		//TODO:batch search 
		mongoApi.getEmailID(queryParam, function(err, success){
			if(err) console.log(err);
			//var testOne = success[0].msgid;
			//console.log("is this the result??: " + success);
			//console.log(success);
			
			var msgId = success[0].msgid;
			
			var newLabel = 'SPAM';
			/*
			oauth2.getUserEmailLabels(email, function(err, success){
				if(err) console.log(err);
				console.log(success);
			});
			
			//add SPAM label to this email
			oauth2.modifyEmailLabel(email, msgId, newLabel, function(err, success){
				if(err) console.log(err);
				console.log(success);
			});
			*/
			
			oauth2.getOneEmail(msgId, function(err, success){
				if(err) console.log(err);
				console.log(success);
			});
			
		});
		
		
		//mongodb update
		//googleapi update
		
	});
});

//app.listen(5001);
server.listen(5001);

console.log('* Started *');