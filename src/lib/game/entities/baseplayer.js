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
		animSheet: new ig.AnimationSheet('media/ds_atlas.png', 24, 48),
		sfxHurt: new ig.Sound('media/sounds/hurt.*'),
		sfxJump: new ig.Sound('media/sounds/jump.*'),
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

			this.lifeTimer = new ig.Timer(0); // will determine how long player has been spawned to avoid infinite loop of swimming / normal player spawning if stuck near water / land
			ig.game.player = this;
			this.startPosition = {
				x: x,
				y: y
			} // record where player started to respawn player there when dead
			this.messageTimer = new ig.Timer(4); // amount of time a message stays above player
			this.messageTimer2 = new ig.Timer(4); // amount of time a message stays above player

			this.messageFont2.letterSpacing = -1; // because added black outline around font

			this.jumpOutOfBalloonTimer = new ig.Timer(1);
			//console.log("ig.game.playerStats.isDark in baseplayer in init = " + ig.game.playerStats.isDark)

			if (ig.game.restoreLoadedGamePositions){
				setTimeout(function() {
					//alert("not new game")
					ig.game.restoreEntitiesToSavedPositions = true;
					if (ig.game.deleteEntitiesRemovedFromLevel) ig.game.deleteEntitiesRemovedFromLevel();
					if (ig.game.playerStats) ig.game.updateGameBasedOnSavedInfo();
					ig.game.restoreLoadedGamePositions = false; // now that player has been spawned from loaded game, treat as if new game and don't reset position when jumps in water

				}, 300)
			}else{
				//alert ("IS NEW GAME")
			}

			if (this.accel.y != 0) this.accel.y = 0; // reset because sometimes when transitioning from swimmer it is stuck at 150
			if (!ig.global.wm && ig.game.playerStats) if (ig.game.playerStats.message.indexOf("GAME OVER") != -1) this.messageTimer.set(5 * 60); // don't let message disappear. in 5 minutes will simply load game over position again
			if (!ig.global.wm && ig.game.playerStats) ig.game.playerStats.riverInTheSkyActivated = false; // so it gets respawned

			//alert(ig.game.playerStats.gameOver)
			if (!ig.global.wm){




			}

		},
		update: function() {


			if (ig.game.spawnpoint) {
				var spawnpoints = ig.game.getEntitiesByType(EntitySpawnpoint)
				for (var i in spawnpoints) {
					if (spawnpoints[i].name == ig.game.spawnpoint) {
						this.pos = spawnpoints[i].pos
						ig.game.spawnpoint = null
					}
				}
			}
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
			// jump
			if (this.standing && ig.input.pressed('jump')) {
				if (ig.input.state('up') || ig.input.state('left') || ig.input.state('right')) {
					var numSpirit = ig.game.getInventory("player", "spirit").quantity
					var bonus = 5 * numSpirit;
					if (bonus > 70) bonus = 70
					this.vel.y = (this.bigJump + bonus) * -1;
				} else {
					this.vel.y = -this.jump //-this.jump;
				}
				this.sfxJump.play();
				ig.game.player.jumpOutOfBalloonTimer.set(1);
			}
			if (ig.game.playerStats) {
				if (ig.game.playerStats.knowsDreamsong && ig.game.getInventory("player", "musicalnotes").quantity < 1) {
					if (Math.random() > .995) ig.game.getInventory("player", "musicalnotes").quantity++; // spawn musical note but not right away. Makes sure player always regenerates a note if uses them all up (only once having delivered balalaika)
				}
			}
			if (!ig.global.wm && ig.game.playerStats) {
				if (ig.game.playerStats.currentLevel == "Worldmap") {
					var whale = ig.game.getEntitiesByType("EntityWhitewhale")[0];
					if (ig.game.getInventory("jonah", "cello").quantity == 0 && whale) whale.kill(); // remove  from the game cause don't want to be swallowed again if already got cello
				}
			}
			this.parent(); // move!
			if (this.pilotingBalloon && this.jumpOutOfBalloonTimer.delta() > 0) {
				var balloon = ig.game.getEntitiesByType("EntityBalloon")[0];
				this.pos.x = balloon.pos.x + 10;
				this.pos.y = balloon.pos.y;
				ig.game.player.currentAnim = ig.game.player.anims.idle
				this.currentAnim.flip.x = this.flip;
			}
		},
		kill: function() {
			ig.game.playerStats.wisdom += 3;
			this.parent();
		},
		receiveDamage: function(amount, from) {
			if (this.invincible) return; // don't get hurt if player still has "free blink"
			if (this.currentAnim == this.anims.pain) {
				// Already in pain? Do nothing.
				return;
			}
			// We don't call the parent implementation here, because it
			// would call this.kill() as soon as the health is zero.
			// We want to play our death (pain) animation first.

			ig.game.getInventory("player", "wisdom").quantity += 1;	// increase wisdom
			ig.game.getInventory("player", "spirit").quantity -= amount;	// drain spirt based on enemy
			ig.game.getInventory("player", "courage").quantity = Math.round(ig.game.getInventory("player", "courage").quantity/2);	// cut courage in half

			this.currentAnim = this.anims.pain.rewind();
			// Knockback
			this.vel.x = (from.pos.x > this.pos.x) ? -400 : 400;
			this.vel.y = -300;
			// Sound
			this.sfxHurt.play();
			//this.parent(amount, from);
		},
		giveBaseitem: function(item, quantity) {
			//console.log("received: " + quantity + " " + item);
			var baseitem = ig.game.getInventory(this.name, item).quantity += quantity;
			//console.log(ig.game.getInventory(this.name,item))
		},
		draw: function() {

			//if (this.invincible) this.currentAnim.alpha = (this.invincibleTimer.delta()/this.invincibleDelay * 1) + 0.5; // don't fade in because of the way kill() is used to transition between player swimming, crawling etc.
			//if (!ig.global.wm) console.log(ig.game.playerStats)
			//if (!ig.global.wm) console.log("isDark at baseplayer draw = " + ig.game.playerStats.isDark)
			var s = ig.system.scale * 2; // modif because this game is upsampled for pixel look
			var x = this.pos.x * s - ig.game.screen.x * s;
			var y = (this.pos.y) * s - ig.game.screen.y * s;
			if (!ig.global.wm && ig.game.playerStats) {
				if (ig.game.playerStats.currentLevel == "Forbiddencave" || ig.game.playerStats.currentLevel == "Whitewhale") {
					this.darkness.draw((x / 2) - 1024, (y / 2) - 1024); // fog of war is 2048 x 2048
				}
			}
			if (!ig.global.wm && ig.game.playerStats) {

				if (ig.game.playerStats.isDark == true) {

					ig.game.playerStats.darkness += 0.05;
					if (ig.game.playerStats.darkness > 1) {
						ig.game.playerStats.darkness = 1;
						if (ig.game.hiddenInteriors) ig.game.hiddenInteriors.foreground = false;
					}
					ig.system.context.globalAlpha = ig.game.playerStats.darkness;
					console.log("true " + ig.game.playerStats.darkness)

					this.darkness.draw((x / 2) - 1024, (y / 2) - 1024); // fog of war is 2048 x 2048
					ig.system.context.globalAlpha = 1; // return all other images to normal alpha

					if (ig.game.hiddenInteriors) {
						ig.game.hiddenInteriors.visible = false; // make sure it exists because may be on a different level
						//ig.game.hiddenInteriors.foreground = false;
					}
				} else {

					ig.game.playerStats.darkness -= 0.05;
					if (ig.game.playerStats.darkness < 0) {
						ig.game.playerStats.darkness = 0;
						if (ig.game.hiddenInteriors) ig.game.hiddenInteriors.foreground = true;
					}
					ig.system.context.globalAlpha = ig.game.playerStats.darkness;
					//console.log("false " + ig.game.playerStats.darkness)
					this.darkness.draw((x / 2) - 1024, (y / 2) - 1024); // fog of war is 2048 x 2048
					ig.system.context.globalAlpha = 1; // return all other images to normal alpha



					if (ig.game.hiddenInteriors) {
						ig.game.hiddenInteriors.visible = true;
						//ig.game.hiddenInteriors.foreground = true;
					}
				}
			}
			if (!ig.global.wm && ig.game.playerStats && this.messageTimer.delta() < 0) {
				this.messageFont.draw(ig.game.playerStats.message, x / 2, (y / 2) - 41, ig.Font.ALIGN.CENTER);
			}
			if (!ig.global.wm && ig.game.playerStats && this.messageTimer2.delta() < 0) {
				if (ig.game.playerStats.message2 == undefined) ig.game.playerStats.message2 = ""; // in case loading from game when message2 did not exist
				this.messageFont2.draw(ig.game.playerStats.message2, x / 2, (y / 2) - 31, ig.Font.ALIGN.CENTER);
			}

			if (!ig.global.wm && ig.game.getInventory("player","spirit").quantity <= 3 && ig.game.playerStats.currentLevel != ig.game.playerStats.mainMenuLevel){
				this.messageFont.draw("\nYOUR SPIRIT IS WEAK...", x / 2, (y / 2) - 31, ig.Font.ALIGN.CENTER);
			}
			this.parent();
		},
		makeInvincible: function() {
			this.invincible = true;
			this.invincibleTimer.reset()
		}
		});
    // Add additional classes here that will only be accessed by this entity

	EntitySplash = ig.Entity.extend({
        lifetime: 1,
        callBack: null,
        particles: 25,

        init: function( x, y, settings ) {
            this.parent( x, y, settings );

                for(var i = 0; i < this.particles; i++)
                    ig.game.spawnEntity(EntitySplashparticlelocal, x, y+12, {colorOffset: settings.colorOffset ? settings.colorOffset : 0});
                this.idleTimer = new ig.Timer();
            },
        update: function() {
            if( this.idleTimer.delta() > this.lifetime ) {
                this.kill();
                if(this.callBack)
                    this.callBack();
                return;
            }
        }
    });
    EntitySplashparticlelocal = ig.Entity.extend({
        size: {x: 2, y: 2},
        maxVel: {x: 160, y: -100},
        lifetime: 2,
        fadetime: 1,
        bounciness: 0,
        vel: {x: 100, y: -100},
        friction: {x:100, y: 600},
        collides: ig.Entity.COLLIDES.LITE,
        colorOffset: 0,
        totalColors: 7,
        gravityFactor:1.1,
        animSheet: new ig.AnimationSheet( 'media/splash.png', 2, 2 ),
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset * (this.totalColors+1));
            this.addAnim( 'idle', 0.2, [frameID] );
            this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
            this.vel.y = (Math.random() * 2 - 0) * this.vel.y;
            this.idleTimer = new ig.Timer();
        },
        update: function() {
            if( this.idleTimer.delta() > this.lifetime ) {
                this.kill();
                return;
            }
            this.currentAnim.alpha = this.idleTimer.delta().map(
                this.lifetime - this.fadetime, this.lifetime,
                1, 0
            );
            this.parent();
        }
    });

});
