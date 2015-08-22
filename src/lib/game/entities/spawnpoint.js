ig.module(
	'game.entities.spawnpoint'
	)
.requires(
	'impact.entity'
)
.defines(function(){
	EntitySpawnpoint = ig.Entity.extend({

		_wmDrawBox:true,						// show somebaseitem in weltmeister even though has no sprite sheet in game
		_wmBoxcolor: 'rgba(0,0,255,0.7)',		// a blue coloured box
		_wmScalable: true,
		size:{x:8,y:8},							// of size 8 x 8
		update: function(){},					// override update() so we are not spending render cycles trying to draw an entity with no graphics


	});
});
