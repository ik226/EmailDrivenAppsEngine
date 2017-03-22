define(["globals", "utils", "enemy", "./backgroundLine", "./gameInfoDisplay"], function (GLOBAL, Utils, Enemy, BackgroundLine, GameInfoDisplay) {
	return {
		update : function (player) {
    
      	  	//shoot
			if (GLOBAL.KEYDOWN.isSpace()) {
				player.shoot();
			}
			
      	  	if(GLOBAL.GAMEMODE=='leftrightonly'){
        		//left
        		if (GLOBAL.KEYDOWN.left) {
          		  	var speed = GLOBAL.RESTIME;
          		  	speed = Math.min(Math.max(3, (30000 / speed)), 20);
          		  	player.x-=speed;
        		}      
        		//right
        		if (GLOBAL.KEYDOWN.right) {
          		  	var speed = GLOBAL.RESTIME;
          		 	speed = Math.min(Math.max(3, (30000 / speed)), 20);
          		  	player.x+=speed;
        		}
      	  	}
			
      		else{
        		//left
        		if (GLOBAL.KEYDOWN.left) {
          		  	player.left(0.075);
        	  	}      
        		//right
        		if (GLOBAL.KEYDOWN.right) {
        			player.right(0.075);
        		}
        		//up
        		if (GLOBAL.KEYDOWN.up) {
          		  	var speed = GLOBAL.RESTIME;
          		  	speed = Math.min(Math.max(3, (30000 / speed)), 20);
          		  	player.up(speed);
        		}
        		//down
        		if (GLOBAL.KEYDOWN.down) {
          		  	var speed = GLOBAL.RESTIME;
          		  	speed = Math.min(Math.max(3, (30000 / speed)), 20);				
          		  	player.down(speed);
        		}
      	  	}
      
      	  	//keep player inside screen
			player.x = player.x.clamp(0, GLOBAL.CANVAS_WIDTH - player.width);
      	  	player.y = player.y.clamp(0, GLOBAL.CANVAS_HEIGHT - player.height);
      
     	   	//add bg lines
      	  	if(Math.random()<0.02){
        		while(GLOBAL.BACKGROUNDLINES.length<500){
        			  GLOBAL.BACKGROUNDLINES.push(BackgroundLine());
        		}
      	  	}
      
    		//update bg lines
      	  	GLOBAL.BACKGROUNDLINES.forEach(function (line) {
				line.update();
			});
			GLOBAL.BACKGROUNDLINES = GLOBAL.BACKGROUNDLINES.filter(function (line) {
				return line.active;
      		});
      
      	  	//update bullets
			GLOBAL.PLAYERBULLETS.forEach(function (bullet) {
				bullet.update();
			});
			GLOBAL.PLAYERBULLETS = GLOBAL.PLAYERBULLETS.filter(function (bullet) {
				return bullet.active;
      		});
      
      	  	//update enemies
			GLOBAL.ENEMIES.forEach(function (enemy) {
				enemy.update();
			});
			GLOBAL.ENEMIES = GLOBAL.ENEMIES.filter(function (enemy) {
				return enemy.active;
			});
      	  	
      	 	//update GameInfoDisplay
      	  	GameInfoDisplay.update();
      
      		//handle collisions
			this._handleCollisions(GLOBAL, player, this._collides);

			//TODO:break the function into properly isolated functions?
			var nextEnemy = this._shouldCreateEnemy();
			
			if (nextEnemy) {
				GLOBAL.HOURENEMYNUMBER++;

				var from = nextEnemy.from;
				var color = this._colorEnemy(from);
				
				//TODO: Make size of the enemy ship proportional to the length of the corresponding incoming email.
				//console.log(nextEnemy);
				//Object {numOfTo: 1, numOfCc: 0, from: "calschatter@cornell.edu"}
				
				
				var scale = Math.min(10, (nextEnemy.numOfTo + nextEnemy.numOfCc));
				scale = (scale / 10) * 1.5 + 1;
				//var scale = nextEnemy.numOfTo + nextEnemy.numOfCc;
				//console.log(Number(scale))
				
				
				GLOBAL.ENEMIES.push(Enemy({
						color : color,
						//scale : scale
						speed : scale
					}));
			}
			
			//debug: finding obj with proper size property
			/*
			var sized = [];
			for(var k=0; k<GLOBAL.INCOMINGEMAILDATA.length; k++){
				var d = GLOBAL.INCOMINGEMAILDATA[k];
				d.forEach(function(i){
					if(i.size == undefined){
						sized.push(i);
					}
				});
			};
			*/
			//console.log(sized);
		},
		
		_colorEnemy: function(from){
			var color = 'white';
			if (from.search(/@cornell.edu/i) != -1){
				color = 'red';
			} else if(from.search(/.edu/i) != -1){
				color = 'blue';
			} else if (from.search(/@gmail.com/i) != -1) {
				color = 'green';
			} else if (from.search(/@yahoo./i) != -1) {
				color = 'green';
			} else if (from.search(/@hotmail./i) != -1) {
				color = 'green';
			} else if (from.search(/@outlook./i) != -1) {
				color = 'green';
			} else {
				color = 'grey';
			}
			return color;
		},
		
		_shouldCreateEnemy : function () { //TODO: should not be doing so many things. Break down 
			var hour = GLOBAL.GAMEHOUR;
			var inemaildata = GLOBAL.INCOMINGEMAILDATA;
			//console.log(inemaildata);
			var totalhourloops = GLOBAL.FPS * GLOBAL.HOURLENGTH; // HOURLENGTH == 20
			//var numenemies = (inemaildata[hour]) ? inemaildata[hour].length : 0;
			var numenemies = inemaildata ? inemaildata[hour].length : 0;
			GLOBAL.HOURITR++
			//console.log(GLOBAL.HOURITR);
			if (GLOBAL.HOURITR > totalhourloops) {
				//moving to next wave
				if (GLOBAL.HOURITR > totalhourloops + (2 * GLOBAL.FPS)
					&& GLOBAL.ENEMIES.length === 0) { 
					GLOBAL.HOURITR = 0;
					GLOBAL.HOURENEMYNUMBER = 0;
					GLOBAL.GAMEHOUR++;
         		   	GameInfoDisplay.hourSplash();
					//reset defeat count
					GLOBAL.DEFEAT = 0;
				}
				//console.log("GLOBAL.HOURITR: " + GLOBAL.HOURITR)
				//console.log("GLOBAL.GAMEHOUR: " + hour)
				//console.log("GLOBAL.INCOMINGMAILDATA: ", inemaildata);
				//console.log("number enemey: " + numenemies);
				//console.log("total hour loops: " + totalhourloops)
				//console.log("GLOBAL.ENEMIES.length " + GLOBAL.ENEMIES.length)
				//console.log(GLOBAL.OUTGOINGEMAILDATA);
				//console.log(inemaildata);
				
				
				/*
				//counting all incoming emails
				function counting(){
					var count=0;
					for(val in inemaildata){
						for(var i=0; i<inemaildata[val].length; i++){
							count = count+1;
						};
					};
					return count;
				}
				var num = counting();
				console.log(num);
				*/
				
				// TODO: ending scene, summing up
				// GLOBAL.GAMEHOUR > 23, below is just to debug
				if(GLOBAL.GAMEHOUR > 23){
					this._gameOver(GLOBAL.GAMEHOUR);
				} 
				
				//if (GLOBAL.GAMEHOUR > 1) {
					//alert('Game Over. Refresh page to play again');
					//this._gameOver();
					
					
					//}
				return 0
			}
			if (numenemies === 0) {
				return 0
			}

			//Todo: fails when numenemies > totalhourloops
			if (GLOBAL.HOURITR % Math.round(totalhourloops / numenemies) === 0) {
				var nextEnemy = GLOBAL.INCOMINGEMAILDATA[GLOBAL.GAMEHOUR][GLOBAL.HOURENEMYNUMBER];
				//console.log(GLOBAL.INCOMINGEMAILDATA, GLOBAL.GAMEHOUR, GLOBAL.HOURENEMYNUMBER);
				//console.log(GLOBAL.HOURITR ,totalhourloops ,numenemies, GLOBAL.HOURITR % Math.round(totalhourloops / numenemies));
				//console.log(nextEnemy);
				return nextEnemy;
			}

			return 0;
			//return Math.random() < 0.1
		},
		
		_stopGame: function(){
			clearInterval(GLOBAL.STOPKEY)
		},
		//handle gameover message 
		_gameOver: function(gameHour){
			//Winning scenario, stay until n rounds
			// gameHour > n
			//if(gameHour > 1){
				
				//TODO: stop key enactivated 
				this._stopGame();
				var page = document.getElementById('gamePage')
				page.style.display ='';
				var text = 'YOU WON';
				page.innerHTML = text;
				page.style.color = 'white';
				
				//TODO: add score view
			
				//TODO: BUTTON STYLE 
				
				// replay with same account
				var reButton = document.createElement('div');
				//console.log(reButton);
				reButton.style.color = 'white';
				page.appendChild(reButton);
				reButton.id = 'reButton';
				var reText = document.createTextNode('CLICK ME: play again with same account');
				reButton.appendChild(reText);
				document.getElementById('reButton').addEventListener('click', function(){
					// TODO: make sure the path is correct
					// TODO: remove exit alert when game is ended 
					//function(){ window.onbeforeunload=null;}
					window.location.assign('/spacegame');
					
				})
			
				// replay with new account
				var newButton = document.createElement('div');
				newButton.style.color = 'white';
				page.appendChild(newButton);
				newButton.id = 'newButton';
				var newText = document.createTextNode('CLICK ME: play again with new account');
				newButton.appendChild(newText);
				document.getElementById('newButton').addEventListener('click', function(){
					//TODO: make sure the path is correct
					window.location.assign('/')
				})
				
				//display data visualization 
				GameInfoDisplay.visualization(page);
				//GameInfoDisplay.visOutgoing(page);
				
				
				
				
		},
		
		_collides : function (a, b) {
			"use strict"
			return a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y;
		},
		
		_handleCollisions : function (GLOBAL, player, _collides) {
			"use strict"
			GLOBAL.PLAYERBULLETS.forEach(function (bullet) {
				GLOBAL.ENEMIES.forEach(function (enemy) {
					if (_collides(bullet, enemy)) {
						enemy.explode();
						bullet.active = false;
					}
				});
			});

			GLOBAL.ENEMIES.forEach(function (enemy) {
				if (_collides(enemy, player)) {
					// TODO:does it really explodes?
					// (update) handle explode() with any feedback (i.e. graphic explosion, or damage taken..)
					
					// console.log("collides/explodes");
					// it does..
					enemy.explode();
					player.explode();
					
				}
			});
		},
		getGameData : function (email, incoming, callback) {
			/*getGameData function
			use getEmailData('h@hh.com', true) //gets incoming email data
			use getEmailData('h@hh.com', false) //gets outgoing email data
			 */

			if (incoming === 'resTime') {

				var url = '/stats.json?id=getAvgResponseTime&email=' + email;
				
				console.log(url);
				
				Utils.getJson(url, function (err, json) {
					if (err){
						callback(err);
						console.log("error in utils getJson")
					}
					else{
						callback(null, incoming, json);
					}
				});
				return
			}

			//Make url
			incoming = (incoming) ? 1 : 0;
			
			var url = '/stats.json?id=getSpaceGameData&email=' + email + '&incoming=' + incoming;
			
			Utils.getJson(url, function (err, json) {
				if (err)
					callback(err);
				else
					callback(null, incoming, json);
			});
			return;
		}
	}
});
