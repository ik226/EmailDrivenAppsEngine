
//A module definition requires globals
//use:
define(["globals", "./utils"], function (GLOBAL, Utils) {
	"use strict"
	var currentTime = function(){ return Utils.UTCHourToLocalHour(GLOBAL.GAMEHOUR); };
	var firstSplashInfo = {counter: 1.5 * GLOBAL.FPS, message: "This Wave: " + Utils.UTCHourToLocalHour(GLOBAL.GAMEHOUR)};
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
    	_splashInfo: firstSplashInfo,//{counter: 0, message: ""},
		
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
      	  	GLOBAL.CANVAS.font = "20px Arial";
			GLOBAL.CANVAS.fillText("Bullets Remaining: " + numBullet(), 
				10, GLOBAL.CANVAS_HEIGHT - 30);
      	  	GLOBAL.CANVAS.font = "13px Arial";
			//enemy number is now fixed
			GLOBAL.CANVAS.fillText("Enemy Number: " + numEnemy(), 
				GLOBAL.CANVAS_WIDTH - 150, 50);
      	  	GLOBAL.CANVAS.fillText("Current Wave: " + currentTime(), GLOBAL.CANVAS_WIDTH - 150, 90);
			//enemy defeated count
			GLOBAL.CANVAS.fillText("Enemy Defeated: " + defeatedCount(), GLOBAL.CANVAS_WIDTH - 150, 70);
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
      	  	var message = "Next Wave: " + Utils.UTCHourToLocalHour(GLOBAL.GAMEHOUR);
      	  	this._splashInfo = {counter: counter, message: message};
    	},
		
		visualization: function(page){
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
			
			var rawdata = GLOBAL.INCOMINGEMAILDATA;
			//console.log(rawdata);
			var data = [];
			
			for(var i=0; i<24; i++){
				var newObj = new Object();
				newObj.numMails = rawdata[i].length;
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
		}
	};
});
