ig.module(
	'game.entities.harp'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityHarp = ig.Entity.extend({
	size: {x: 36, y: 36},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,

	animSheet: new ig.AnimationSheet( 'media/harp.png', 36, 36 ),



	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		ig.game.harp = this;
		this.addAnim( 'idle', 0.1, [0,0,0,0,0,0,0,0,0,1,2] );
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

			this.kill();
		}
	}
});

});