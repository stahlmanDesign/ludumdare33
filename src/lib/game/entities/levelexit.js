ig.module(
	'game.entities.levelexit'
	)
.requires(
	'impact.entity'
)
.defines(function(){
	EntityLevelexit = ig.Entity.extend({

		_wmDrawBox:true,						// show somebaseitem in weltmeister even though has no sprite sheet in game
		_wmBoxcolor: 'rgba(0,0,255,0.7)',		// a blue coloured box
		_wmScalable: true,
		size:{x:8,y:8},							// of size 8 x 8

		level: null,							// name of next level to load when this entity is touched.


		checkAgainst: ig.Entity.TYPE.A,			//

		update: function(){},					// override update() so we are not spending render cycles trying to draw an entity with no graphics

		check: function( other ) {
			if ( other instanceof EntityPlayer ){
				ig.game.toggleStats(this);
				/*
if (this.level ){
					var levelName = this.level.replace(/^(Level)?(\w)(\w*)/, function (m,l,a,b){
						return a.toUpperCase() + b;
					});
					ig.game.loadLevelDeferred( ig.global['Level'+levelName]);
				}
*/
			}

		},
		nextLevel: function(){
				if (this.level){
					var levelName = this.level.replace(/^(Level)?(\w)(\w*)/, function (m,l,a,b){
						return a.toUpperCase() + b;
					});
					ig.game.loadLevelDeferred( ig.global['Level'+levelName]);
				}
			}
	});
});
