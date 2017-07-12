//a module for explosion
// when enemy and player explode

define(['globals'], function(GLOBAL){
	return function(E){
		E = E || {};
		
		E.width = 65;
		E.height = 60;
		
		E.active = true;
		E.state = 0;
		
		E.sprite = [GLOBAL.SPRITE('explosion1'),GLOBAL.SPRITE('explosion2'),GLOBAL.SPRITE('explosion3'),
		GLOBAL.SPRITE('explosion4'),GLOBAL.SPRITE('explosion5'),GLOBAL.SPRITE('explosion6'),GLOBAL.SPRITE('explosion7')];
		
		E.draw = function(){
			if(this.active){
				var currentState = this.sprite[this.state];
				currentState.draw(GLOBAL.CANVAS, this.x, this.y, this.width, this.height, null);
				this.state ++;
				if(this.state == 7){
					this.active = false;
				}
			}
		}
		return E;
	}
})