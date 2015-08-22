ig.module(
	'game.entities.seed'
)
.requires(
	'impact.entity'
)
.defines(function() {

	EntitySeed = ig.Entity.extend({

	    size: {
	    	x: 10,
	    	y: 6
	    },
	    animSheet: new ig.AnimationSheet('media/seed.png', 10, 6),
	    maxVel:   {
	    	x: 200,
	    	y: 200
	    },
	    vel: {
	    	x: 40,
	    	y: 50
	    },
	     // no y velocity because they only move forward and fall
	    friction: {
	    	x: 20,
	    	y: 20
	    },
	    bounciness: 0.1,
	    bounceCounter: 0,

	    type: ig.Entity.TYPE.NONE,

	    checkAgainst: ig.Entity.TYPE.NONE,

	    collides: ig.Entity.COLLIDES.PASSIVE,

	    init: function (x,y,settings){
		    this.parent(x + (settings.flip ? - 4 : 8), y+8, settings);						// use flip from optional settings object and apply offset to x,y values that we pass to parent() so starts in correct position and appears to be thrown

		    this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);					// set to max vel of basecharacter so object thrown goes out at maxVel.x
		    this.vel.y = -(50 + (Math.random()*100));
		    if (settings.vel){
		    	this.vel.x = settings.vel.x;												// if object threw the seed, take its velocity
		    	if (settings.vel.x == 0){this.vel.x = Math.random()*50}						// but if object was idle, make random
		    }

		    this.addAnim ('idle',0.2,[0]);

	    },

	    handleMovementTrace: function(res) { // react when seed hits collision layer
	    	this.parent(res);
	    	if (res.collision.x || res.collision.y) {
	    		this.bounceCounter++;
	    		if (this.bounceCounter > 3) {
	    			// determine random amount of time
	    			ig.game.spawnEntity(EntityLadder, this.pos.x, this.pos.y - 89, { // grow a beanstalk where seed fell
	    				flip: this.flip,
	    				vel: {
	    					x: this.vel.x
	    				}
	    			});
	    			this.kill()
	    		}
	    	}
	    },


	    check: function (other){
		    other.receiveDamage(3,this);													// if entity hit, affect its health
		    this.kill();
	    }
    });
});
