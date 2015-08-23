ig.module(
    'game.entities.jack'
)
.requires(
    'impact.entity',
    'game.entities.seed',
   	'game.system.eventChain'		// event chain plugin https://github.com/drhayes/impactjs-eventchain
)
.defines(function() {

    EntityJack = ig.Entity.extend({

		size: {
			x: 12,
			y: 22
		},
		offset: {
			x: 6,
			y: 14
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
		accelGround: 600,
		accelAir: 500,
		speed: {"current":0,"idle":0,"walk":150,"flee":250},
		distanceToFlee: 90,
		distanceToCovet: 400,
		flipTimer: null,
        messageFont: new ig.Font('media/outlinedfont.png'),
		name : "jack",
		chain: null,
		message: "",
		state:"idle",

		hasItem:{"coin":false,"goose":false,"harp":false},
		type: ig.Entity.TYPE.B,
		// Type property, 3 possiblities
		// NONE[default] --- A: ("friendly") --- B: ("enemy")
		checkAgainst: ig.Entity.TYPE.BOTH,
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

        animSheet: new ig.AnimationSheet('media/jack.png', 24, 36),

        init: function (x, y, settings) {

			this.origPos = this.pos;

            this.parent(x, y, settings);

            this.addAnim('idle', 1, [0]);
            this.addAnim('walk', 0.07, [1,0,2,0]);

			this.fleeingTimer = new ig.Timer(0);

       		this.chain = EventChain(this)
				.wait(this.getRand(0.5))
			    .then(function() {  // ...then spawn a baddie...
			        //ig.game.spawnEntity(EntitySeed, this.startPosition.x, this.startPosition.y);
			        this.state = "idle";
			      })
			    .wait(this.getRand(0.5))            // ...wait some more...
			    .then(function() {  // ...then spawn a lesser baddie...
				    this.state = "walk";

			      })
			    .wait(this.getRand(10))
			    .repeat();         // ...and repeat the whole baseitem forever.

			this.flipTimer = new ig.Timer(this.getRand(15)); // only flip once a second to avoid frantic flipping in tight area

			this.throwSeedTimer = new ig.Timer(1); // when throwing a seed only throw one a second max
        },
		getRand: function(factor){
			return Math.random()*factor;
		},
        update: function() {

			// TODO this not working correctly
			//(this.hasItem.coin || this.hasItem.goose || this.hasItem.harp) = false; // set false each frame, will be set true if touching


			this.chain(); // execute the event chain
			// Near an edge? return!
			if (!ig.game.collisionMap.getTile(this.pos.x + (this.flip ? +4 : this.size.x - 4), this.pos.y + this.size.y + 1)) {
				if (this.vel.y == 0){ // don't flip in air
				this.flip = !this.flip;
				this.flipTimer.set(this.getRand(15));
				// We have to move the offset.x around a bit when going
				// in reverse direction, otherwise the  hitbox will
				// be at the tail end.
				this.offset.x = this.flip ? 6 : 0;
				}
			}

	        var accel = this.standing ? this.accelGround : this.accelAir;
			//ig.show(this.accel.x)


			// toe about to step over an edge on next update?
			var toe = this.pos.y + this.size.y + 1
			if (!ig.game.collisionMap.getTile(this.pos.x + (this.flip ? +6 : this.size.x - 6), toe) // if toe over edge
				|| ( this.flipTimer.delta() > 0	)) {			// or if time to flip

					this.flip = !this.flip;
					this.flipTimer.set(this.getRand(15));


			}

			// seek treasure
			var treasure = [ig.game.coin,ig.game.harp,ig.game.goose];
			for (var i in treasure){
				if (treasure[i]) {
					if (this.distanceTo(treasure[i]) < this.distanceToCovet && this.fleeingTimer.delta() > 0) {
					//console.log(this.distanceTo(treasure[i]))
					    var angle = this.angleTo(treasure[i]);

                        this.vel.x = Math.cos(angle) * 200;
                        //this.vel.y = Math.sin(angle) * this.speed.current;
						// TODO go in distanceTo direction
						// if left flip else don't flip
//						this.flip = !this.flip;
					}
				}
			}

			// but beware of giant
			if (ig.game.player) {
				if (this.distanceTo(ig.game.player) < this.distanceToFlee && this.fleeingTimer.delta() > 0) {
					this.fleeingTimer.set(1);
					this.state = "flee";
					this.flip = !this.flip;
				}else{
					// keep calm, carry on at normal speed
					if (this.state == "walk") this.speed.current = this.speed.walk;
				}
			}

			var xdir = this.flip ? -1 : 1;
			this.vel.x = this.speed.current * xdir;

			if (this.state == "idle") {

					this.speed.current = this.speed.idle;
					this.currentAnim = this.anims.idle;
					this.currentAnim.flip.x = this.flip; // sit still but in direction of last movement

					if (Math.random() <  1 * ig.system.tick && this.throwSeedTimer.delta() > 0) {
						ig.game.spawnEntity(EntitySeed, this.pos.x,this.pos.y - ((Math.random()*20)+15),{flip:Math.random()>0.5 ? true : false});
						this.throwSeedTimer.reset();
					}
			} else if (this.state == "walk") {
				// ------------- walk -------------
				this.currentAnim = this.anims.walk;
				this.speed.current = this.speed.walk;
				// seek player if close
				if (this.vel.x < 0) {
					this.flip = true;
				} else {
					this.flip = false;
				}
				this.currentAnim.flip.x = this.flip;
			} else if (this.state == "flee"){

				this.currentAnim = this.anims.walk;
				this.speed.current = this.speed.flee;

				if (Math.random() <  4 * ig.system.tick && this.throwSeedTimer.delta() > 0) {

						ig.game.spawnEntity(EntitySeed, this.pos.x,this.pos.y - ((Math.random()*20)+15),{flip:Math.random()>0.5 ? true : false});
						this.throwSeedTimer.reset();
					}

			}
			this.currentAnim.flip.x = this.flip;


			this.parent();
			ig.show("hasCoin",this.hasItem.coin)
			ig.show("hasGoose",this.hasItem.goose)
			ig.show("hasHarp",this.hasItem.harp)
        },
        kill: function(blood){
			if (blood){
				 ig.game.spawnEntity( EntitySplash, this.pos.x, this.pos.y);
				 ig.game.gameStats.jacks.lives --;
				 ig.game.gameStats.jacks.deaths ++;
				 ig.game.gameStats.level[ig.game.gameStats.level.number].jacksKilled ++;
				// console.log(ig.game.gameStats)


				//if (ig.game.gameStats.jacks.lives == 0 && ig.game.gameStats.level.number <= 6)


				if (ig.game.gameStats.level[ig.game.gameStats.level.number].jacksKilled == ig.game.gameStats.level[ig.game.gameStats.level.number].jacksInLevel){
					ig.game.gameStats.level.number ++; // limit to 4 levels
					for (var i =0; i < ig.game.gameStats.level[ig.game.gameStats.level.number].jacksInLevel; i ++){ // spawn the number of jacks for current Level
						//console.log("spawn a jack")
						var x = this.origPos.x + (Math.random()* 220) +100;			// spawn point depends on where jack was in first level
						var y = this.origPos.y;
					 	ig.game.spawnEntity( EntityJack, x, y); // respawn at origin but with random X value so giant can't sit there and kill over and over
//					 	console.log("spawned jack at " + x + ", " + y)
					}

					// also set jacks to current number for level to draw heads for HUD
					ig.game.gameStats.jacks.lives = ig.game.gameStats.level[ig.game.gameStats.level.number].jacksInLevel;
				}
			}
	        this.parent();
        },
		check: function(other){
			if (other instanceof EntityLadder && (!this.hasItem.coin && !this.hasItem.goose && !this.hasItem.harp)){ // if on ladder, go up unless has item
				this.vel.x = 0;
				this.pos.x = other.pos.x ;
				this.state = "idle";
				this.currentAnim = this.anims.idle;
				this.flip = 1;
				this.flipTimer.set(this.getRand(5)+5); // don't flip until climbed beanstalk
				this.vel.y = -200;
			}

/*
			if (other instanceof EntityHouse && (this.hasItem.coin || this.hasItem.goose || this.hasItem.harp)){
				var BLOOD = false;
				this.kill(BLOOD);
			}
*/

		},
		draw: function(){
				var s = ig.system.scale * 2; // modif because this game is upsampled for pixel look
				var x = this.pos.x * s - ig.game.screen.x * s;
				var y = (this.pos.y) * s - ig.game.screen.y * s;
			if (!ig.global.wm){
				if (this.fleeingTimer.delta() < 0 ){


					this.messageFont.draw("\nCAN'T CATCH ME!...", x / 2, (y / 2) - 31, ig.Font.ALIGN.CENTER);
				}
				if ((this.hasItem.coin || this.hasItem.goose || this.hasItem.harp)) this.messageFont.draw("\nHE HE!...", x / 2, (y / 2) - 31, ig.Font.ALIGN.CENTER);
			}

			// temporary debugging of where toe is
/*
			if (!ig.global.wm ){
				var toe = {
					y: ig.system.getDrawPos((this.pos.y + this.size.y + 1 - ig.game.screen.y)),
					x: ig.system.getDrawPos((this.pos.x + this.size.x - ig.game.screen.x))
				};


		        ig.system.context.strokeStyle = "white";
		        ig.system.context.lineWidth = 1;
		        ig.system.context.beginPath();
		        ig.system.context.moveTo(toe.x,toe.y);
		        ig.system.context.lineTo(toe.x+10,toe.y);
		        ig.system.context.stroke();
		        ig.system.context.closePath();
	        }
*/
			this.parent();
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
				if ((this.hasItem.coin || this.hasItem.goose || this.hasItem.harp)){
					 this.pos.y +=10; // force down no matter what collision tile is there
					 console.log("got item should go down")
				}
			}

			// collision with a wall? return!
			if( res.collision.x ) {
				this.flip = !this.flip;
			}


		}
    });
        // Add additional classes here that will only be accessed by this entity

	EntitySplash = ig.Entity.extend({
        lifetime: 1,
        callBack: null,
        particles: 125,

        init: function( x, y, settings ) {
            this.parent( x, y, settings );

                for(var i = 0; i < this.particles; i++)
                    ig.game.spawnEntity(EntitySplashparticlelocal, x+ (Math.random()*12)-6, y, {colorOffset: settings.colorOffset ? settings.colorOffset : 0});
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
