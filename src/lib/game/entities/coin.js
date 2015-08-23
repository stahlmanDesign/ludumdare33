ig.module(
	'game.entities.coin'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityCoin = ig.Entity.extend({
	size: {x: 36, y: 36},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B, // Check against friendly
	collides: ig.Entity.COLLIDES.LITE,

	animSheet: new ig.AnimationSheet( 'media/coin.png', 36, 36 ),
	sfxCollect: new ig.Sound( 'media/sounds/coin.*' ),

	possessedByJack:false, // does he possess this item

	origPos: {
		x: 0,
		y: 0
	},

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'idle', 0.2, [0,0,0,0,0,0,0,0,0,1,2,3,2,1] );
	},


	update: function() {
		// Do nothing in this update function; don't even call this.parent().
		// The coin just sits there, isn't affected by gravity and doesn't move.

		// We still have to update the animation, though. This is normally done
		// in the .parent() update:



		this.currentAnim.update();
	},


	check: function( other ) {
		this.possessedByJack = false; // reset each time in case jack is killed or drops
		other.hasItem = false;
		// The instanceof should always be true, since the player is
		// the only entity with TYPE.A - and we only check against A.
		if( other instanceof EntityJack ) {
			//other.giveCoins(1);
			//this.sfxCollect.play();
			this.possessedByJack = true;
			other.hasItem = true;
			// TODO tell other (jack) that he has the item so he can go back to village
			this.pos = other.pos; // stick to jack
		}
	}
});

});