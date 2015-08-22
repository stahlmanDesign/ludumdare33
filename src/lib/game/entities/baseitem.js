ig.module(
	'game.entities.baseitem'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityBaseitem = ig.Entity.extend({
	size: {
		x: 24,
		y: 48
	},
	offset: {
		x: 0,
		y: 0
	},

	type: ig.Entity.TYPE.A,					// Friendly enemy group
	checkAgainst: ig.Entity.TYPE.NONE,		// Check against friendly and evil
	collides: ig.Entity.COLLIDES.PASSIVE, 	// intangible

	flip: false,
	animSheet: new ig.AnimationSheet('media/ds_atlas.png', 24, 48),
	sfxCollect: new ig.Sound( 'media/sounds/pickup.*' ), // could also be coin.*
	labelFont: new ig.Font('media/outlinedfontLabel.png'),
	distanceToPlayerForMessage: 100,

	//name: "baseitem", // this will be overridden by name of object
	intangibleTimer: null,
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		this.startPosition = {
			x: x,
			y: y
		} // record where started to respawn there if needed
		this.gravityFactor = .3; // so baseitems like tokens and rewards will fly up in air and fall more slowly
		this.intangibleTimer = new ig.Timer(0);
		this.message = "";

	},
	update: function(){
		this.parent();

		if (this.intangibleTimer.delta() > 1) {
			this.checkAgainst = ig.Entity.TYPE.BOTH; // becomes touchable 1 second after being spawned
		}
		if (ig.game.playerStats.currentLevel != "bedroom" && this.found == false) this.kill(); // this is for loaded games
	},
	draw: function(){
		if( !ig.global.wm ) { // not in wm?
			this.currentAnim.alpha = Math.abs(this.intangibleTimer.delta()); // draws alpha (0 - 1) from timer so it appears as transparent to solid in 1 second. Anybaseitem > 1 = 1
		}
		this.parent();

		// show message. will be empty if not near player
		//var s = ig.system.scale;
		var s = ig.system.scale * 2; // modif because this game is upsampled for pixel look
		var x = this.pos.x * s - ig.game.screen.x * s + 20;
		var y = (this.pos.y-15) * s - ig.game.screen.y * s;
		this.labelFont.draw(this.message, x/2, y/2, ig.Font.ALIGN.CENTER );
	},

	check: function(other) {
		// The instanceof should always be true, since the player is
		// the only entity with TYPE.A - and we only check against A.
		if (other instanceof EntityBaseplayer) {
			other.giveBaseitem(this.name, 1); // type of baseitem and quantity of 1
			//console.log("should give "+this.name)

			this.sfxCollect.play();

			var courage = ig.game.getInventory("player","courage");
			if (courage.quantity < 30) courage.quantity +=1;

			this.kill();
		}
	},

	getMessage: function(index){
		if (index == undefined) index = 0
		var res = "";
		if (ig.game.player){															// if player exists
			if (this.distanceTo(ig.game.player) < this.distanceToPlayerForMessage){		// if player in vicinity of charater
				res = this.messages[index]; // default

			}
		}
		return res;
	},
	kill: function(){
		//console.log(this.name + " killed");
		this.parent();
	}

});
});
