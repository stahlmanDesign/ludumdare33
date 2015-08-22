ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function() {

    EntityPlayer = ig.Entity.extend({

        size: { x: 72, y: 126 },
        collides: ig.Entity.COLLIDES.PASSIVE,

        animSheet: new ig.AnimationSheet('media/giant.png', 72, 126),
	accelGround: 400,
	accelAir: 200,
        init: function( x, y, settings ) {
			this.parent( x, y, settings );

			// Add the animations
			this.addAnim( 'idle', 1, [0] );
			this.addAnim( 'run', 0.15, [1,0,2,0] );
			this.addAnim( 'jump', 1, [9] );
			this.addAnim( 'fall', 0.4, [6,7] );
			this.jump = 300;
		},


		update: function() {

			// move left or right
			var accel = this.standing ? this.accelGround : this.accelAir;
			if( ig.input.state('left') ) {
				this.accel.x = -accel;
				this.flip = true;
			}
			else if( ig.input.state('right') ) {
				this.accel.x = accel;
				this.flip = false;
			}
			else {
				this.accel.x = 0;
			}


			// jump
			if( this.standing && ig.input.pressed('jump') ) {
				this.vel.y = -this.jump;
			}

			// shoot
			if( ig.input.pressed('shoot') ) {
				ig.game.spawnEntity( EntitySlimeGrenade, this.pos.x, this.pos.y, {flip:this.flip} );
			}

			// set the current animation, based on the player's speed
			if( this.vel.y < 0 ) {
				this.currentAnim = this.anims.jump;
			}
			else if( this.vel.y > 0 ) {
				this.currentAnim = this.anims.fall;
			}
			else if( this.vel.x != 0 ) {
				this.currentAnim = this.anims.run;
			}
			else {
				this.currentAnim = this.anims.idle;
			}

			this.currentAnim.flip.x = this.flip;


			// move!
			this.parent();
		}
	});
});
