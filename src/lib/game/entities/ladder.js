/**
 *  @ladder.js
 *  @version: 2.0
 *  @author: Justin Stahlman
 *  @date: Oct 2013
 */
ig.module(
    'game.entities.ladder',
    'game.entities.jack'
)
.requires(
	'bootstrap.entities.base-ladder'
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


	// if making it 25 pixels wide when really 24, graphic will not appear. This allows placing it on top of another graphic and letting you climb

	init: function(x,y,settings){
        this.parent(x, y, settings);
		this.spawnTimer = new ig.Timer(0.1);
		//this.lifeTimer = new ig.Timer(2);
	},
	update: function() {
		this.parent()
		if (!ig.global.wm) {
			if (this.spawnTimer.delta() > 0){
				if (this.size.y > 115) return;
				this.spawnTimer.reset(); // otherwise stop growing
				//ig.game.spawnEntity(EntityLadder, this.pos.x, this.pos.y - 60, {"invisible":false});
				//this.offset.y ++;
				this.size.y++;
				this.pos.y --;

			}
			//if (this.lifeTimer.delta() > 0) this.kill();
		}
	}
});
});