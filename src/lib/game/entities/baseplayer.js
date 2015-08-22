ig.module(
    'game.entities.baseplayer'
)
.requires(
    'impact.entity'

)
.defines(function() {
	EntityBaseplayer = ig.Entity.extend({
		size: {
			x: 10,
			y: 22
		},
		offset: {
			x: 8,
			y: 26
		},
		maxVel: {
			x: 175,
			y: 300
		},
		friction: {
			x: 1200,
			// only applies when accl.x = 0
			y: 0
		},

		type: ig.Entity.TYPE.A,
		// Type property, 3 possiblities
		// NONE[default] --- A: ("friendly") --- B: ("enemy")
		checkAgainst: ig.Entity.TYPE.NONE,
		// Check Against property, 4 possiblities
		// NONE[default]: (check() not called)
		// A: (A touches B) --- B: (B touches A) --- BOTH: (A touches A, B touches B)
		collides: ig.Entity.COLLIDES.PASSIVE,
		// Collides property, 5 possibilities
		// NEVER[default]: (ignores all collisions)
		// FIXED: (a "strong" entity that won't move as a result of a collision. Like elevators and moving platforms.)
		// ACTIVE: (if ACTIVE, or ACTIVE and PASSIVE entities collide, they will both move apart)
		// PASSIVE: (if 2 PASSIVE entities of similar types collide, they can overlap. i.e., two freindly entities can pass by each other if passive)
		// LITE: (opposite of FIXED, a "weak" entity always moves away from a collision)
		//animSheet: new ig.AnimationSheet('media/ds_atlas.png', 24, 48),
		//sfxHurt: new ig.Sound('media/sounds/hurt.*'),
		//sfxJump: new ig.Sound('media/sounds/jump.*'),
		name: "player",
		// These are our own properties. They are not defined in the base
		// ig.Entity class. We just use them internally for the Player
		flip: false,
		accelGround: 300,
		accelAir: 220,
		jump: 220,
		bigJump: 250,
		maxHealth: 3,
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(255,0,0,0.7)',
		startPosition: null,
		invincible: false,
		invincibleDelay: 1,
		invincibleTimer: null,
		messageFont: new ig.Font('media/outlinedfont.png'),
		message: "",
		messageTimer: null,
		messageFont2: new ig.Font('media/outlinedfontLabel.png'),
		message2: "",
		messageTimer2: null,
		jumpOutOfBalloonTimer: null,
		//lantern: new ig.Image('media/lantern.png'),		// makes fog of war
		darkness: new ig.Image('media/fogofwar.png'),
		pilotingBalloon: false,
		lifeTimer: null,

		init: function(x, y, settings) { // passes the x,y and settings values to the parent's init() so entity knows starting point and any other settings assigned in weltmeister level
			this.parent(x, y, settings);



		},
		update: function() {



			this.zIndex = 99; // put player on top
			ig.game.sortEntitiesDeferred(); // assure player is sorted to be on top so fog of war hides other entities. Also required if using ladder if you want player in front of ladder instead of behind
			if (this.messageTimer.delta() > 0 && ig.game.playerStats) {
				ig.game.playerStats.message = ""; // clean it out so message does not appear when player changes to type swimmer. but allow to show when found unconscious
			}
			if (this.messageTimer2.delta() > 0 && ig.game.playerstats){
				ig.game.playerStats.message2 = "";
			}
			// ------------------ begin ladder code ------------------
			if (this.isConfiguredForClimbing) { // this will only be true if level contains a ladder
				this.checkForLadder(this);
				if (this.ladderTouchedTimer.delta() > 0) {
					this.isTouchingLadder = false;
					//this.gravityFactor = 1;
				}else{
					//this.gravityFactor = 1;
				}
				// reset in case player leaves ladder. This allows to walk across/atop ladder
			} else {
				var ladders = ig.game.getEntitiesByType("EntityLadder")
				if (ladders != undefined) {
					for (var i = 0; i < ladders.length; i++) {
						ladders[i].makeEntitiesEligibleClimbers();
					}
				}
			}
			// ------------------  end  ladder code ------------------


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
		},
		receiveDamage: function(amount, from) {

			//this.sfxHurt.play();
			this.parent(amount, from);
		}
		});



});
