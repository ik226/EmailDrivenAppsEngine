define(["globals", "utils", "enemy", "./backgroundLine", "./gameInfoDisplay", 'explosion', 'trashCan', 'cockpit'], 
function (GLOBAL, Utils, Enemy, BackgroundLine, GameInfoDisplay, Explosion, trashCan, cockpit) {
	return {
		update : function (player) {
    
      	  	//shoot
			if (GLOBAL.KEYDOWN.isSpace()) {
				player.shoot();
			}
			
      	  	if(GLOBAL.GAMEMODE =='leftrightonly'){
        		//left
				var speed = 10;
        		if (GLOBAL.KEYDOWN.left) {
          		  	//var speed = GLOBAL.RESTIME;
          		  	//speed = Math.min(Math.max(3, (30000 / speed)), 20);
          		  	player.x-=speed;
        		}      
        		//right
        		if (GLOBAL.KEYDOWN.right) {
          		  	//var speed = GLOBAL.RESTIME;
          		 	//speed = Math.min(Math.max(3, (30000 / speed)), 20);
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
          		  	//var speed = GLOBAL.RESTIME;
					var speed = 10;
          		  	//speed = Math.min(Math.max(3, (30000 / speed)), 20);
          		  	player.up(speed);
        		}
        		//down
        		if (GLOBAL.KEYDOWN.down) {
          		  	//var speed = GLOBAL.RESTIME;
					var speed = 10;
          		  	//speed = Math.min(Math.max(3, (30000 / speed)), 20);				
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
			
			//update explosion
			GLOBAL.EXPLOSION = GLOBAL.EXPLOSION.filter(function (explosion){
				return explosion.active;
			});
      	  	
      	 	//update GameInfoDisplay
      	  	GameInfoDisplay.update();
      
      		//handle collisions
			this._handleCollisions(GLOBAL, player, this._collides);
			
			//check Life
			if(GLOBAL.GAMEMODE !='leftrightonly' && GLOBAL.LIFE == 0){
				this._gameOver()
			}

			//TODO:break the function into properly isolated functions?
			var nextEnemy = this._shouldCreateEnemy();
			
			if (nextEnemy) {
				//add up enemy number to ENEMYSUM
				GLOBAL.ENEMYSUM ++;
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
				
				var enemyAddress = '';
				var enemyDate = nextEnemy.date || null;
				if(GLOBAL.GAMEMODE =='leftrightonly'){
					enemyAddress = nextEnemy.from;
					scale = 5;
				}
				var enemyParam = {color: color, speed: scale, text: enemyAddress, date: enemyDate};
				
				/*
				GLOBAL.ENEMIES.push(Enemy({
						color : color,
						//scale : scale
						speed : scale
					}));
				*/
				GLOBAL.ENEMIES.push(Enemy(enemyParam));
			} else {
				
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
			
			var totalhourloops = GLOBAL.FPS * GLOBAL.HOURLENGTH; // HOURLENGTH == 20
			
			var numenemies = inemaildata[hour] ? inemaildata[hour].length : 0;
			GLOBAL.HOURITR++
			
			
			if (GLOBAL.HOURITR > totalhourloops) {
				//moving to next wave
				if (GLOBAL.HOURITR > totalhourloops + (2 * GLOBAL.FPS)
					&& GLOBAL.ENEMIES.length === 0) { 
					//GLOBAL.HOURITR = 0;
					//GLOBAL.HOURENEMYNUMBER = 0;
					//GLOBAL.GAMEHOUR++;
         		   	//GameInfoDisplay.hourSplash();
					//reset defeat count
					//GLOBAL.DEFEAT = 0;
					clearLvl();
				}
				
				
				// GLOBAL.GAMEHOUR > 23, below is just to debug
				// if all stage is cleared or LIFE == 0, then ends game
				
				
				if(GLOBAL.GAMEHOUR > 0){ //GLOBAL.ENDCOUNT-1){	TODO: restore this for final version
					this._gameOver();
				} 
				

				return 0
			}
			if (numenemies === 0) {
				//set hourSplash to 0 when no enemies in this game time
				// so that game just proceeds to next stage when no enemy presents at this stage
				console.log('skipping??');
				clearLvl();
				return 0
			}

			//Todo: fails when numenemies > totalhourloops
			if (GLOBAL.HOURITR % Math.round(totalhourloops / numenemies) === 0) {
				//TODO: handle 0 enemy time
				
				var nextEnemy = GLOBAL.INCOMINGEMAILDATA[GLOBAL.GAMEHOUR][GLOBAL.HOURENEMYNUMBER];
				
				return nextEnemy;
			}

			return 0;
			//return Math.random() < 0.1
			
			//reset each stage data for rendering next stage
			function clearLvl(){
				GLOBAL.HOURITR = 0;
				GLOBAL.HOURENEMYNUMBER = 0;
				GLOBAL.GAMEHOUR++;
				
				
     		   	GameInfoDisplay.hourSplash();
				//reset defeat count
				GLOBAL.DEFEAT = 0;
			}
		},
		
		//cease mainloop
		_stopGame: function(){
			clearInterval(GLOBAL.STOPKEY)
		},
		
		//handle gameover message and tasks afterwards 
		_gameOver: function(){
			
				//clear the setTimeInterval, ending loop 
				this._stopGame();
				
				
				//socket io client side: emit score to server when game ends
				//TODO: set it separately
				//call socket io
				var socket = io.connect('http://localhost:5001');
				//socket.emit('score', {score: 8989899, email: GLOBAL.EMAIL});
				
				//console.log(GLOBAL.INCOMINGEMAILDATA);
				
				
				if(GLOBAL.GAMEMODE == 'leftrightonly'){
					
					//hide gamePage
					document.getElementById('statSVG').style.display = 'none';
					document.getElementById('gamePage').style.display = 'none';
					
					//show spamDiv
					document.getElementById('spamListDiv').style.display = '';
					
					//var canvas = document.getElementById('spamCanvas')
					//canvas.width = (window.innerWidth).clamp(480, 1200);
					//canvas.height = 200;
					//var context = canvas.getContext('2d');
					
					//TODO:
					var monitor = document.getElementById('spamCanvas');
					cockpit.draw(GLOBAL.EMAIL, monitor, 'spamSection', null);
					
				}
				
				
				//display data visualization 
				if(GLOBAL.GAMEMODE=='alldirection'){
					
					//update score
					socket.emit('score', {score: GLOBAL.SCORE, email: GLOBAL.EMAIL});
					
					//display the result of game play
					var page = document.getElementById('gamePage');
					page.style.display = 'none';
					
					//display cockpit image
					//document.getElementById('endPage').style.display = '';
					//monitor.style.display = '';
					var monitor = document.getElementById('endCanvas');
					
					//draw cockpit as a resultSection page
					cockpit.draw(GLOBAL.EMAIL, monitor, 'resultSection', null);
				
					
				}
				
				
				
				
				
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
					
					enemy.explode();
					player.explode();
					if(GLOBAL.GAMEMODE == 'alldirection'){
						GLOBAL.LIFE --;
					}
					
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
			//TODO: insert spam query to url
			if(incoming == 'spam'){
				var url = '/stats.json?id=getSpamGameData&email=' + email;
				Utils.getJson(url, function (err, json) {
					if (err){
						callback(err);
						console.log("error in utils getJson")
					}
					else{
						callback(null, json);
					}
				});
				return;
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
