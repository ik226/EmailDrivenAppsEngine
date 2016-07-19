//"use strict"

require(["globals", "utils", "player", "controller", "view"],
	function (GLOBAL, Utils, player, Controller, View) {
	//Ran after all requires (and their dependencies have loaded)

	var email = Utils.getCookie('email');
  	email = email.replace("%40", "@");
  	//console.log(email)
  
	if (!Utils.validateEmail(email)) {
		//alert(email + ' - invalid cookies. Will redirect to home.');
		window.location.assign('/');
		return 0;
	}

	start(email);
	
	//exit alert 
	var popit = true;
	window.onbeforeunload = function() { 
     		if(popit == true) {
          		popit = false;
          		return "Are you sure you want to leave?"; 
     		}
	}

	function start(email) {
		//return
		//email = email || 'hhm38@cornell.edu'
		//document.getElementById("infoPage").style.display = "none";
		document.getElementById("gamePage").style.display = "";
		Controller.getGameData(email, true, gameDataCB);
		Controller.getGameData(email, false, gameDataCB);
		Controller.getGameData(email, 'resTime', resTimeCB);

		function startGame() {

			var p = player;
			var g = GLOBAL;
			// game loop
			setInterval(function () {
				Controller.update(p);
				View.draw(p);
			}, 1000 / g.FPS);
      			g.SOUND.play("backgroundMusic", 0, true);
      
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
				startGame();
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
				var infopage = document.getElementById("infoPage");
				infopage.style.display = ""
				var text = infopage.innerHTML="Uh oh! It seems you haven't received" + 
				" and/or replied to any email within the last 30 days." + "<br><br>" +
				 " Try reloading and playing with a more active account."
				infopage.style.color = "white"
				document.getElementById("gamePage").style.display = "none"
				//alert(err);
				return;
				
			}
			GLOBAL.LOADING--;
			if (incoming) {
				GLOBAL.INCOMINGEMAILDATA = resJson
			} else {
				GLOBAL.OUTGOINGEMAILDATA = resJson
			}
			if (GLOBAL.LOADING === 0) {
				startGame();
			}
		}

	};
});
