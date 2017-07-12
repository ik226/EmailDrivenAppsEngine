//"use strict"

require(["globals", "utils", "player", "controller", "view", "cockpit", 'gameInfoDisplay'],
	function (GLOBAL, Utils, player, Controller, View, cockpit, GameInfoDisplay) {
	//Ran after all requires (and their dependencies have loaded)
	//var email = Utils.getCookie('hhm38@cornell.edu')
	
	//TODO: cookie encrpytion
	var email = Utils.getCookie('email');
  	email = email.replace("%40", "@");
  	GLOBAL.EMAIL = email;
	
	//console.log(GLOBAL.CANVAS_WIDTH, GLOBAL.CANVAS_HEIGHT)
	
	//draw cockpit for mode selection
	var canvas = document.getElementById('modeSelectCanvas');
	//email, canvas, current: 'resultSection' || 'modeSelection', callback: 
	cockpit.draw(email, canvas, 'modeSelection', start);
	
  	/*
	if (!Utils.validateEmail(email)) {
		//alert(email + ' - invalid cookies. Will redirect to home.');
		console.log("invalid email: SGmain.js")
		//window.location.assign('/');
		return 0;
	}
	*/
	
	
	
	function start(email, mode) {
		//return
		//email = email || 'hhm38@cornell.edu'
		//document.getElementById("infoPage").style.display = "none";
		
		
		
		
		document.getElementById("infoPage").style.display = "none";
		document.getElementById("gamePage").style.display = "";
		//for reflection mode
		/*
		switch(_mode){
			case 'reflection':
				console.log('running?');
				Controller.getGameData(email, true, gameDataCB);
			case 'spam':
				console.log('spma running?')
				Controller.getGameData(email, 'spam', spamDataCB);
		}*/
		if(mode == 'shooting'){
			GLOBAL.GAMEMODE = 'leftrightonly'
			Controller.getGameData(email, 'spam', spamDataCB);
			
		} else {
			GLOBAL.GAMEMODE = 'alldirection'
			Controller.getGameData(email, true, gameDataCB);
		}
		
		//Controller.getGameData(email, true, gameDataCB);
		
		//for spam management mode
		//Controller.getGameData(email, 'spam', spamDataCB);
		
		//console.log('asked for received emails');
		//for sent emails
		//Controller.getGameData(email, false, gameDataCB);
		//console.log('asked for sent emails');
		 
		//Controller.getGameData(email, 'resTime', resTimeCB);
		
		//does startGame() runs completely after the client(SGmain.js) receive JSON res?
		//i.e. is this process synchronous? 
		//startGame()
		function startGame() {

			var p = player;
			var g = GLOBAL;
			// game loop
			
			// TODO: stop key added
			GLOBAL.STOPKEY = window.setInterval(function () {
				Controller.update(p);
				View.draw(p);
			}, 1000 / g.FPS);
			//console.log(GLOBAL.STOPKEY);
      	  	// TODO: sound on/off
			//g.SOUND.play("backgroundMusic", 0, true);
      	 	//Controller._gameOver();
		}
		
		
		//gamedata callback
		function resTimeCB(err, incoming, resJson) {
			if (err) {
				alert(err);
				return;
			}
			GLOBAL.LOADING--;

			var sum = resJson.reduce(function (a, b) {
					return a + b
				});
			var avg = sum / resJson.length;
			GLOBAL.RESTIME = avg;

			console.log(GLOBAL.RESTIME)
			if (GLOBAL.LOADING === 0) {
				//startGame();
			}
		}
		function spamDataCB(err, resJson){
			if(err) console.log(err); 
			else{
				console.log(resJson);
				//var endCount = 0;
				for(var item in resJson){
					GLOBAL.ENDCOUNT ++;
				}
				//console.log(GLOBAL.ENDCOUNT);
				GLOBAL.INCOMINGEMAILDATA = resJson;
				//set first splash info for shooting mode
				GameInfoDisplay.setFirstSplashInfo();
				startGame();
			}
		}
		//gamedata callback
		function gameDataCB(err, incoming, resJson) {
			if (err) {
				console.log(err);
				
				return;
			}
			else{
				for(var item in resJson){
					GLOBAL.ENDCOUNT ++;
				}
				GLOBAL.INCOMINGEMAILDATA = resJson.incoming;
				GLOBAL.OUTGOINGEMAILDATA = resJson.outgoing;
				//console.log(resJson);
				
				//TODO: for dev purpose
				startGame();
				//Controller._gameOver();
			}
			//GLOBAL.LOADING--;
			/*
			if (incoming) {
				GLOBAL.INCOMINGEMAILDATA = resJson
			} else {
				GLOBAL.OUTGOINGEMAILDATA = resJson
			}
			
			else if(resJson == undefined){
				console.log(
					'resJson is undefined'
				);
			}
			
			else{
				if(resJson.incoming == 1){
					GLOBAL.INCOMINGEMAILDATA = resJson
				} else {
					GLOBAL.OUTGOINGEMAILDATA = resJson
				}
			}
			
			if(resJson == undefined){
				console.log('resJson is undefined');
			}
			if (GLOBAL.LOADING === 0) {
					//startGame();
				}
			
			*/
		};

	};
});