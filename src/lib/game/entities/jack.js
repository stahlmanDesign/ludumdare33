ig.module(
    'game.entities.jack'
)
.requires(
    'impact.entity',
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
		speed: {"current":0,"idle":0,"walk":150},
		distanceToFlee: 60,
		flipTimer: null,

		chain: null,
		message: "",
		message: "",
		state:"idle",
		type: ig.Entity.TYPE.B,
		// Type property, 3 possiblities
		// NONE[default] --- A: ("friendly") --- B: ("enemy")
		checkAgainst: ig.Entity.TYPE.BOTH,
		// Check Against property, 4 possiblities
		// NONE[default]: (check() not called)
		// A: (A touches B) --- B: (B touches A) --- BOTH: (A touches A, B touches B)
		collides: ig.Entity.COLLIDES.LITE,
		// Collides property, 5 possibilities
		// NEVER[default]: (ignores all collisions)
		// FIXED: (a "strong" entity that won't move as a result of a collision. Like elevators and moving platforms.)
		// ACTIVE: (if ACTIVE, or ACTIVE and PASSIVE entities collide, they will both move apart)
		// PASSIVE: (if 2 PASSIVE entities of similar types collide, they can overlap. i.e., two freindly entities can pass by each other if passive)
		// LITE: (opposite of FIXED, a "weak" entity always moves away from a collision)

        animSheet: new ig.AnimationSheet('media/jack.png', 24, 36),

        init: function (x, y, settings) {

            this.parent(x, y, settings);

            this.addAnim('idle', 1, [0]);
            this.addAnim('walk', 0.07, [1,0,2,0]);

			this.fleeingTimer = new ig.Timer(0);

       		this.chain = EventChain(this)
				.wait(this.getRand(5))
			    .then(function() {  // ...then spawn a baddie...
			        //ig.game.spawnEntity(EntitySeed, this.startPosition.x, this.startPosition.y);
			        this.state = "idle";
			      })
			    .wait(1)            // ...wait some more...
			    .then(function() {  // ...then spawn a lesser baddie...
				    this.state = "walk";

			      })
			    .wait(this.getRand(5))
			    .repeat();         // ...and repeat the whole baseitem forever.

			this.flipTimer = new ig.Timer(this.getRand(4)); // only flip once a second to avoid frantic flipping in tight area


        },
		getRand: function(factor){
			return Math.random()*factor;
		},
        update: function() {
			ig.show("SC",this.speed.current);
			ig.show("state",this.state)
			// Near an edge? return!
			if( !ig.game.collisionMap.getTile(
					this.pos.x + (this.flip ? +4 : this.size.x -4),
					this.pos.y + this.size.y+1
				)
			) {
				this.flip = !this.flip;

				// We have to move the offset.x around a bit when going
				// in reverse direction, otherwise the  hitbox will
				// be at the tail end.
				this.offset.x = this.flip ? 6 : 0;
			}

	        var accel = this.standing ? this.accelGround : this.accelAir;
			//ig.show(this.accel.x)
			this.chain(); // execute the event chain

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
			// toe about to step over an edge on next update?
			var toe = this.pos.y + this.size.y + 1
			if (!ig.game.collisionMap.getTile(this.pos.x + (this.flip ? +6 : this.size.x - 6), toe)) {
				// if walking on an entity or near an edge, flip if more than 1 second since last flip
				if ( this.flipTimer.delta() > 0	) {
					this.flip = !this.flip;
					this.flipTimer.reset();
				}
			}
			var xdir = this.flip ? -1 : 1;
			this.vel.x = this.speed.current * xdir;

			if (this.state == "idle") {

					this.speed.current = this.speed.idle;
					this.currentAnim = this.anims.idle;
					this.currentAnim.flip.x = this.flip; // sit still but in direction of last movement


			} else if (this.state == "walk") {
				// ------------- walk -------------
				this.currentAnim = this.anims.walk;
				this.speed.current = this.speed.walk;
				// seek player if close
				if (this.vel.x < 0) {
					this.flip = true
				} else {
					this.flip = false;
				}
				this.currentAnim.flip.x = this.flip;
			} else if (this.state == "flee"){

				this.speed.current = this.speed.walk * 1.5;

			}
			this.currentAnim.flip.x = this.flip;
			this.parent();
        }
    });
});
