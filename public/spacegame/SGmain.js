//"use strict"

require(["globals", "utils", "player", "controller", "view"],
	function (GLOBAL, Utils, player, Controller, View) {
	//Ran after all requires (and their dependencies have loaded)
	//var email = Utils.getCookie('hhm38@cornell.edu')
	var email = Utils.getCookie('email');
  	email = email.replace("%40", "@");
  	
  	/*
	if (!Utils.validateEmail(email)) {
		//alert(email + ' - invalid cookies. Will redirect to home.');
		console.log("invalid email: SGmain.js")
		//window.location.assign('/');
		return 0;
	}
	*/
	start(email);
	
	function start(email) {
		//return
		//email = email || 'hhm38@cornell.edu'
		//document.getElementById("infoPage").style.display = "none";
		document.getElementById("infoPage").style.display = "none";
		document.getElementById("gamePage").style.display = "";
		//for received emails
		Controller.getGameData(email, true, gameDataCB);
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
			console.log(GLOBAL.STOPKEY);
      	  	// TODO: sound on/off
			//g.SOUND.play("backgroundMusic", 0, true);
      
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

		//gamedata callback
		function gameDataCB(err, incoming, resJson) {
			if (err) {
				//TODO: handle error message in html 
				//(update) add styles 
				
				// solution: instead of displaying error as alert message, 
				// added text as html element
				// however, the game runs behind regardlessly at #gamePage, which is hidden forcefully.
				//
				console.log(err);
				
				return;
			}
			else{
				GLOBAL.INCOMINGEMAILDATA = resJson.incoming;
				GLOBAL.OUTGOINGEMAILDATA = resJson.outgoing;
				//console.log(resJson);
				startGame();
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