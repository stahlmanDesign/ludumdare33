/*
Simple Mover that visits all its targets in an ordered fashion. You can use
the void entities (or any other) as targets.


Keys for Weltmeister:

speed
	Traveling speed of the mover in pixels per second.
	Default: 20

target.1, target.2 ... target.n
	Names of the entities to visit.
*/

ig.module(
	'game.entities.mover'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityMover = ig.Entity.extend({
	size: {x: 24, y: 8},
	offset: {x: 0, y: 18},
	maxVel: {x: 100, y: 300},

	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.BOTH,
	collides: ig.Entity.COLLIDES.FIXED,

	target: null,
	topTarget: null,
	targets: [],
	currentTarget: 0,
	gravityFactor: 0,

	bucketLiftSpeed: 30,
	bucketFallSpeed: 300,

	animSheet: new ig.AnimationSheet( 'media/ds_atlas.png', 24, 24 ),

	init: function( x, y, settings ) {
		this.addAnim( 'idle', 1, [289] );
		this.parent( x, y, settings );
		this.bucketLiftSpeed = settings.bucketLiftSpeed ? settings.bucketLiftSpeed : this.bucketLiftSpeed;
		this.bucketFallSpeed = settings.bucketFallSpeed ? settings.bucketFallSpeed : this.bucketFallSpeed;

		// Transform the target object into an ordered array of targets
		this.targets = ig.ksort( this.target);
		this.speed = this.bucketLiftSpeed;
	},

	update: function() {


		var oldDistance = 0;
		if (!ig.global.wm){

		this.collides = ig.Entity.COLLIDES.FIXED
			//if (this.currentTarget == this.targets[0]) this.speed = this.bucketFallSpeed;
			///else (this.currentTarget == this.targets[1]) this.speed = this.bucketLiftSpeed;


			this.topTarget = ig.game.getEntityByName( this.targets[0] );
			this.target = ig.game.getEntityByName( this.targets[this.currentTarget] );
			if( this.target ) {
				oldDistance = this.distanceTo(this.target) ;

				var angle = this.angleTo( this.target );
				this.vel.x = Math.cos(angle) * this.speed;
				this.vel.y = Math.sin(angle) * this.speed;
			}
			else {
				this.vel.x = 0;
				this.vel.y = 0;
			}


		}
		if (Math.random()>.8) ig.game.spawnEntity("EntitySplashparticle",this.pos.x+10,this.pos.y+5, {"colorOffset": Math.floor(Math.random()*2),"isRain":this.isRain})
		this.parent();

		// Are we close to the target or has the distance actually increased?
		// -> Set new target
		var newDistance = this.distanceTo(this.target);
		if( this.target && (newDistance > oldDistance || newDistance < 0.5) ) {
			this.pos.x = (this.target.pos.x-4);
			this.pos.y = (this.target.pos.y )//+ this.target.size.y/2);

			this.currentTarget = this.targets.length>1 ? (this.currentTarget+1) % this.targets.length : 0;
		}

	},
	draw: function() {
		if (!ig.global.wm && this.topTarget){
	        var ropeEndX = ig.system.getDrawPos(this.pos.x-ig.game.screen.x)+12;
	        var ropeEndY = ig.system.getDrawPos((this.pos.y-ig.game.screen.y)-16);


	        var ropeStartX  = ig.system.getDrawPos((this.topTarget.pos.x-ig.game.screen.x)+8);
	        var ropeStartY  = ig.system.getDrawPos(this.topTarget.pos.y-ig.game.screen.y)-30; // straight line rope only demo

	        ig.system.context.strokeStyle = "white";
	        ig.system.context.lineWidth = 1;
	        ig.system.context.beginPath();
	        ig.system.context.moveTo(ropeStartX,ropeStartY);
	        ig.system.context.lineTo(ropeEndX,ropeEndY);
	        ig.system.context.stroke();
	        ig.system.context.closePath();
        }
        this.parent();
    },
    check: function(other){
		if (other instanceof EntityAhab) {
	       	this.collides = ig.Entity.COLLIDES.PASSIVE; // will be set back to FIXED each update
		}
		this.parent();
    }


});

});
