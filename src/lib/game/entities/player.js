ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function() {

    EntityPlayer = ig.Entity.extend({

        size: { x: 36, y: 100 }, // total sprite size = {x:72,y:126}
        offset: {x:18,y:26},		// collision box smaller than sprite size
        maxVel: {
			x: 175,
			y: 300
		},
        type: ig.Entity.TYPE.A, // Player friendly group
		checkAgainst: ig.Entity.TYPE.B,
        collides: ig.Entity.COLLIDES.PASSIVE,

		name:"player",
        animSheet: new ig.AnimationSheet('media/giant.png', 72, 126),
		accelGround: 600,
		accelAir: 500,
        friction: {x:200,y:0},
        init: function( x, y, settings ) {

	        ig.game.player = this;

			this.parent( x, y, settings );

			// Add the animations

			this.addAnim( 'idle', 1, [0] );
        	this.addAnim( 'run', 0.07, [1,0,2,0] );			// name or ID, duration of frame, the different frames (tiles) to animate
			this.addAnim( 'jump', 1, [3], true );		// true = stop at the last frame
        	this.addAnim( 'fall', 0.5, [4,3] );
        	this.addAnim( 'up', 0.20, [6,7] );
        	this.addAnim( 'down', 0.20, [7,6] );
        	this.addAnim( 'pain', 0.3, [11,12,11,11,12], true );

			this.jump = 350;
			this.deadlyFallTimer = new ig.Timer(1);

		},


		update: function() {
			// Handle user input; move left or right
			// Handle user input; move left or right
			var accel = this.standing ? this.accelGround : this.accelAir;
			if( ig.input.state('left')) {
				if (this.accel.x > 0) this.vel.x *=0.25; // prevents sliding as if on ice when changing direction
				this.accel.x = -accel;
				this.flip = true;

			}
			else if( ig.input.state('right')) {
				if (this.accel.x < 0) this.vel.x *=0.25; // prevents sliding as if on ice when changing direction
				this.accel.x = accel;
				this.flip = false;
			}
			else {
				this.accel.x = 0;
			}
			// Stay in the pain animation, until it has looped through.
			// If not in pain, set the current animation, based on the
			// player's speed
			if (
			this.currentAnim == this.anims.pain && this.currentAnim.loopCount < 1) {
				// If we're dead, fade out
				if (this.health <= 0) {
					// The pain animation is 0.3 seconds long, so in order to
					// completely fade out in this time, we have to reduce alpha
					// by 3.3 per second === 1 in 0.3 seconds
					var dec = (1 / this.currentAnim.frameTime) * ig.system.tick;
					this.currentAnim.alpha = (this.currentAnim.alpha - dec).limit(0, 1);
				}
			} else if (this.health <= 0) {
				// We're actually dead and the death (pain) animation is
				// finished. Remove ourself from the game world.
				this.kill();
			} else if (this.vel.y < 0) {

				this.currentAnim = this.anims.jump;
			} else if (this.vel.y > 0 && !this.isClimbing) {

				// set timer to one second if not already in pain and not already checking fall time
				//if (this.currentAnim != this.anims.pain ) this.deadlyFallTimer.set(1); // one second; will count from -1 to 0

				if (this.currentAnim != this.anims.fall) {
					this.currentAnim = this.anims.fall.rewind();
				}
			} else if (this.vel.x != 0) {
				this.currentAnim = this.anims.run;
			} else {
				this.currentAnim = this.anims.idle;
			}


			// animation for ladder
			if (this.vel.y < 0 && this.isClimbing)this.currentAnim = this.anims.up;
			else if (this.vel.y > 0 && this.isClimbing)this.currentAnim = this.anims.down;

			this.currentAnim.flip.x = this.flip;

			// ------------------ begin ladder code ------------------
			if (this.isConfiguredForClimbing){
				this.checkForLadder(this);
				if (this.ladderTouchedTimer.delta() > 0) this.isTouchingLadder = false; // reset in case player leaves ladder. This allows to walk across/atop ladder
				else this.deadlyFallTimer.set(0.5); // on ladder so cancel falling timer
			}

			// ------------------  end  ladder code ------------------

			// jump
			if (this.standing && ig.input.pressed('jump')) {
				//if (ig.input.state('up') || ig.input.state('left') || ig.input.state('right')) {
					this.vel.y = - this.jump //-this.jump;
					//this.sfxJump.play();
				//}
			}

			if (this.standing && this.deadlyFallTimer.delta() < 0){
				this.deadlyFallTimer.set(1); // reset to one second cause safely on ground
			}
			if (this.standing && this.deadlyFallTimer.delta() > 0){
				this.currentAnim = this.anims.pain.rewind();
				if (this.deadlyFallTimer.delta() > 2) this.deadlyFallTimer.set(1); // after 2 seconds of pain, reset
			}

			// Move!
			this.parent();
			//ig.show(this.deadlyFallTimer.delta(),"dft")
		},
		check:function(other){
			if (other instanceof EntityJack && this.vel.y > 0 && !this.standing){
				other.kill();
			}
		}
	});
});
