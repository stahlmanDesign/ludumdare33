ig.module(
	'game.entities.house'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityHouse = ig.Entity.extend({
	size: {x: 36, y: 36},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,

	animSheet: new ig.AnimationSheet( 'media/house.png', 36, 36 ),



	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		this.addAnim( 'idle', 1, [0] );
	},


	update: function(x,y,settings) {

	//	if (Math.random() < 0.01) ig.game.spawnEntity(EntityJack, this.pos.x, this.pos.y);

		this.parent(x,y,settings)
	},


	check: function( other ) {
		// The instanceof should always be true, since the player is
		// the only entity with TYPE.A - and we only check against A.
		if( other instanceof EntityJack ) {
			//other.giveCoins(1);

			//this.kill();
		}
	}
});

});