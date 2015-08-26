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
			x: 275,
			y: 300
		},
        type: ig.Entity.TYPE.A, // Player friendly group
		checkAgainst: ig.Entity.TYPE.B,
        collides: ig.Entity.COLLIDES.PASSIVE,

		name:"player",
        animSheet: new ig.AnimationSheet('media/giant.png', 72, 126),
		accelGround: 900,
		accelAir: 500,
		speed: {current:0,normal:400,ladder:600},
        friction: {x:200,y:0},
        messageFont: new ig.Font('media/outlinedfont.png'),
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
				if (this.accel.x > 0) this.vel.x *=0.15; // prevents sliding as if on ice when changing direction
				this.accel.x = -accel;
				this.flip = true;

			}
			else if( ig.input.state('right')) {
				if (this.accel.x < 0) this.vel.x *=0.15; // prevents sliding as if on ice when changing direction
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
				if (this.deadlyFallTimer.delta() > 1) {
					this.deadlyFallTimer.set(1); // after 2 seconds of pain, reset
					ig.game.gameStats.player.lives --;
					if (ig.game.gameStats.player.lives == 0) ig.game.gameOver();
				}
			}

			// Move!
			this.parent();
			//ig.show(this.deadlyFallTimer.delta(),"dft")
		},
		draw: function(){

			if (!ig.global.wm && this.deadlyFallTimer.delta() > 0 && !this.standing){
				var s = ig.system.scale * 2; // modif because this game is upsampled for pixel look
				var x = this.pos.x * s - ig.game.screen.x * s;
				var y = (this.pos.y) * s - ig.game.screen.y * s;

				this.messageFont.draw("\nYOU'RE TOO HIGH!...", x / 2, (y / 2) - 31, ig.Font.ALIGN.CENTER);
			}
			this.parent();
		},
		check:function(other){
			if (other instanceof EntityJack && this.vel.y > 0 && !this.standing && other.vel.y >= 0){
				var BLOOD = true;
				other.kill(BLOOD);
			}
		},
		handleMovementTrace: function(res) {
			this.parent(res);

			var upwardPassageOnlyTile = 12; //12th tile on collision tiles (0 is air empty for air, so tiles start at 1)

			var tileSize = 8;

			// toe touching upwardPassageOnlyTile ?
			var toe = this.pos.y + this.size.y+1;
			//console.log("tile = " + ig.game.collisionMap.getTile(this.pos.x + (this.flip ? +6 : this.size.x - 6), toe)) // find out which tile
			if (ig.game.collisionMap.getTile(this.pos.x + (this.flip ? +6 : this.size.x - 6), toe) == upwardPassageOnlyTile) {

				// toe is on upwardPassageOnly tile
				if (ig.input.state("down")){
					 this.pos.y +=10; // force down no matter what collision tile is there
					 console.log("giant doing down through clouds")
				}
			}
		}
	});
});
