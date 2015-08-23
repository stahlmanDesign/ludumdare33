ig.module(
	'game.entities.coin'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityCoin = ig.Entity.extend({
	size: {x: 36, y: 36},

	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.BOTH, // Check against friendly
	collides: ig.Entity.COLLIDES.LITE,

	animSheet: new ig.AnimationSheet( 'media/coin.png', 36, 36 ),
	sfxCollect: new ig.Sound( 'media/sounds/coin.*' ),



	origPos: {
		x: 0,
		y: 0
	},

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'idle', 0.2, [0,0,0,0,0,0,0,0,0,1,2,3,2,1] );
		ig.game.coin = this;
		this.origPos = this.pos;
	},


	update: function() {
		// Do nothing in this update function; don't even call this.parent().
		// The coin just sits there, isn't affected by gravity and doesn't move.

		// We still have to update the animation, though. This is normally done
		// in the .parent() update:



		this.currentAnim.update();
	},


	check: function( other ) {


		// The instanceof should always be true, since the player is
		// the only entity with TYPE.A - and we only check against A.
		if( other instanceof EntityJack ) {
			//other.giveCoins(1);
			//this.sfxCollect.play();

			other.hasItem.coin = true;
			this.pos = other.pos; // stick to jack
		}
		if (other instanceof EntityHouse){
			for (var i in ig.game.entities){
				var ent = ig.game.entities[i];
				if (ent instanceof EntityJack && ent.hasItem.coin) ent.hasItem.coin = false; // he no longer has the coin
			}
ig.game.gameStats.jacks.stolenItem.coin = true;
			this.sfxCollect.play();
			this.kill();
		}
	}
});

});