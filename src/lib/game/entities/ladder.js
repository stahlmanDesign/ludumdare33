/**
 *  @ladder.js
 *  @version: 2.0
 *  @author: Justin Stahlman
 *  @date: Oct 2013
 */
ig.module(
    'game.entities.ladder'

)
.requires(
	'bootstrap.entities.base-ladder',
	'game.entities.jack',
    'plugins.fade-entity'
)
.defines(function () {

EntityLadder = EntityBaseLadder.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(109,210,251,0.5)',
	_wmScalable: true,
	ladderTexture: new ig.Image("media/ds_ladderTexture.png"),
	size: {
		x: 25,
		y: 96
	},
	maxVel: {
		x: 0,
		y: 300
	},


	// if making it 25 pixels wide when really 24, graphic will not appear. This allows placing it on top of another graphic and letting you climb

	init: function(x,y,settings){
        this.parent(x, y, settings);
		this.spawnTimer = new ig.Timer(0.1);
		this.lifeTimer = new ig.Timer(20);

	},
	update: function() {
		this.parent()
		if (!ig.global.wm) {

			if (this.lifeTimer.delta() > 0) {
				//shrink to wither away
				if (this.lifeTimer.delta() < 0.1) this.setFadeOut(5); // only do this once, this hack does it a few times and then lets it play out
				this.size.y-=5;
				this.pos.y +=5;
			}else{
				if (this.spawnTimer.delta() > 0){
					if (this.size.y > 415) return;
					this.spawnTimer.reset(); // otherwise stop growing
					//ig.game.spawnEntity(EntityLadder, this.pos.x, this.pos.y - 60, {"invisible":false});
					//this.offset.y ++;
					var growth = Math.random()*8;
					this.size.y+=growth;
					this.pos.y -=growth;

				}
			}
			if (this.lifeTimer.delta() > 10) this.kill();
		}
	}
});

EntityLadder.inject(MixinFadeEntity);
});