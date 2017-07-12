//a module for explosion
// when enemy and player explode

define(['globals'], function(GLOBAL){
	return function(E){
		E = E || {};
		
		E.width = 65;
		E.height = 60;
		
		E.active = true;
		E.state = 0;
		
		E.sprite = GLOBAL.SPRITE('trashcan');
		
		E.draw = function(canvas, x, y){
			this.sprite.draw(this.canvas, x, y, this.sprite.width, this.sprite.height, null, null);
			this.x = x;
			this.y = y;
		}
		return E;
	}
})