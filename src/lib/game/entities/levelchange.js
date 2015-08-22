/*
This entity calls ig.game.loadLevel() when its triggeredBy() method is called -
usually through an EntityTrigger entity.


Keys for Weltmeister:

level
	Name of the level to load. E.g. "LevelTest1" or just "test1" will load the
	'LevelTest1' level.
*/

ig.module(
	'game.entities.levelchange'
)
.requires(
	'impact.entity',
	'game.entities.spawnpoint'
)
.defines(function(){

EntityLevelchange = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(0, 0, 255, 0.7)',

	size: {x: 32, y: 32},
	level: null,
	messageNewLevel:"",

	triggeredBy: function( entity, trigger ) {



		if( this.level && entity == ig.game.player ) {

			if (this.messageNewLevel != "")	{						// if level change WM object has optional messageNewLevel, then show that for player message when changed, otherwise ignore and allow message player may already have to continue
				ig.game.playerStats.message = this.messageNewLevel; // set in wm
				entity.messageTimer.set(4);							// entity is player cause other characters cannot change levels
			}

			var destinationLevel = this.level.replace(/^(Level)?(\w)(\w*)/, function( m, l, a, b ) {
				return a.toUpperCase() + b;
			});

			//ig.game.playerStats.lastLevel = ig.game.playerStats.currentLevel; 	// this is the level we just left
			//ig.game.playerStats.currentLevel = destinationLevel					// this is the new level we're enetering
			//alert("Leaving beautiful " + ig.game.playerStats.lastLevel + ", entering lovely " + ig.game.playerStats.currentLevel)
			ig.game.loadLevelDeferred( ig.global['Level'+destinationLevel] );


			if ( this.spawnpoint ){
				ig.game.spawnpoint = this.spawnpoint; // if this instance of level change has a spawn point, put player there, otherwise put where weltmeister layout has player
			}

		}
	},

	update: function(){}
});

});
