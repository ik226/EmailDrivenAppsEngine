
//A module definition requires globals
//use:
define(["globals", "./utils"], function (GLOBAL, Utils) {
	"use strict"
	//for shooting mode: get start date
	var getStartDate = function(){
		var startIndex = Object.keys(GLOBAL.INCOMINGEMAILDATA)[0];
		return new Date(GLOBAL.INCOMINGEMAILDATA[startIndex][0].date);
	};
	//get current time(current wave) for gameinfo 
	var currentTime = function(){ 
		//when survival mode
		if(GLOBAL.GAMEMODE == 'alldirection'){
			return Utils.UTCHourToLocalHour(GLOBAL.GAMEHOUR); 
		}
		//when shooting mode
		var start = getStartDate();
		start.setDate(start.getDate() + GLOBAL.GAMEHOUR);
		var options = {year:'numeric', month: 'short', day:'numeric'};
		
		return start.toLocaleString('en-US', options);
	};
	//generate first splash messsage for shooting(leftrightonly) mode
	var firstSplashMsg = function(){
		
		//var msg = "This Wave: ";
		//var _msg = GLOBAL.GAMEMODE == 'alldirection' ?  Utils.UTCHourToLocalHour(GLOBAL.GAMEHOUR) : getStartDate().getDate();
		var start = getStartDate();
		var options = {year:'numeric', month: 'short', day:'numeric'};
		var _msg = start.toLocaleString('en-US', options);
		return "This Wave: " + _msg;
	}
	var firstSplashInfo = {
		counter: 1.5 * GLOBAL.FPS, 
		message: "This Wave: " + Utils.UTCHourToLocalHour(GLOBAL.GAMEHOUR)
	};
	//count emeny defeated
	var defeatedCount = function(){
		return GLOBAL.DEFEAT;
	};
	//calculate number of enemies in current time interval; if it is empty return 0
  	var numEnemy = function(){
		//console.log(GLOBAL.INCOMINGEMAILDATA[GLOBAL.GAMEHOUR])
		if (GLOBAL.INCOMINGEMAILDATA === undefined || GLOBAL.INCOMINGEMAILDATA[GLOBAL.GAMEHOUR] === undefined) { return 0; }
		return GLOBAL.INCOMINGEMAILDATA[GLOBAL.GAMEHOUR].length;
	}
	//should we have same logic for empty bullet? currently, returns empty list when theres no bullet
	var numBullet = function(){
		if(GLOBAL.OUTGOINGEMAILDATA === undefined || GLOBAL.OUTGOINGEMAILDATA[GLOBAL.GAMEHOUR] === undefined) { return 0; }
		return GLOBAL.OUTGOINGEMAILDATA[GLOBAL.GAMEHOUR].length;
	}
	
	return {
		//special case for shooting/leftrightonly/spam mode
		setFirstSplashInfo: function(){
			var m = firstSplashMsg();
			this._splashInfo = {counter: 1.5 * GLOBAL.FPS, message: m}
		},
		
    	_splashInfo: firstSplashInfo, //{counter: 0, message: ""},
		
		draw : function () {
      		if(this._splashInfo.counter>0){
				var temp = GLOBAL.CANVAS.fillStyle;
				GLOBAL.CANVAS.fillStyle = "#990";
				GLOBAL.CANVAS.font = "50px Arial";
          	  	var txt = this._splashInfo.message;
          	  	var width = GLOBAL.CANVAS.measureText(txt).width;
          		var height = 50;
          	  	GLOBAL.CANVAS.fillText(txt, GLOBAL.CANVAS_WIDTH / 2 - width/2, GLOBAL.CANVAS_HEIGHT / 2 - height/2);
          	  	//GLOBAL.CANVAS.fillText("This HOUR: " + edttime + " EDT", 10, 50);
          		GLOBAL.CANVAS.fillStyle = temp;
				
				
				
      	  	};
   
      	  	//this should not be here?? 
      	  	//if no exist, create empty array  so .length in next code block is valid.
			/*
      	  	if(GLOBAL.OUTGOINGEMAILDATA[GLOBAL.GAMEHOUR]==undefined){
        		GLOBAL.OUTGOINGEMAILDATA[GLOBAL.GAMEHOUR]=[];
        		console.log('outoging email is empty, so no bullet')
      	  	}
			*/
      	  	var temp = GLOBAL.CANVAS.fillStyle;
			
			
			GLOBAL.CANVAS.fillStyle = "#990";
      	  	
			//player dashboard: bullet and life
			if(GLOBAL.GAMEMODE == 'alldirection'){
				GLOBAL.CANVAS.font = "20px Arial";
				GLOBAL.CANVAS.fillText("Bullets Remaining: " + numBullet(), 
					10, GLOBAL.CANVAS_HEIGHT - 30);
				GLOBAL.CANVAS.fillText("Life Remaining: " + GLOBAL.LIFE, 10, GLOBAL.CANVAS_HEIGHT - 50);
			}
      	  	GLOBAL.CANVAS.font = "13px Arial";
			//enemy number is now fixed
			GLOBAL.CANVAS.fillText("Enemy Number: " + numEnemy(), 
				GLOBAL.CANVAS_WIDTH - 150, 50);
      	  	GLOBAL.CANVAS.fillText("Current Wave: " + currentTime(), GLOBAL.CANVAS_WIDTH - 150, 90);
			//enemy defeated count
			GLOBAL.CANVAS.fillText("Enemy Defeated: " + defeatedCount(), GLOBAL.CANVAS_WIDTH - 150, 70);
			//GLOBAL.CANVAS.fillText("this is temp", GLOBAL.CANVAS_WIDTH - 150, 40);
			
			GLOBAL.CANVAS.fillStyle = temp;
			//add time being played
			
		},
		
    	update: function() {
      	  	if(this._splashInfo.counter>0){
        		this._splashInfo.counter--;
      	  	}
			
    	},
		
    	hourSplash: function() {
      	  	var duration= 1.5; //in seconds
      	  	var counter = duration * GLOBAL.FPS;
      	  	//var message = "Next Wave: " + Utils.UTCHourToLocalHour(GLOBAL.GAMEHOUR);
			var _message = GLOBAL.GAMEMODE == 'alldirection' ? Utils.UTCHourToLocalHour(GLOBAL.GAMEHOUR) : currentTime();
			var message = "This Wave: " + _message;
      	  	this._splashInfo = {counter: counter, message: message};
    	},
		
		visualization: function(canvas){
			//set svg with width and height
			var svg = d3.select('#statSVG');
			svg.attr('width', canvas.width).attr('height', canvas.height);
			//var svg = _svg;
			//reset the canvas
			svg.selectAll('*').remove();
			
			var margin = {top: 20, right: 50, bottom: 30, left: 50},
				width = +svg.attr('width') - margin.left - margin.right,
				height = +svg.attr('height') - margin.top - margin.bottom;
			
			var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
			
			//x and y scale with range
			var x = d3.scaleLinear().range([0, width]);
			var y = d3.scaleLinear().range([height, margin.top]);
			
			//axes
			var xAxis = d3.axisBottom(x).tickSizeOuter([0]);//.tickArguments([d3.timeHour.every(1)]);
			var yAxis = d3.axisRight(y).tickSize(width);
			
			//line graph
			var line = d3.line().x(function(d){ return x(d.time); }) // ordinal scale
					.y(function(d){ return y(d.numMails); }); //size of each object
			
		
			//data processing 
			var rawdata = GLOBAL.INCOMINGEMAILDATA;
			var data = [];
			
			for(var i=0; i<24; i++){
				var newObj = new Object();
				if(!rawdata[i]){ newObj.numMails = 0; }
				else{ newObj.numMails = rawdata[i].length; }
				newObj.time = i+1;
				data.push(newObj);
			}
			
			//x and y domain
			x.domain(d3.extent(data, function(d) { return d.time; }));
			y.domain([0, d3.max(data, function(d){ return d.numMails; }) ]);
			
			//call axes
			g.append('g')
				.attr('transform', 'translate(0,' + height + ')')
				.call(customXAxis);
		
			g.append('g')
				.call(customYAxis);
		
			function customXAxis(g){
				g.call(xAxis);
				g.select('.domain').attr('stroke','#aef704').attr('stroke-width', 3).attr('fill','none');
				g.select('.xAxisLine').style('stroke', '#aef704')//.style('fill','none');
				//g.attr("transform", "translate(0," + height + ")");
				//g.attr('stroke', '#aef704');
				g.selectAll('.tick text').attr('x',0).attr('dy',2).attr('fill', '#aef704').attr('font-size', 10);
			}
			
			function customYAxis(g){
				g.call(yAxis);
				g.select('.domain').remove();
				g.selectAll('.tick:not(:first-of-type) line').attr('stroke', '#6f9654').attr('stroke-dasharray', '2.2');
				g.selectAll('.tick text').attr('x',0).attr('dy',-1.5).attr('fill', '#aef704').attr('font-size', 10);
			} 
		
			//draw line graph
			g.append("path").datum(data)
				.attr("class","line")
				.attr("d",line(data[0]))
				.style("fill","none").style("stroke","#aef704")
				.transition()
				.duration(2400).attrTween('d', pathInterpolate);
			
			//y axis label
			g.append('text')
				.attr('class', 'svgfont')
				.attr('transform','rotate(-90)')
				.attr('y', 0 - 20)
				.attr('x', 0 - (height/2))
				.attr('dy', '1em')
				.style('text-anchor', 'middle').style('font-size',15).style('fill',"#aef704")
				.text('Number of emails');
			
			//x axis label
			g.append('text')
				.attr('class', 'svgfont')
				.attr('transform', 'translate(' + (width/2) + ',' + (height + 25) + ')')
				.style('text-anchor', 'middle').style('font-size',15).style('fill',"#aef704")
				.text('Hour');
			
			
			
			
			function pathInterpolate(){
				var interpolate = d3.scaleQuantile().domain([0,1]).range(d3.range(1,data.length+1));
				return function(t){
					return line(data.slice(0, interpolate(t)));
				}
			}
				
			
		},
		
		visOutgoing: function(page){
			var svgDiv = document.createElement('div')//.setAttribute('class','svgDiv');
			page.appendChild(svgDiv);
			var margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = 500 - margin.left - margin.right,
				height = 300 - margin.top - margin.bottom;
			
			var x = d3.scale.linear().range([margin.left, width]);
			var y = d3.scale.linear().range([height, 0]);
			var xAxis = d3.svg.axis().scale(x).orient("bottom");
			var yAxis = d3.svg.axis().scale(y).orient("left");
			var line = d3.svg.line().x(function(d){return x(d.time); }) // ordinal scale
					.y(function(d){ return y(d.numMails); }); //size of each object
			//page.append('svg');
			//console.log(d3.select('svgDiv'));
			//console.log(d3.select('#gamePage'));
			var svg = d3.select("#gamePage").append("svg")
					.attr("width", width + margin.left+margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform", "translate("+margin.left+","+margin.top+")");
			svg.append("rect").attr("width","100%").attr("height","100%").attr("fill","white");
			
			var rawdata = GLOBAL.OUTCOMINGEMAILDATA;
			//console.log(rawdata);
			var data = [];
			
			for(var i=0; i<24; i++){
				var newObj = new Object();
				newObj.numMails = 0
				
				newObj.time = i+1;
				
				data.push(newObj);
			}
			//console.log(data);
			/*
			rawdata.forEach(function(d,i){
				data.time = i;
				data.entry = d;
			});
			*/
			x.domain(d3.extent(data, function(d) { return d.time; }));
			y.domain(d3.extent(data, function(d){ return d.numMails; }));
			svg.append("g").attr("class","xAxis").attr("transform", "translate("+ 0+"," + height + ")")
			.call(xAxis).style("fill","none").style("stroke","black");
			svg.append("g")
  		  	.attr("class", "y axis").attr("transform", "translate(" + margin.left+"," +0 +")")
  		  	.call(yAxis).style("fill","none").style("stroke","black");
			//svg.append("g").attr("class", "yAxis").call(yAxis)
			svg.append("path").datum(data).attr("class","line").attr("d",line).style("fill","none").style("stroke","black");
		},
		
		
		//bubble chart that maps num of messages from each sender into bubbles
		visSenderBubble: function(canvas){
			
			var svg = d3.select('#statSVG');
			svg.attr('width', canvas.width).attr('height', canvas.height);
			//reset the canvas
			svg.selectAll('*').remove();
			
			var margin = {top: 10, right: 20, bottom: 10, left: 20},
				width = +svg.attr('width') - margin.left - margin.right,
				height = +svg.attr('height') - margin.top - margin.bottom;
			
			var g = svg.append('g').attr('class','canvasG')
				//.attr('pointer-events', 'all')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
			
			
			
		  	//processing incoming email data to be used later by d3.hierarchy
		  	var data = [];
		  	var rawdata = GLOBAL.INCOMINGEMAILDATA;
		  
		  	var counterObj = {};
		  	//count number of emails to each recipient and store it inside counterObj
	      	for (var j = 0; j  < 24 ; j ++ ) {
				if(rawdata[j]){
	      			for ( var k = 0 ; k < rawdata[j].length; k ++ ) {


	            		if (!counterObj[rawdata[j][k].from] ) {
	                	  counterObj[rawdata[j][k].from] = 1;
	            	 	}
	            	  	else {
						  counterObj[rawdata[j][k].from] ++ ; 
					  	}
	         	 	}
			 	}
	      	}

		  	// convert counterObj to list so that it aptly handled by d3.hierarchy
		  	// [{ 'sender address': num}. {}, {}, ...]
		  	var childrenList = [];	
			for (var key in counterObj ) {
	        	var val = counterObj[key] ;
	          	var finalObj = {} ;
	          	finalObj.key = key ;
	          	finalObj.val  = val ;
	          	childrenList.push(finalObj);

	      	}

		 	//put childrenList into d3.hierarchy acceptable form 
	     	var newnode = {parent : "node" , children : childrenList} ;
	     	var d3nodes = d3.hierarchy(newnode) ;
	     	var pack = d3.pack().size([width,height]).padding(2.0) ;
	     	var roots = d3nodes.sum(function(d){return d.val}) ;

		 	//create hierarchy of nodes, each node represents area for the circle
	     	var hierarchynode = g.selectAll('.node').data(pack(roots).leaves()).enter().append('g')
	                        .attr('class','node')
	                        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	   	
		 	//append circle to each node in hierarchy
	     	hierarchynode.append("circle")
	                .attr("r", 0)//function(d){ return d.r; })
	                .style("stroke", function(d){ return "#c170ff"; })
		 			.style('stroke-width', function(d){ return '#c170ff'; })
		 			.style('fill', function(d){ return '#000000'; })
		 			.transition().duration(1500).attr('r', function(d){ return d.r; })//.on('end', appendText);
		
			//register mouseover events to each circle 			
			d3.selectAll("circle").on("mouseover", function(){
						//increase radius of this circle by 1.5 times
						d3.select(this).transition().duration(550).attr('r', function(d){ return 1.5 * d.r; });
						//bring this circle above the other circles in main g
						d3.select(this.parentNode).raise();
	                })
	                .on("mouseout", function(){
	                  d3.select(this).transition().duration(550).attr('r',function(d){ return d.r; })
	                });
					
					
		
		
	    	hierarchynode.append("text")
	         //.attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })

	        //.attr("x", 0)//function(d){return d.x})
	        //.attr("y", 0)
	        .attr("x",0)
	        .text(function(d) { return d.data.key; })
	        //.style("font-size", function(d) { return Math.min(2* d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "px"; })
	        .style('font-size', 2)
			.attr("dy", ".35em").style('text-anchor','middle')
	        .style('fill', "#000000").transition().duration(1550).style('fill',"#c170ff")
			//.style('font-size', 2).style('text-anchor','middle');
			//}
	   	 
		//smooth area translation to left when mouse over, so that provides space for additional info box on right
		//for UX, move overall circle cluster to left so that info screen gets space
		//TODO: make it work
		/*
		g.append('rect')
					.attr('class','screenDomain')
					.style('fill','#000000')
					.style('visibility','hidden')
					.attr('x',0).attr('y',0).attr('width',400).attr('height',250);		
 
			console.log(d3.select('.screenDomain'));

			d3.select('.screenDomain').on('mouseover', function(){
				console.log('mouse over canvasG');
				g.transition().duration(750).attr('transform', 'translate(' + (margin.left - 40) + ',' + margin.top + ')');
	
			})
			.on('mouseout', function(){
				g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
			})
		*/
		},
		
		//calender view for a email data
		visCalenderView: function(canvas){
			
			var svg = d3.select('#statSVG');
			svg.attr('width', canvas.width).attr('height', canvas.height)
			//svg.attr('width',400).attr('height',255);
			//reset the canvas
			svg.selectAll('*').remove();
			
			var margin = {top: 30, right: 50, bottom: 50, left: 65},
				width = +svg.attr('width') - margin.left - margin.right,
				height = +svg.attr('height') - margin.top - margin.bottom;
			
			var g = svg.append('g').attr('class','canvasG')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
			
			//maximum diameter for each circle
			var cellSize = canvas.height/6;
			
			//console.log(cellSize);
			
			
			//data process
			var rawdata = GLOBAL.INCOMINGEMAILDATA;
			//remove key(hour)s and put all values inside one list
			var allEmail = [];
			for(var hour in rawdata){
				//console.log(hour);
				rawdata[hour].forEach(function(d){
					allEmail.push(d);
				});
			};
			var format = d3.timeFormat('%Y-%m-%d');
			
			var counterData = d3.nest().key(function(d){ return format(new Date(d.date)); }).sortKeys(d3.ascending)
				.rollup(function(leaves){ return leaves.length; })
				.entries(allEmail);
			
			//dash line bounding each date in calender
			var rect = g.selectAll('rect').data(d3.range(0,35)).enter().append('rect')
				.attr('class','day-grid')
				.attr('width', cellSize)
				.attr('height', cellSize)
				.attr('x', function(d){ return (d % 7) * cellSize })
				.attr('y', function(d){ return Math.floor(d/7) * cellSize; })
				.attr('stroke', '#fbfcae').attr('stroke-dasharray', '1,5').attr('stroke-width','0.5');
			
			
			
			var radius = d3.scaleLinear().domain([0, d3.max(counterData, function(d){ return d.value; })]).range([0, cellSize * 0.55]);
			//console.log(d3.extent(counterData, function(d){ return d.value; }));
			//console.log(counterData);
			var initDate = counterData[0].key;	
			
			//append date text
			g.selectAll('calendar-text')
				.attr('class', 'svgfont')
				.data(counterData).enter().append('text')
				.attr('x', function(d){ return getX(new Date(d.key), cellSize) + (cellSize/20); })
				.attr('y', function(d){ return getY(new Date(initDate), new Date(d.key), cellSize) + (cellSize/6); })
				.attr('font-size', 12)
				.attr('fill', '#fbfcae')
				.text(function(d, i){ return dateText(d.key, i); });
			
			//draw circle representing number of emails received on each day
			g.selectAll('circle')
				.data(counterData).enter().append('circle')
				.attr('cx', function(d){ return getX(new Date(d.key), cellSize) + (cellSize/2); })
				.attr('cy', function(d){ return getY(new Date(initDate), new Date(d.key), cellSize) + (cellSize/2); })
				.attr('r', 0).transition().duration(1400)
				.attr('r', function(d){ return radius(d.value); })
				.attr('stroke', '#66cdf9');
			//.attr('fill','#66cdf9');
			
			function dateText(date, index){
				
				var convert = new Date(date);
				var result = convert.getDate();
				if(convert.getDate() == 1){
					result = (convert.getMonth()+1) + '/' +convert.getDate(); 
				} else if(index == 0){
					result = (convert.getMonth()+1) + '/' +convert.getDate(); 
				}
				return result;
			}
			
			// return num of days past since last Sunday
			function getX(date, cellSize){
				//return date.getDay() * cellSize;
				return d3.timeDay.count(d3.timeSunday(date), date) * cellSize;	
			}
			// return num of week past since the first date in the data
			function getY(firstDate, date, cellSize){
				
				return d3.timeWeek.count(firstDate, date) * cellSize;
			}
			
			//TODO: append axes. vertical: M T W T F S S 
			//		mouse over events: give detailed infos when mouse over circle 
			
			
			//console.log(counterData);
		}
		
	};
});
