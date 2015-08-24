ig.module(
	'game.main'						// Namespace of the game. Defines class name and filename
)
.requires(							// As of version 1.19 you no longer have to add each entity to your game's requires block. They are loaded when level is loaded
	'impact.game',					// Tell game which classes are needed. Our main class inherets from the Game glass
	'impact.font',					// Font class used to instantiate a font.
	'impact.timer',

	'plugins.impact-splash-loader',
	'plugins.button',				// Button plugin https://gist.github.com/Houly/1395616/
	'plugins.fade-entity',			// Makes an entity fade into the game, and optionally fade out

	'game.system.eventChain',		// for walking around, pausing, rabbits digging etc. https://github.com/drhayes/impactjs-eventchain
	'game.entities.ladder',			// custom plugin changed for beanstalks

	'game.entities.spawnpoint',		// to put player back if dies

	//'game.levels.title',			// credits, story, instructions etc.
	'game.levels.main',				// the main  map

	'impact.debug.debug'			// Include debugger

)
.defines(function() { 				// Everybaseitem in defines() is the game logic
	feefifofum = ig.Game.extend({

		gravity: 1000,				// All entities affected by this. Without this, entities don't fall

		gameStats: {
			level: {
				number: 1,
				"1": {
					jacksInLevel: 1,
					jacksKilled:0
				},
				"2": {
					jacksInLevel: 2,
					jacksKilled:0
				},
				"3": {
					jacksInLevel: 4,
					jacksKilled:0
				},
				"4": {
					jacksInLevel: 6,
					jacksKilled:0
				},
				"5": {
					jacksInLevel: 8,
					jacksKilled:0
				},
				"6": {
					jacksInLevel: 8,
					jacksKilled:0
				}
			},
			player: {
				lives: 3,
				deaths: 0
			},
			jacks: {
				lives: 1,
				deaths: 0,
				stolenItem: { // meaning is a house
					coin: false,
					goose: false,
					harp: false,
				}
			}
		},

		// HUD icons, will define coordinates in atlas later
		playerIcon: 		new ig.Image('media/playerIcon.png'),
		jackIcon: 			new ig.Image('media/jackIcon.png'),
		coinIcon: 			new ig.Image('media/coinIcon.png'),
		gooseIcon: 			new ig.Image('media/gooseIcon.png'),
		harpIcon: 			new ig.Image('media/harpIcon.png'),


		pause: function() {
			ig.Timer.timeScale = 0;
			ig.game.paused = true;
		},
		unpause: function() {
			ig.Timer.timeScale = 1;
			ig.game.paused = false;
		},


		buttonFont: new ig.Font('media/outlinedfont.png'),
		init: function() {
			ig.game.buttonFont.letterSpacing = -1; // because added black outline around font

			// Bind keys, gamepad and tactile input
			ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
			ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
			ig.input.bind(ig.KEY.UP_ARROW, 'up');
			ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
			ig.input.bind(ig.KEY.X, 'jump');
			ig.input.bind(ig.KEY.P, 'pause');

			ig.input.bind(ig.KEY.MOUSE1, 'click');				// required for button to be clickable

			ig.game.loadLevel(ig.global['Level' + 'Main']);
		},

		loadLevel: function(data) {
			// Call the parent implemenation; this renders the level, background maps and entities.
			ig.game.parent(data);
		},

		pause: function()
		{
		  ig.Timer.timeScale = 0;
		  ig.game.paused = true;
		},
		unpause: function()
		{
		  ig.Timer.timeScale = 1;
		  ig.game.paused = false;
		},
		gameOver:function(){
			ig.game.pause();
			ig.game.gameIsOver = true;
		},
		update: function() {

			// camera follow player
			if( ig.game.player ) {
				this.screen.x = ig.game.player.pos.x - ig.system.width/2;
				this.screen.y = ig.game.player.pos.y - ig.system.height/2;
			}
			if (ig.input.state('pause')){
				ig.game.paused == true ? ig.game.unpause() : ig.game.pause(); // toggle pause game
			}

			if (ig.game.gameStats.jacks.stolenItem.coin == true && ig.game.gameStats.jacks.stolenItem.goose ==true && ig.game.gameStats.jacks.stolenItem.harp ==true) ig.game.gameOver();
			// Update all entities and BackgroundMaps
			this.parent();
		},
		isInt: function(x){
			var y = parseInt(x, 10);
			return !isNaN(y) && x == y && x.toString() == y.toString();
		},
		newGame: function(){
			ig.game.init();
		},
		draw: function() {
			// Call the parent implementation to draw all Entities and BackgroundMaps
			this.buttonFont.draw("as;dlkfj\nasl;kdfj;alksd\njf;lak jsd;l\nfkj as;lkdfj a\nl;skdjf a;lkdjs",0,0,ig.Font.ALIGN.RIGHT)
			this.parent();
			// Call draw() on your special entity with the extra
			// parameter added

			//console.log(ig.game.entitiesOnTop.length)

			// Draw the heart and number of coins in the upper left corner.
			// 'this.player' is set by the player's init method
			if (ig.game.player) {
				var x = 10,
					y = 10;

				// draw HUD inventory items

				if (ig.game.gameIsOver){
					ig.game.buttonFont.draw("GAME OVER! YOU GOT TO LEVEL " + ig.game.gameStats.level.number, x, y, ig.Font.ALIGN.LEFT);
				}else{
					ig.game.buttonFont.draw("SQUASH JACK and his clones before they steal your treasure, but BUT DON'T FALL OFF THE BEANSTALK\Arrow keys to MOVE, CLIMB, FALL THROUGH CLOUDS, & X to JUMP (to squash)", x, y, ig.Font.ALIGN.LEFT);
				}
				y += 22;

				ig.game.buttonFont.draw("Level: " + ig.game.gameStats.level.number + " Lives left: ", x, y, ig.Font.ALIGN.LEFT);
				// look X num times depending on giant lives left to draw how many lives left upper-right HUD
				for (var i = 0; i < ig.game.gameStats.player.lives; i ++ ){
					var icon = ig.game.playerIcon;
					var spritePosition = 0;
					var spriteSize = 24;
					icon.drawTile(x, y, spritePosition, spriteSize);
					x += 24;
				}
				x -= 24 * ig.game.gameStats.player.lives; // move "cursor" back to left

				y += 32;

				ig.game.buttonFont.draw("Num. Jacks to squash this level: "+ig.game.gameStats.jacks.lives+ "      Total of " + ig.game.gameStats.jacks.deaths + " squashed so far!", x, y, ig.Font.ALIGN.LEFT);
				//ig.system.context.fillStyle = "#D2FFFE"; // cyan
				//ig.system.context.fillRect(x+4,y,20,6);

				y += 6;

				for (var i = 0; i < ig.game.gameStats.jacks.lives; i ++ ){
					var icon = ig.game.jackIcon;
					var spritePosition = 0;
					var spriteSize = 24;
					icon.drawTile(x, y, spritePosition, spriteSize);
					x += 24;
				}
				x -= 24 * ig.game.gameStats.jacks.lives; // move "cursor" back to left

				y += 32;

				ig.game.buttonFont.draw("Treasure remaining:", x, y, ig.Font.ALIGN.LEFT);
				//ig.system.context.fillStyle = "#D2FFFE"; // cyan
				//ig.system.context.fillRect(x+4,y,20,6);

				y += 12;
				if (ig.game.gameStats.jacks.stolenItem.coin == false){
					var icon = ig.game.coinIcon;
					var spritePosition = 0;
					var spriteSize = 24;
					icon.drawTile(x, y, spritePosition, spriteSize);
					x += 24;
				}
				if (ig.game.gameStats.jacks.stolenItem.goose == false){
					var icon = ig.game.gooseIcon;
					var spritePosition = 0;
					var spriteSize = 24;
					icon.drawTile(x, y, spritePosition, spriteSize);
					x += 24;
				}
				if (ig.game.gameStats.jacks.stolenItem.harp == false){
					var icon = ig.game.harpIcon;
					var spritePosition = 0;
					var spriteSize = 24;
					icon.drawTile(x, y, spritePosition, spriteSize);
					x += 24;
				}
			}
		}

	});

	// If our screen is smaller than 640px in width (that's CSS pixels), we scale the
	// internal resolution of the canvas by 2. This gives us a larger viewport and
	// also essentially enables retina resolution on the iPhone and other devices
	// with small screens.
	//var scale = (window.innerWidth < 640) ? 2 : 1;
	var scale = (window.innerWidth < 640) ? 1 : 0.5; // Modif to make pixelated
	// We want to run the game in "fullscreen", so let's use the window's size
	// directly as the canvas' style size.
	var canvas = document.getElementById('canvas');
	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';
	// Listen to the window's 'resize' event and set the canvas' size each time
	// it changes.
	window.addEventListener('resize', function() {
		// If the game hasn't started yet, there's nothing to do here
		if (!ig.system) {
			return;
		}
		// Resize the canvas style and tell Impact to resize the canvas itself;
		canvas.style.width = window.innerWidth + 'px';
		canvas.style.height = window.innerHeight + 'px';
		ig.system.resize(window.innerWidth * scale, window.innerHeight * scale);
		// Re-center the camera - it's dependend on the screen size.
		if (ig.game && ig.game.setupCamera) {
			ig.game.setupCamera();
		}
		// Also repositon the touch buttons, if we have any
		if (window.myTouchButtons) {
			window.myTouchButtons.align();
		}
	}, false);

	// Finally, start the game and use the ImpactSplashLoader plugin as our loading screen
	var width = window.innerWidth * scale,
		height = window.innerHeight * scale;
	ig.main('#canvas', feefifofum, 60, width, height, 1, ig.ImpactSplashLoader);
});