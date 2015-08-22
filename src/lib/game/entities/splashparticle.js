ig.module(
	'game.entities.splashparticle'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntitySplashparticle = ig.Entity.extend({
        size: {x: 2, y: 2},
        maxVel: {x: 160, y: 50},
        lifetime: 5,
        fadetime: 4,
        bounciness: 1,
        vel: {x: 50, y: 10},
        friction: {x:100, y: 600},
        collides: ig.Entity.COLLIDES.LITE,
        colorOffset: 0,
        totalColors: 7,
        gravityFactor:1.1,
        vely:0,

        animSheet: new ig.AnimationSheet( 'media/splash.png', 2, 2 ),
        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset * (this.totalColors+1));
            this.addAnim( 'idle', 0.2, [frameID] );

            if (settings.isRain) vely = 1
            else vely = 0


            this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
            this.vel.y = (Math.random() * 2 - vely) * this.vel.y;

			if (settings.reversed) this.gravityFactor *=-1;

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
