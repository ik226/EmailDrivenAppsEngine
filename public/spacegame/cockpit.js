define(["./gameInfoDisplay", './trashCan', './globals'], function(GameInfoDisplay, tCan, GLOBAL){
	return {
		/*
			draw cockpit image
		@param {string} user - email of this user
		@param {obj} canvas - html canvas element
		@param {stirng} current - current mode of cockpit monitor to be rendered
				'modeSelection': mode selection('survival' || 'shooting') before game starts 
				'resultSection' : result + infographic display after 'survival' mode 
				'spamSection' : handle game results after 'shooting' mode
		@param {function} cb - callback for 'modeSelection', call getGameData 
		*/
		draw: function(_user, canvas, current, cb){
			
			var user = _user;
			var cockpit = canvas;
			
			//set size according to current window size 
			//TODO: not less than width 800px for better experience
			var c_width = window.innerWidth > 800 ? window.innerWidth : 800;
			var c_height = c_width * 3/4;
			
			//set canvas size
			cockpit.setAttribute('width', c_width);
			cockpit.setAttribute('height', c_height);
			
			//set paper.view on this canvas
			paper.setup(cockpit);

			//store current view's size
			var cockpit_width = paper.view.size.width;
			var cockpit_height = paper.view.size.height;
	
			/*
				===========================================================
				background (ship frames and monitor frames)
			*/
	
			//instantiate points for drawing cockpit frames
			var leftUpper = new paper.Point(0,0); // left upmost corner
			var rightUpper = new paper.Point(cockpit_width,0);
			var leftAnchor = new paper.Point(cockpit_width/4, cockpit_height* 9/40);
			var rightAnchor = new paper.Point(cockpit_width * 3/4, cockpit_height* 9/40);
			var leftMid = new paper.Point(0, cockpit_height/3);
			var rightMid = new paper.Point(cockpit_width, cockpit_height/3);
			var leftLower = new paper.Point(0, cockpit_height/2);
			var rightLower = new paper.Point(cockpit_width, cockpit_height/2); 
			
			//points for monitor
			var monitorUpperLeft = new paper.Point(cockpit_width/7, cockpit_height * 1/4);
			var monitorUpperRight = new paper.Point(cockpit_width * 6/7, cockpit_height * 1/4);
			var monitorEndLeft = new paper.Point(cockpit_width/7, cockpit_height * 6/7);
			var monitorEndRight = new paper.Point(cockpit_width * 6/7, cockpit_height * 6/7);
	
			//draw frames
			var shipUpperFrame = new paper.Path();
			shipUpperFrame.add(leftUpper, leftAnchor, rightAnchor, rightUpper);
			shipUpperFrame.strokeColor = '#222320';
			shipUpperFrame.strokeWidth = 40;
	
			var shipMidFrame = new paper.Path();
			shipMidFrame.add(leftMid, leftAnchor, rightAnchor, rightMid);
			shipMidFrame.strokeColor = '#222320';
			shipMidFrame.strokeWidth = 40;
	
			var shipLowerFrame = new paper.Path();
			shipLowerFrame.add(
				//leftLower,
				leftMid, 
				new paper.Point(leftAnchor.x/3, leftLower.y),
				new paper.Point(leftAnchor.x/2, leftLower.y* 3/2),
				new paper.Point(rightAnchor.x + leftAnchor.x/2, leftLower.y* 3/2),
				new paper.Point(rightAnchor.x + leftAnchor.x*2/3, leftLower.y),
				rightMid, 
				new paper.Point(cockpit_width, cockpit_height), 
				new paper.Point(0, cockpit_height)
			);
			shipLowerFrame.closePath();
			shipLowerFrame.strokeColor = '#5b626d';
			shipLowerFrame.fillColor = {
				gradient: {
					stops: [["#5b626d", 0.05], ["#434951", 0.2], ["#26292d", 1]]
				},
					origin: new paper.Point((rightAnchor.x - leftAnchor.x)/2, rightAnchor.y),//(rightAnchor - leftAnchor)/2,
					destination: new paper.Point(cockpit_width/2, cockpit_height)
					//(new paper.Point(cockpit_width, cockpit_height) - new paper.Point(0, cockpit_height))/2
		
			};
			shipLowerFrame.insertBelow(shipMidFrame);
			//draw monitor
			shipMonitor = new paper.Path();
			//shipMonitor.add(monitorUpperLeft, monitorUpperRight, monitorMidRight, monitorLowerRight, monitorEndRight,
			//	monitorEndLeft, monitorLowerLeft, monitorMidLeft);
			shipMonitor.add(monitorUpperLeft, monitorUpperRight, monitorEndRight, monitorEndLeft);
			shipMonitor.closePath();
			//shipMonitor.strokeColor = '#5cdb99';
			shipMonitor.strokeWidth = 1;
			shipMonitor.strokeJoin = 'round';
			shipMonitor.fillColor = 'black';
			shipMonitor.fillColor.alpha = 0.7;
	
			//points for monitor frame
			var smfUL = monitorUpperLeft.subtract(new paper.Point(10,10));
			var smfUR = monitorUpperRight.add(new paper.Point(10,-10));
			var smfLL = monitorEndLeft.add(new paper.Point(-10,10));
			var smfLR = monitorEndRight.add(new paper.Point(10,10));
			var smfMUL = new paper.Point(smfLL.x - 20, smfLL.y/3);
			var smfMLL = new paper.Point(smfMUL.x, smfLL.y * 3/5);
	
			var smfmUR = new paper.Point(smfLR.x + 20, smfLR.y/3);
			var smfMUR = new paper.Point(smfLR.x + 20, smfLR.y * 9/15);
			var smfMMR = new paper.Point(smfLR.x + 80, smfLR.y * 10/15);
			var smfMMMR = new paper.Point(smfMMR.x - 10, smfLR.y * 14/15)
			//var smfMLR = new paper.Point(smfUR.x, smfMMMR.y+16);
			
			//draw monitor frame
			var shipMonitorFrame = new paper.Path();
			shipMonitorFrame.add(
				smfUL, smfUR, smfmUR, smfMUR, smfMMR, smfMMMR ,smfLR, smfLL, smfMLL, smfMUL
			);
			shipMonitorFrame.closePath();
			shipMonitorFrame.strokeColor = '#8d9b94';
			shipMonitorFrame.strokeWidth = 20;
			shipMonitorFrame.fillColor = '#8d9b94';
			shipMonitorFrame.strokeJoin = 'round';
			shipMonitorFrame.fillColor.alpha = 0.8;
	
			//adjust hierarchy
			shipLowerFrame.insertBelow(shipMonitor);
			shipMonitorFrame.insertBelow(shipMonitor);
	
	
	
			//contents on monitor view; text, img, etc
			var monitor_h = monitorEndLeft.y - monitorUpperLeft.y;
			var monitor_w = monitorEndRight.x - monitorUpperLeft.x;
	
			/*
				======================================================================
				monitor contents part
				
				Monitor Object
					contains inner objs of Planet, MissionDesc, UserInfoText, LaunchButton
			*/
			
			//@param {string} user - email address of this user
			//@param {Rectangle} canvas - shipMonitor.bounds
			//@param {String} currentPage - 'modeSelection' || 'resultSection' || 'spamSection'
			//@param {function} callback - getGameData when click launch button
			function Monitor(user, canvas, currentPage, callback){
				// varible declaration
				var user = user;
				var currentPage = currentPage;
		
				var padding = {
					top: canvas.height/20, 
					bottom: canvas.height/25, 
					left: canvas.width/25, 
					right: canvas.width/25
				};
				
				//monitor bounds with paddings
				var monitorCanvas = new paper.Rectangle(
					canvas.x + padding.left, 
					canvas.y + padding.top, 
					canvas.width-padding.right, 
					canvas.height - padding.bottom
				);
		
				var monitor_h = monitorCanvas.height;
				var monitor_w = monitorCanvas.width;
		
				//for modeSelection
				var selected; //the selected mode to be launched (assume synchronized set/get) 
				var survival; //storing planet object of survival mission
				var shooting; //storing planet obj of shooting spam mission
		
				//for infographic
				var currentGraph; //storing current infographic page
		
				//for animation
				var textDone = false;
				var enableOrbit = false;
				var haloCursor;
				var clickedHaloCursor;
				var lineToPlanet;
				var descBox;
				var launchBtn;
		
				//inner classes

				//draw destination objects (planet)
				//@param {string} mission - type of game mode that this planet will represent
				//							'survival' or 'shooting'
				function Planet(mission){
					this.mission = mission;
					var m = mission;
					
					
					//draw a dwarf star
					var planet_canvas = {
						ul: monitorUpperLeft.add(new paper.Point(0, monitor_h/5)),
						ur: monitorUpperRight.add(new paper.Point(0, monitor_h/5)),
						ll: monitorEndLeft,
						lr: monitorEndRight
					}
			
					//console.log(planet_canvas)
					
					var center;
					var radius;
					
					//assign center and radius variables corresponding to their mission
					if(this.mission == 'survival'){
						center = new paper.Point(
								planet_canvas.ul.x + monitor_w/4,
								planet_canvas.ul.y + (planet_canvas.ll.y - planet_canvas.ul.y)/2
				
							);
						radius = (planet_canvas.ll.y - planet_canvas.ul.y) * 1/7;
					} else {
						center = new paper.Point(
								planet_canvas.ul.x + monitor_w* 3/4,
								planet_canvas.ul.y + (planet_canvas.ll.y - planet_canvas.ul.y)/2
				
							);
						radius = (planet_canvas.ll.y - planet_canvas.ul.y) * 1/9;
					}
			
		 
					this.planet = new paper.Path.Circle({
						center: center,
						radius: radius
					});
					if(m == 'survival'){
						this.planet.fillColor =  {
								//alpha: 0,
								gradient: {
									stops: [['#e8ecf', 0.01],['#bac7db', 0.3],['#344a68', 1]],
									radial: true
								},
								origin: center.subtract(new paper.Point(radius/5,radius/5)),
								destination: this.planet.bounds.rightCenter
						}
					} else {
						this.planet.fillColor =  {
								//alpha: 0,
								gradient: {
									stops: [['#8a879b', 0.001], ['#9891c1', 0.05], ['#9891c1', 0.3],['#17113a', 1]],
									radial: true
								},
								origin: center.subtract(new paper.Point(radius/3,radius/3)),
								destination: this.planet.bounds.rightCenter
						}
					}
					//TODO: assign a "creative" planet (or system) name to each destination
					this.planet.name = m;
		
		
					//hierarchy: put this above ship monitor
					this.container = new paper.Group(this.planet);
					this.container.insertAbove(shipMonitor);
		
					this.debris = [];
					//color assigner
					var assignColor = function(){
						if(m == 'survival'){
							var colors = ['#f4c141', '#876d2c', '#aa80a7', '#6d188e'];
						} else {
							var colors = ['#799694', '#bca082', '#8aa577', '#eaefe6'];
						}
						return colors[Math.floor(Math.random()*colors.length)];
					};
					// draw orbiting debris
					for(var i=0; i<30; i++){
						var angle = Math.random() * (2 * Math.PI);
						var dist = (Math.random() * 50) + (radius + 20); //dist + radius
						var x = (dist * Math.cos(angle)) + center.x;
						var y = (dist * Math.sin(angle)) + center.y;
						var p = new paper.Point(x,y);
						var r = (Math.random() * radius/10)+1;
						var d = new paper.Path.Circle(p, r);
						
						d.fillColor = assignColor();
						var s = (Math.random() * 0.003) + 0.001;
		
						var dObj = {debris: d, dist: dist, angle: angle, speed: s};
						this.debris.push(dObj);
						this.container.addChild(d);
						
					}
		
					//console.log(debris);
	
					//simplest hierarchy setter
					var objIntersection = function(debris, planet){
						//insert debris below the planet
						if(debris.position.y < planet.position.y && debris.getIntersections(planet)){
							debris.insertBelow(planet);
						}
						else{
							debris.insertAbove(planet);
						}
					}
					//give orbital motion to each debris
		
					this.animateOrbit = function(){
						var pl = this.planet
						this.debris.forEach(function(d){
			
							var dx = (Math.cos(d.speed+d.angle) - Math.cos(d.angle))* d.dist;
							if(m=='shooting'){
								var dy = (Math.sin(d.speed+d.angle) - Math.sin(d.angle))* d.dist;
							} else { 
								var dy = (Math.sin(d.speed/1.4+d.angle) - Math.sin(d.angle))* d.dist;
							}
							d.debris.position.x += dx;
							d.debris.position.y += dy;
							d.angle += d.speed;
				
							objIntersection(d.debris, pl);
						});
					}
			
					
					//display cursor around planet when comes to mouse events
					var createCursor = function(center, radius) {
						var cursor = new paper.Path.Circle({
							center: center,
							radius: radius + radius/8,
							strokeColor: '#aef704',
							strokeWidth: 4,
							dashArray: [30, 10]
					
							//dashOffset: 3000
						});
						cursor.name = m;
						cursor.insertAbove(shipMonitor);
						cursor.on('frame', function(e){
							this.rotate(-0.6)
						});
						return cursor;
					}
		
					//mouse click event
					this.planet.on('click', function(){
						//draw mission description box
						if(m == 'survival' && !descBox){
							descBox = new MissionDesc(
								m, planet_canvas.ul.add(new paper.Point(monitor_w/2.5, 0))
							);
							clickedHaloCursor = createCursor(center, radius);
						} else if(m == 'shooting' && !descBox){
							descBox = new MissionDesc(
								m, planet_canvas.ul.add(new paper.Point(monitorCanvas.width/8, 0))
							);
							clickedHaloCursor = createCursor(center, radius);
						}
						//brings launch button when mission is selected
						//console.log(launchBtn)
						paper.view.off('frame', launchBtn.moveDown)
						paper.view.on('frame', launchBtn.moveUp)
				
				
						if(haloCursor){
							haloCursor.remove();
						}
						selected = m;
						//console.log(selected);
					});
		
			
		
					// circular cursor over planet
					this.planet.on('mouseenter', function(){
						if(!descBox){
							haloCursor = createCursor(center, radius);
						}
				
			
					});
					this.planet.on('mouseleave', function(){
						if(haloCursor){
							haloCursor.remove();
						}
				
					});
			
					//lineTo helper
					this.lineEnd = function(){
						if(m == 'survival'){
							return this.planet.bounds.center.add(
								new paper.Point(
									radius * Math.cos(Math.PI/6), 
									- radius * Math.sin(Math.PI/6)
								)
							);
						} else if(m == 'shooting'){
							return this.planet.bounds.center.add(
								new paper.Point(
									radius * Math.cos(Math.PI * 5/6), 
									- radius * Math.sin(Math.PI * 5/6)
								)
							);
						}
				
					}
		
				}
	
	
				//description part for each mission
				// @param {string} mission - name of mission
				// @param {Point} canvas - coordinates of description box's bound
				function MissionDesc(destination, canvas){
					this.mission = destination;
			
			
					//TODO: draw boundary path for desc box and a line streched to planet cursor
			
		
					var text;
					if(destination == 'survival'){
						text = {
							mission: ["Survive rush of enemy invaders"],
							description: ["Your email data will be rendered into game elements.",  
							"You will survive 24 waves of invaders,", "representing your email pattern in each hour."],
							note: 
								[
									"Levels: represents each hour of a day",
									"Enemies: represents incoming emails ",
							 		"Bullets: the number of emails you've sent"
								]			
							};
				
					} else {
						text = {
							mission: ["Destroy enemy invaders"],
							description: ["The game will render emails", "you've received within last 7 days.", 
							"Destroy spams amongst those emails"],
							note: 
								[
									"Levels: represents each day in a week",
									"Enemies: represents emails you've received",
								]
						};
				
					}
		
					//console.log(text)
		
					this.canvas = canvas;
					var starting = this.canvas.add(new paper.Point(canvas.x/10, canvas.y/5));
					//var ul = canvas.ul;
					//var ll = canvas.ll;
					var padding = canvas.y/12;
					var font = 'Helvetica, arial, sans-serif';
		
					// @param {Point} coord - starting point of textbox
					// @return {list} [result - Group of PointText, coord - canvas coord + padding]
		
					var container = new paper.Group();
					container.insertAbove(shipMonitor);
		
					var textArea = new paper.Group();
					container.addChild(textArea);
					container.bringToFront();
			
					this.container = container;
			
					textArea.fillColor = '#aef704';
		
					//draw texts
					//TODO: resize font size according to frame size
					var draw = function(text, ul, padding){
						//var missionText = new paper.PointText(ul.x + padding, ul.y + padding);
						//var missionDescText = new paper.PointText(ul.x + padding, missionText.position.y + padding);
						//console.log(text)
						var m = generatePos(text.mission, ul, padding);
						var missionArea = m[0];
						missionArea.fillColor = '#42ebf4';
						missionArea.fontSize = 20;
						//missionArea.position.x = ul.x + monitor_w/4;
						//console.log(missionArea.position)
						//missionArea.justification = 'center';
						var missionAreaEnd = m[1];
						var d = generatePos(text.description, missionAreaEnd, padding);
						var descArea = d[0];
						var descAreaEnd = d[1];
						var n = generatePos(text.note, descAreaEnd, padding);
						textArea.addChildren([missionArea, descArea, n[0]]);
						//console.log(paper.project.layers)
			
						function generatePos(list, coord, padding){
							//console.log(list, coord, padding);
							var index = 0;
							var coord = new paper.Point(coord.x, coord.y + padding);
							var result = new paper.Group();
				
							while(index < list.length){
								let pos = new paper.PointText(coord);
								pos.content = list[index];
								pos.fillColor = '#aef704';
								pos.font = font;
								index = index + 1;
								coord = coord.add(new paper.Point(0, padding));
								result.addChild(pos);
							}
							//result.insertAbove(shipMonitor);
							//console.log(result.children);
							return [result, coord];
						};
					};
		
					var box = null;
					//draw bounding box
					var closeButton = null;
					var drawBound = function(padding){
			
						box = new paper.Path.Rectangle(textArea.bounds, new paper.Size(10,10));
						box.strokeColor = '#aef704';
						box.fillColor = 'black';
						box.fillColor.alpha = 0.9;
			
						box.scale(1.2);
						//console.log(this.box.bounds.topRight);
						closeButton = new paper.Group();
						var Button = new paper.Path.Rectangle(
							box.bounds.topRight,
							new paper.Size(box.bounds.width/25, box.bounds.width/25)
						);
						var x1 = new paper.Path.Line(Button.bounds.topRight, Button.bounds.bottomLeft);
						var x2 = new paper.Path.Line(Button.bounds.topLeft, Button.bounds.bottomRight);
						x1.strokeColor = '#aef704';
						x2.strokeColor = '#aef704';
						//console.log(x1,x2);
						closeButton.addChildren([Button, x1, x2]);
						//this.closeButton.strokeColor = '#aef704';
						closeButton.fillColor = 'black';
						closeButton.position.x -= closeButton.bounds.width + box.bounds.width/30;
						closeButton.position.y += box.bounds.width/30;
			
						//set hierachy of all the desciprtion
						container.addChildren([box, closeButton]);
						closeButton.insertAbove(box);
						textArea.insertAbove(box);
			
						//onclick to remove the description box
						closeButton.onClick =  function(e){
							container.remove();
							//console.log(haloCursor)
							clickedHaloCursor.remove();
							lineToPlanet.remove();
							descBox = null;
					
							paper.view.off('frame', launchBtn.moveUp);
							paper.view.on('frame', launchBtn.moveDown);
						};
				
				
					};
					//draw lineTo planet
					function drawlineTo(){
						var lineStart;
						var lineMid;
						var lineEnd;
						if(destination == 'survival'){
							lineStart = new paper.Point(
								box.bounds.x, box.bounds.y + box.bounds.height/8
							);
							lineMid = new paper.Point(lineStart.x - monitorCanvas.width/20, lineStart.y);
							lineEnd = survival.lineEnd();
						
						} else {
							lineStart = new paper.Point(
								box.bounds.x + box.bounds.width, 
								box.bounds.y + box.bounds.height/8
							);
							lineMid = new paper.Point(lineStart.x + monitorCanvas.width/20, lineStart.y);
							lineEnd = shooting.lineEnd();
						}
						lineToPlanet = new paper.Path();
						container.addChild(lineToPlanet);
						lineToPlanet.add(lineStart);
						lineToPlanet.add(lineMid);
						lineToPlanet.add(lineEnd);
						lineToPlanet.strokeColor = '#aef704';
				
					};
			
			
					draw(text, starting, padding);
					drawBound(padding);
					drawlineTo();
			
			
		
				}
		
		
				// when currentPage is set to modeSelection
				//@param {string} user - this user's email
				//@param {Rectangle} canvas - shipMonitor.bounds
				function UserInfoText(user, canvas){
			
					var lineWidth = canvas.height/10;
					//set canvas for this area
					var userInfoArea = new paper.Rectangle(canvas.x, canvas.y, canvas.width. lineWidth);
					var pageInfoArea = new paper.Rectangle(canvas.x, canvas.y + lineWidth, canvas.width, lineWidth);
			
					//set content characters
					var font = 'Helvetica, arial, sans-serif';
					var fontColor = '#aef704';
			
					//for typing animation
					var currentText = ''; 
					var userInfoText = "Pilot ID: " + user;
					var index = 0;
					var done = 0;
			
					var userInfo = new paper.PointText(userInfoArea.x, userInfoArea.y);
					var pageInfo = new paper.PointText(pageInfoArea.x + monitor_w/2, pageInfoArea.y);
			
					var infoGroup = new paper.Group([userInfo, pageInfo]);
			
					//var textArea = new paper.PointText(new paper.Point(monitorEndLeft.x + monitor_h/10, 
					//	monitorUpperLeft.y + monitor_h/10));
					userInfo.fontSize = monitor_h/25;
					userInfo.fillColor = fontColor;
					userInfo.font = font;
			
					//TODO: hierarchy setup
					infoGroup.insertAbove(shipMonitor);
	
					//var missionTextArea = new paper.PointText(new paper.Point(monitorEndLeft.x + monitor_w/2,
					//	monitorUpperLeft.y + monitor_h * 2/10));
					//missionTextArea.position.x = monitorEndLeft.x + monitor_w/2;
					pageInfo.justification = 'center';
					pageInfo.fontSize = monitor_h/20;
					pageInfo.fillColor = fontColor;
					pageInfo.font = font;	
	
			
					this.typeAnimation = function(event){
						if(event.count == 60){
							currentText = userInfoText[index];
							userInfo.content = currentText + '_';
							index ++;
							//animateText(event, index, currentText);
						} else if(event.count > 60 && event.count % 5 == 0 && index < userInfoText.length){
		
							currentText = currentText + userInfoText[index];
							userInfo.content = currentText + '_';
							index ++;
							//animateText(event, index, currentText);
						} else if(index == userInfoText.length && done == 0){
							userInfo.content = currentText;
							done = event.count;
					
						} else if(done != 0 && event.count == (done + 60)) {
							pageInfo.content = "Select Your Destination";
							survival = new Planet('survival');
							shooting = new Planet('shooting');
							enableOrbit = true;
					
						} else if(enableOrbit == true){
							survival.animateOrbit();
							shooting.animateOrbit();
						}
					}
			
			
				}
		
		
				//for 'survival' mode ending scenario (infographic)
				//@param {boolean} status - whether the player succeed in mission completion or not
				//@param {Number} numStage - number of stage the player survived
				//@parma {ArrayList} numEnemy - [#enemies passed by, total # enemy]
				function infographicNav(status, numStage, numEnemy){
			
					//TODO: assign padding
					var padding = monitorCanvas.height/10; // TODO: represent height of each line for nav bar
					var outerContainer = new paper.Group();
					var resultContainer = new paper.Group(); //results 
					var statContainer = new paper.Group(); //stats
					statContainer.visible = false; //initial setup
					//for statistic bounds
					var innerBound = new paper.Rectangle({
						point: [monitorCanvas.x, monitorCanvas.y + padding * 3/2], //since its two lines of nav bar
						size: new paper.Size(monitorCanvas.width, monitorCanvas.height - 2 * padding)
					});
					var navText = ['Results','Stats'];
					var resultText = new paper.PointText({
						point: new paper.Point(monitorCanvas.x + padding/3, monitorCanvas.y + padding/3), 
						content: navText[0],
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/2
					});
			
					var statText = new paper.PointText({
						point: new paper.Point(
							resultText.bounds.topRight.x + padding/3, 
							monitorCanvas.y + padding/3
						), 
						content: navText[1],
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/2,
						opacity: 0.4
					});
			
					outerContainer.addChildren([resultText, statText]);
					outerContainer.insertAbove(shipMonitor);
					resultContainer.insertAbove(shipMonitor);
					statContainer.insertAbove(shipMonitor);
			
					/*
						======================================================
						result phase
					*/	
					var resultStatus = new paper.PointText({
						content: status ? 'Mission Complete' : 'Mission Failed',
						point: new paper.Point(
							monitorCanvas.x + monitorCanvas.width/2,
							monitorCanvas.y + padding * 3
						),
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: monitorCanvas.height/20,
						justification: 'center'
					});
			
					var s = new paper.PointText({
						content: 'You survived :',
						point: resultStatus.position.add(new paper.Point(0, 2 * padding)),
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/3,
						justification: 'center'
					});
					
					//TODO: need numStage and numEnemy from GLOBAL
					var stageData = new paper.PointText({
						content: numStage + ' waves out of 24',
						point: resultStatus.position.add(new paper.Point(0, padding * 5/2)),
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/3,
						justification: 'center'
					});
			
					var enemyData = new paper.PointText({
						content: numEnemy[0] + ' enemies out of ' + numEnemy[1] + 
							' (' + (numEnemy[0]/numEnemy[1]*100).toPrecision(3) + '%)',
						point: resultStatus.position.add(new paper.Point(0, padding * 3)),
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/3,
						justification: 'center'
					});
			
					var playAgainText = new paper.PointText({
						content: 'Play Again',
						point: enemyData.position.add(new paper.Point(-monitorCanvas.width/12, 2*padding)),
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/3,
						justification: 'center'
					});
					
					
					var playAgainButton = new paper.Path.Rectangle(playAgainText.bounds);
					playAgainButton.scale(2);
					playAgainButton.strokeColor = '#aef704';
					playAgainButton.strokeJoin = 'round';
			
					var plBtn = new paper.Group([playAgainButton, playAgainText]);
					plBtn.on('mouseenter', function(){
						this.firstChild.fillColor = '#aef704';
						this.lastChild.fillColor = 'black';
					});
					plBtn.on('mouseleave', function(){
						this.firstChild.fillColor = null;
						this.lastChild.fillColor = '#aef704';
					});
					
					//TODO: implement onclick events
					plBtn.on('click', function(){
						//TODO: currently it reloads /spacegame
						// find if any malfunction
						location.reload(true);
					})
			
			
					var logoutText = playAgainText.clone();
					logoutText.content = 'Logout'
					logoutText.position = playAgainButton.position.add(new paper.Point(monitorCanvas.width/5, 0));
					var logoutButton = new paper.Path.Rectangle(logoutText.bounds);
					logoutButton.scale(2);
					logoutButton.strokeColor = '#aef704';
					logoutButton.strokeJoin = 'round';
					var lgoBtn = new paper.Group([logoutButton, logoutText]);
					lgoBtn.on('mouseenter', function(){
						this.firstChild.fillColor = '#aef704';
						this.lastChild.fillColor = 'black';
					});
					lgoBtn.on('mouseleave', function(){
						this.firstChild.fillColor = null;
						this.lastChild.fillColor = '#aef704';
					});
					
					lgoBtn.on('click', function(){
						
						//TODO: currently it forces to localhost 
						location.assign('http://localhost:5001');
					})
			
					resultContainer.addChildren(
						[s, resultStatus, stageData, enemyData, plBtn, lgoBtn]
					);
			
					/*
						=====================================================
						stat phase
					*/
			
			
			
			
					var lineGraphText = new paper.PointText({
						content: 'Hourly',
						point: new paper.Point(monitorCanvas.x + padding/4, innerBound.y - padding/4), 
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/3
					});
					var lineGraphBox = new paper.Path.Rectangle(
						lineGraphText.bounds, 
						new paper.Size(lineGraphText.bounds.width/20,lineGraphText.bounds.width/20)
					);
					lineGraphBox.scale(1.6);
					lineGraphBox.strokeColor = '#aef704';
					lineGraphBox.strokeWidth = 2;
					var lineGraph = new paper.Group([lineGraphText, lineGraphBox]);
					lineGraphBox.removeSegments(0,1);
					lineGraphBox.removeSegments(6,7);
					lineGraphBox.closed = false;
			
			
					var calendarViewText = new paper.PointText({
						content: 'Monthly',
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/3
					});
					var calendarViewBox = new paper.Path.Rectangle(
						calendarViewText.bounds,
						new paper.Size(calendarViewText.bounds.width/20,calendarViewText.bounds.width/20)
					);
					var calendarView = new paper.Group([calendarViewText, calendarViewBox]);
					calendarViewBox.scale(1.6);
					calendarViewBox.strokeColor = '#aef704';
					calendarViewBox.strokeWidth = 2;
					calendarView.opacity = 0.4;
					calendarView.position.x = lineGraphBox.bounds.topRight.x + calendarViewBox.bounds.width/2;
					calendarView.position.y = lineGraphBox.bounds.topRight.y + calendarViewBox.bounds.height/2;
					calendarViewBox.closed = false;
					calendarViewBox.removeSegments(0,1);
					calendarViewBox.removeSegments(6,7);
			
					var bubbleChartText = new paper.PointText({
						content: 'Senders',
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/3
					});
					var bubbleChartBox = new paper.Path.Rectangle(
						bubbleChartText.bounds,
						new paper.Size(bubbleChartText.bounds.width/20,bubbleChartText.bounds.width/20)
					);
					var bubbleChart = new paper.Group([bubbleChartText, bubbleChartBox]);
					bubbleChartBox.scale(1.6);
					bubbleChartBox.strokeColor = '#aef704';
					bubbleChartBox.strokeWidth = 2;
					bubbleChart.opacity = 0.4;
					bubbleChart.position.x = calendarViewBox.bounds.topRight.x + bubbleChartBox.bounds.width/2;
					bubbleChart.position.y = calendarViewBox.bounds.topRight.y + bubbleChartBox.bounds.height/2;
					bubbleChartBox.closed = false;
					bubbleChartBox.removeSegments(0,1);
					bubbleChartBox.removeSegments(6,7);
			
					var division = new paper.Group();
					var division_s = new paper.Path.Line({
						from: [canvas.x, innerBound.y-4],
						to: [lineGraph.bounds.x+1, innerBound.y-4],
						strokeColor: '#aef704',
						strokeWidth: 4
					});
					/*
					division.add(
						[lineGraph.bounds.bottomRight.x+1, innerBound.y-4],
						[calendarView.bounds.bottomRight.x+1, innerBound.y-4],
						[bubbleChart.bounds.bottomRight.x+1, innerBound.y-4],
						[canvas.x + canvas.width, innerBound.y-4]
					);
					*/
					var division_l = new paper.Path.Line({
						from: [lineGraph.bounds.bottomLeft.x+1, innerBound.y-4],
						to: [calendarView.bounds.bottomLeft.x+0.5, innerBound.y-4],
						strokeColor: '#aef704',
						strokeWidth: 4,
						visible: false
					});
					var division_c = new paper.Path.Line({
						from: [calendarView.bounds.bottomLeft.x-0.5, innerBound.y-4],
						to: [bubbleChart.bounds.bottomLeft.x+1, innerBound.y-4],
						strokeColor: '#aef704',
						strokeWidth: 4,
						visible: true
					});
					var division_b = new paper.Path.Line({
						from: [bubbleChart.bounds.bottomLeft.x-1, innerBound.y-4],
						to: [bubbleChart.bounds.bottomRight.x, innerBound.y-4],
						strokeColor: '#aef704',
						strokeWidth: 4,
						visible: true
					});
			
					var division_e = new paper.Path.Line({
						from: [bubbleChart.bounds.bottomRight.x-1, innerBound.y-4],
						to: [canvas.x + canvas.width, innerBound.y-4],
						strokeColor: '#aef704',
						strokeWidth: 4
					});
					division.addChildren(
						[division_s, division_l, division_c, division_b, division_e]
					);
					
					//adjust svg's position according to current size of monitor
					var svg = document.getElementById('statSVG');
					svg.style.left = innerBound.x;
					svg.style.top = innerBound.y;
					
					
					lineGraph.on('click', function(){
						this.opacity = 1;
						calendarView.opacity = 0.4;
						bubbleChart.opacity = 0.4;
						division_l.visible = false;
						division_c.visible = true;
						division_b.visible = true;
				
						GameInfoDisplay.visualization(innerBound);
						
					});
					
					calendarView.on('click', function(){
						this.opacity = 1;
						lineGraph.opacity = 0.4;
						bubbleChart.opacity = 0.4
						division_c.visible = false;
						division_b.visible = true;
						division_l.visible = true;
				
						GameInfoDisplay.visCalenderView(innerBound);
				
					});
					
					bubbleChart.on('click', function(){
						this.opacity = 1;
						lineGraph.opacity = 0.4;
						calendarView.opacity = 0.4
						division_b.visible = false;
						division_c.visible = true;
						division_l.visible = true;
				
						GameInfoDisplay.visSenderBubble(innerBound);
					});
			
			
					statContainer.addChildren([division, lineGraph, calendarView, bubbleChart]);
			
			
			
			
					//draw result page
					var drawResultPage = function(){
						//turn off stat text
						
						statText.opacity = 0.4;
						resultText.opacity = 1;
						resultContainer.visible = true;
						statContainer.visible = false;
						var _svg = d3.select('#statSVG');
						//_svg.selectAll('*').remove();
						//document.getElementById('statSVG').style.display = 'none';
						svg.style.display = 'none';
				
				
						if(status){
							//animation for 'celebration'
						} else {
							//animation for 'destruction of ship'
						}
				
				
					};
					var first = true;
					var drawStatPage = function(){
						//turn off result text
						resultText.opacity = 0.4;
						statText.opacity = 1;
						resultContainer.visible = false;
						statContainer.visible = true;
						//document.getElementById('statSVG').style.display = '';
						svg.style.display = '';
						
						if(first){
							GameInfoDisplay.visualization(innerBound);
							first = false;
						}
					};
			
					resultText.on('click', drawResultPage);
					statText.on('click', drawStatPage);
				}
		
				//button allows player initiate game on selected mode 
				//@param {function} callback - fires getGameData with selected game mode
				function LaunchButton(callback){
					var launchButton = new paper.Path();; // launch button 
					var buttonText = new paper.PointText(); // text on button
					var frame = new paper.Path(); //frame over launch button
					var container = new paper.Group(); // Group includes button, text and frame
					//var btnContainer = new paper.Group();
					//btnContainer.addChildren([launchButton, buttonText]);
					container.insertAbove(shipMonitor);
					var initialPos; // container's y position when it is appeared
			
					this.draw = function(){
						//frame
						var ul = new paper.Point(
							monitorCanvas.x + monitorCanvas.width/4, 
							monitorCanvas.bottomLeft.y - monitorCanvas.height/10
						);
						var ll = new paper.Point(
							monitorCanvas.x - 10, 
							paper.view.size.height
						);
						var ur = new paper.Point(
							monitorCanvas.x + monitorCanvas.width * 3/4, 
							monitorCanvas.bottomLeft.y - monitorCanvas.height/10
						);
						var lr = new paper.Point(
							monitorCanvas.x + monitorCanvas.width + 10, 
							paper.view.size.height
						);
						frame.addSegments([ul, ur, lr, ll]);
						frame.closePath();
						frame.fillColor = '#77827c';
						//frame.strokeColor = '#505653';
						//frame.strokeWidth = 5;
						frame.strokeJoin = 'round';
						frame.shadowColor = 'black';
						frame.shadowOffset = new paper.Point(10,10);
						frame.shadowBlur = 30;
						//hiararchy setup
						container.addChild(frame);
						initialPos = container.bounds.y;
				
				
						//launchButton
				
						launchButton.addSegments([
							ul.add(new paper.Point(20,20)),
							ur.add(new paper.Point(-20,20)),
							lr.subtract(new paper.Point(frame.bounds.width/4, frame.bounds.height/2)),
							ll.add(new paper.Point(frame.bounds.width/4, -frame.bounds.height/2))
						]);
						container.addChild(launchButton);
				
						launchButton.fillColor = '#f70260';
						//launchButton.fillColor = 'black'
						launchButton.shadowColor = '#4f061e';
						launchButton.shadowOffset = new paper.Point(0,5);
						launchButton.shadowBlur = 10;
				
						//buttonText
						buttonText.position = launchButton.bounds.center.add(new paper.Point(0,launchButton.bounds.height/5));
						buttonText.justification = 'center';
						buttonText.content = 'PLAY';
						buttonText.fillColor = '#ffd400';
						buttonText.fontSize = container.bounds.height/6;
						container.addChild(buttonText);
				
				
						//push button controller beneath the scene
						container.position.y = paper.view.bounds.height + container.bounds.height/2;
						//console.log(paper.view.height)
					};
			
					launchButton.on('click', function(){
						callback(user, selected);
					});
			
					buttonText.on('click', function(){
						callback(user, selected);
					})
			
					//events when click mission planets
					this.moveUp = function(){
				
						if(container.bounds.y > initialPos){
							container.position.y -= 6;
						} 
				
					};
			
					this.moveDown = function(){
				
						if(container.position.y - container.bounds.height/2 < paper.view.bounds.height){
							container.position.y += 6;

						}
				
					}
			
				}
		
				
				// for 'shooting' mode ending scenario (label spams in mailbox)
				//	should I keep use socket io or post request to server?
				//  how to handle angularjs stuffs.. mainain it with separate module?
				//@param {function} callback - POST json of selected spam emails to server
				//								in order to label them as spam by gmail
				function spamDisposal(callback){
					//explanation section
					var padding = monitorCanvas.height/10;
					
					var container = new paper.Group();
					container.insertAbove(shipMonitor);
					
					//TODO: innerBound should contain enemy spam imgs
					var innerBound = new paper.Rectangle({
						point: [monitorCanvas.x, monitorCanvas.y + padding * 3/2], //since its two lines of nav bar
						size: new paper.Size(monitorCanvas.width,  padding * 2/3)
					});
					var expText = new paper.PointText({
						point: new paper.Point(monitorCanvas.x + padding/3, monitorCanvas.y + padding/3), 
						content: "Enemy Spams you've captured",
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/2
					});
					container.addChild(expText);
					
					//var canvas = document.getElementById('spamCanvas');
					var spamUL = document.getElementById('spamListDiv');
					
					spamUL.style.left = innerBound.bottomLeft.x + 'px';
					spamUL.style.top = innerBound.bottomLeft.y + (padding/3) + 'px';
					spamUL.style.width = innerBound.width/2 + 'px';
					spamUL.style.height = monitorCanvas.height - innerBound.height - (padding * 3.5) + 'px'//  + padding * 1.5 + 'px';
					spamUL.style.fontSize = 'small';
					
					var submitText = new paper.PointText({
						content: 'Move to Trash',
						point: new paper.Point(
							monitorCanvas.x + monitorCanvas.width/2, 
							monitorCanvas.bottomRight.y - padding
						),
						fillColor: '#aef704',
						font: 'Helvetica, arial, sans-serif',
						fontSize: padding/3,
						justification: 'center'
					});
					
					
					var submitButton = new paper.Path.Rectangle(submitText.bounds);
					submitButton.scale(2);
					submitButton.strokeColor = '#aef704';
					submitButton.strokeJoin = 'round';
					
					var sbmBtn = new paper.Group([submitButton, submitText]);
					sbmBtn.insertAbove(shipMonitor);
					sbmBtn.on('mouseenter', function(){
						this.firstChild.fillColor = '#aef704';
						this.lastChild.fillColor = 'black';
					});
					sbmBtn.on('mouseleave', function(){
						this.firstChild.fillColor = null;
						this.lastChild.fillColor = '#aef704';
					});
					
					var tCanPos = new paper.Point(
						monitorCanvas.bottomLeft.x + monitorCanvas.width/2, 
						monitorCanvas.bottomLeft.y - padding
					);
					//TODO: 'pixelize' this image 
					tCan = new paper.Raster(
						'images/trashCan.png',
						tCanPos
					);
					tCan.size = new paper.Size(monitorCanvas.width/30, monitorCanvas.height/30);
					tCan.scale(0.5);
					tCan.visible = false;
					tCan.insertAbove(shipMonitor);
					
					function endMessage(numSpam){
						var resultContainer = new paper.Group();
						resultContainer.insertAbove(shipMonitor);
						
						var resultStatus = new paper.PointText({
							content: 'Game Over',
							point: new paper.Point(
								monitorCanvas.x + monitorCanvas.width/2,
								monitorCanvas.y + padding * 3
							),
							fillColor: '#aef704',
							font: 'Helvetica, arial, sans-serif',
							fontSize: monitorCanvas.height/20,
							justification: 'center'
						});
			
						var s = new paper.PointText({
							content: '',
							point: resultStatus.position.add(new paper.Point(0, 2 * padding)),
							fillColor: '#aef704',
							font: 'Helvetica, arial, sans-serif',
							fontSize: padding/3,
							justification: 'center'
						});
					
						//TODO: need numStage and numEnemy from GLOBAL
						var stageData = new paper.PointText({
							content: 'You have labeled ' + numSpam + ' emails as spam',
							point: resultStatus.position.add(new paper.Point(0, padding * 5/2)),
							fillColor: '#aef704',
							font: 'Helvetica, arial, sans-serif',
							fontSize: padding/3,
							justification: 'center'
						});
			
						var enemyData = new paper.PointText({
							content: 'Please check your mailbox',
							point: resultStatus.position.add(new paper.Point(0, padding * 3)),
							fillColor: '#aef704',
							font: 'Helvetica, arial, sans-serif',
							fontSize: padding/3,
							justification: 'center'
						});
			
						var playAgainText = new paper.PointText({
							content: 'Play Again',
							point: enemyData.position.add(new paper.Point(-monitorCanvas.width/12, 2*padding)),
							fillColor: '#aef704',
							font: 'Helvetica, arial, sans-serif',
							fontSize: padding/3,
							justification: 'center'
						});
					
					
						var playAgainButton = new paper.Path.Rectangle(playAgainText.bounds);
						playAgainButton.scale(2);
						playAgainButton.strokeColor = '#aef704';
						playAgainButton.strokeJoin = 'round';
			
						var plBtn = new paper.Group([playAgainButton, playAgainText]);
						plBtn.on('mouseenter', function(){
							this.firstChild.fillColor = '#aef704';
							this.lastChild.fillColor = 'black';
						});
						plBtn.on('mouseleave', function(){
							this.firstChild.fillColor = null;
							this.lastChild.fillColor = '#aef704';
						});
					
						//TODO: implement onclick events
						plBtn.on('click', function(){
							//TODO: currently it reloads /spacegame
							// find if any malfunction
							location.reload(true);
						})
			
			
						var logoutText = playAgainText.clone();
						logoutText.content = 'Logout'
						logoutText.position = playAgainButton.position.add(new paper.Point(monitorCanvas.width/5, 0));
						var logoutButton = new paper.Path.Rectangle(logoutText.bounds);
						logoutButton.scale(2);
						logoutButton.strokeColor = '#aef704';
						logoutButton.strokeJoin = 'round';
						var lgoBtn = new paper.Group([logoutButton, logoutText]);
						lgoBtn.on('mouseenter', function(){
							this.firstChild.fillColor = '#aef704';
							this.lastChild.fillColor = 'black';
						});
						lgoBtn.on('mouseleave', function(){
							this.firstChild.fillColor = null;
							this.lastChild.fillColor = '#aef704';
						});
						//TODO: implement onclick events
						lgoBtn.on('click', function(){
							//TODO: currently it forces to localhost 
							location.assign('http://localhost:5001');
						})
			
						resultContainer.addChildren(
							[s, resultStatus, stageData, enemyData, plBtn, lgoBtn]
						);
					}
					
					//spam labeling process
					//angularjs module bootstrapping
					angular.module('spamCheckApp', [])
						.controller('spamController', ['$scope', '$document', '$http', 
						function($scope, $document, $http){
					
					
					
						var captured = [];
						var emailList = this;
						//console.log(captured);
						
						//initial draw of those captured
						GLOBAL.CAPTURED.forEach(function(d){
							
							var x = getRandomLoc(innerBound.x, innerBound.topRight.x-innerBound.width/20);
							var y = getRandomLoc(innerBound.y, innerBound.bottomRight.y);
							var enemy = new paper.Raster(
								'images/enemy_'+ d.color + '.png',
								new paper.Point(x,y)
							);
							enemy.size = new paper.Size(monitorCanvas.width/25, monitorCanvas.height/25);
							container.addChild(enemy);
							captured.push(enemy);
						});
						
						
						//mapping captured list into objs with new porperties 
						emailList.emails = GLOBAL.CAPTURED.map(function(obj){
							var resObj = {};
							resObj['text'] = obj.text;
							resObj['date'] = obj.date;
							resObj['exclude'] = false;
							resObj['user'] = GLOBAL.EMAIL;
							
							return resObj;
						});
						
						
						//watch emails list whenever changes occur and update canvas correspondingly
						$scope.$watch('emailList.emails', function(newValue, oldValue){
							
							newValue.forEach(function(d, index){
								if(d.exclude == true){
									captured[index].visible = false;
									
								} else{
									captured[index].visible = true;
								}
							});
							
						}, true);
						
						
						
						//helper function for getting appropriate canvas elt location
						function getRandomLoc(min, max) {
						  return Math.floor(Math.random() * (max - min)) + min;
						}
						
						//return filtered spam list as json
						function finalize(){
							var finalEmails = emailList.emails.filter(function(email){
								return email.exclude == false;
							});
							
							return angular.toJson(finalEmails);
						}
						
						//calculate dx dy for animation for each enemy raster
						//@param {list} spamEnemies - list of raster item of each enemy
						function calcSpamDist(spamEnemies){

							var spamCoords = [];
							var dest = {x: tCan.position.x , y: tCan.position.y - tCan.bounds.height/3};
							spamEnemies.forEach(function(spamElt){
								
								var calc = {
									dx: (dest.x - spamElt.position.x)/180,
									dy: (dest.y - spamElt.position.y)/180,
									elt: spamElt
								}
								spamCoords.push(calc);
							});
							
							return spamCoords;
						}
						
						//http post requeset handler
						function postResult(spamJson, successCB, errorCB){
							$http({
								method: 'POST',
								url: '/stats.json?id=postSpamData',
								headers: {
									'Content-Type': 'application/json'
								},
								data: spamJson
							}).then(successCB, errorCB);
						}
						
						//onclick event for spam labeling
						//TODO: double check user's intend to label emails as spam
						// popup 
						sbmBtn.on('click', function(){
							
							var result = finalize();
							
							//TODO: post json(result) to server
							postResult(result, 
								function(success){ console.log(success); },
								function(error){ console.log(error); }
							)
							
							
							this.visible = false;
							expText.content = 'Labeling these emails as spam in your mailbox...'
							spamUL.style.display = 'none';
							tCan.visible = true;
							
							
							
							var delta = calcSpamDist(captured);
							moveSpams(delta, endMessage);
							
							function moveSpams(spamEnemies, callback){
								
								//counter for stop interval after 3 secs
								var flag = 0;
								var id = window.setInterval(function(){
									if(flag == 180){
										//stop interval
										clearInterval(id);
										//make enemy img invisible
										spamEnemies.forEach(function(d){
											d.elt.visible = false;
										});
										//make explanation text & tCan invisible 
										expText.visible = false;
										tCan.visible = false;
										//TODO: handle game over message box
										callback(spamEnemies.length);
									} 
									else {
										//move each enemy by its delta amount
										spamEnemies.forEach(function(d){
											d.elt.position.x += d.dx;
											d.elt.position.y += d.dy;
											
										});
										flag++;
									}
									
								}, 1000 / 60);
							};
							
						});
						
					}]);
					//bootstrap angular app to div spamCheckApp
					angular.element(function(){
						angular.bootstrap(document, ['spamCheckApp']);
					});
				
				}
				
				
				//draw monitor contents based on current page
				this.draw = function(){
					if(currentPage == 'modeSelection'){
						var intro = new UserInfoText(user, monitorCanvas);
						launchBtn = new LaunchButton(cb);
						launchBtn.draw();
				
						//register animation
						paper.view.on('frame', function(e){
							intro.typeAnimation(e);
					
						})
				
				
					} else if(currentPage == 'resultSection'){ //in case when currentPage is statMode
						//check whether player cleared all stages
						var st = (GLOBAL.GAMEHOUR > GLOBAL.ENDCOUNT - 1) ? true : false; 
						var numS = (GLOBAL.GAMEHOUR + 1); //num waves up to now 
						var numE = GLOBAL.ENEMYSUM; //num enemies up to now
						var numT = 0; //num total enemies
						//calculate total enemies number
						for(var i = 0; i < Object.keys(GLOBAL.INCOMINGEMAILDATA).length; i++){
							var key = Object.keys(GLOBAL.INCOMINGEMAILDATA)[i];
							numT += GLOBAL.INCOMINGEMAILDATA[key].length;
						};
						var info = new infographicNav(st, numS, [numE, numT]);
					
					} else if(currentPage == 'spamSection'){
						//TODO: put callback for post to server
						var spamS = new spamDisposal(null);
					}
				}		
			}
	
	
	
	
			/*
				===============================================================
				space layer
			*/
	
			//outer space layer, rendering space travel
			var spaceLayer = new paper.Layer();
	
			//place space layer behind the cockpit layer
			paper.project.layers[0].insertAbove(spaceLayer);
			//console.log(paper.project.layers)
	
			canvas_width = paper.view.size.width;
			canvas_height = paper.view.size.height/2;
	
			//set the origin of light lines
			var center = new paper.Point(canvas_width/2, canvas_height/3);

			//create new light lines
			var lineIndex = 0;
			var lineList = [];
			function createLine(){
		
				for(var i = 0; i < 10; i++){
				    var vector = new paper.Point(Math.random()* canvas_width, Math.random() * canvas_height);
				    var lightLine = new paper.Path(center, vector);
				    var angle = getAngle(lightLine);
				    var lineObj = {line: lightLine, angle: angle, first: true, initialPos: lightLine.position};
					lightLine.data = lineObj;
					lightLine.strokeColor = '#babbc1';
					lightLine.strokeColor.alpha = 0.5;
				    lightLine.scale(0.2);
					lineIndex ++;
					lineList.push(lightLine);
				}
			}
	
	
			//calculate angle around center
			function getAngle(line){
    
			    var rad =  Math.asin(line.bounds.height / line.length);
			    var lineX = line.lastSegment.point.x; 
			    var lineY = line.lastSegment.point.y;
		
			    //case for each quadrant..   
			    if(lineX > center.x && lineY < center.y){
			        return rad;
			    } else if(lineX < center.x && lineY < center.y){
			        return Math.PI - rad;
			    } else if(lineX < center.x && lineY > center.y){
			        return Math.PI + rad;
			    } else if(lineX > center.x && lineY > center.y){
			        return Math.PI*2 - rad;
			    }
			}

			//animate movement of lines
			// TODO: add speed 
			function moveLine(ln){
				var lineObj = ln.data;
		
				//
				lineObj.line.position.x += 3 * Math.cos(lineObj.angle);
			    lineObj.line.position.y -= 3 * Math.sin(lineObj.angle);
			
			}
	
			//relocate each line to initial position when out of bound
			function checkAlive(ln){
				var lineObj = ln.data;
		
				if(lineObj.line.firstSegment.point.x < 0 || 
						lineObj.line.firstSegment.point.x > canvas_width ||
						lineObj.line.firstSegment.point.y > canvas_height ||
						lineObj.line.firstSegment.point.y < 0){
			
					lineObj.line.position.x = lineObj.initialPos.x;
					lineObj.line.position.y = lineObj.initialPos.y;
			
				}
		
			}
	
			//instantiate Monitor Obj
			//var MONITOR = new Monitor(user, shipMonitor.bounds, 'modeSelection', null);
			var MONITOR = new Monitor(user, shipMonitor.bounds, current, cb);
			MONITOR.draw();
	
			//number of light lines
			var count = 300;
	
			//console.log(paper.project.activeLayer.children)
	
			paper.view.onFrame = function(e){

				//var num = paper.project.activeLayer.children.length;
				for(var i = 0; i<lineList.length; i++){
					//var item = paper.project.activeLayer.children[i];
					var item = lineList[i];
					moveLine(item);
					checkAlive(item);
					
				}
		
				//draw light lines 10 at a time
			  	if(e.count % 10 == 1){
					if(lineIndex < count){
						createLine();
					}
	  	  	
		
			 	 };
		 
	 	
				//animateStep(e, data);
		
		
			}
	
	
			paper.view.draw();
	
			}
		}
	});
