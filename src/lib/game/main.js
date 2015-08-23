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

		gameStats:{
			player:{
				health:3,
				deaths:0
			},
			jack:{
				deaths:0,
				stoleItem:{ // meaning is a house
					coin:false,
					goose:false,
					harp:false,
				}
			}
		},
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

		update: function() {

			// camera follow player
			if( ig.game.player ) {
				this.screen.x = ig.game.player.pos.x - ig.system.width/2;
				this.screen.y = ig.game.player.pos.y - ig.system.height/2;
			}
			if (ig.input.state('pause')){
				ig.game.paused == true ? ig.game.unpause() : ig.game.pause(); // toggle pause game
			}

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

/*
			//console.log(ig.game.entitiesOnTop.length)
			for (var i = 0; i < ig.game.entitiesOnTop.length; i++) {
				ig.game.entitiesOnTop[i].draw(true)
			}
			// Draw the heart and number of coins in the upper left corner.
			// 'this.player' is set by the player's init method
			if (ig.game.player) {
				var x = 56,
					y = 30;
				// draw HUD inventory items
				var spriteSize = 0;

				if (ig.game.playerStats.currentLevel != "Title"){	// don't show some things on title screen
					ig.game.buttonFont.draw("Wisdom", x, y, ig.Font.ALIGN.RIGHT);
					ig.system.context.fillStyle = "#D2FFFE"; // cyan
					ig.system.context.fillRect(x+4,y,ig.game.getInventory("player", "wisdom").quantity*1,6);

					y += 10;

					ig.game.buttonFont.draw("Spirit", x, y, ig.Font.ALIGN.RIGHT);
					var ctx = ig.system.context;
					ig.system.context.fillStyle = "#F7989B"; // red
					ig.system.context.fillRect(x+4,y,ig.game.getInventory("player", "spirit").quantity*1,6);
				    //ctx.fillRect(x,y,x+45,y+5);

					y += 10;

					ig.game.buttonFont.draw("Courage", x, y, ig.Font.ALIGN.RIGHT);
					var ctx = ig.system.context;
					ig.system.context.fillStyle = "#FDFF9E"; // yellow
					ig.system.context.fillRect(x+4,y,ig.game.getInventory("player", "courage").quantity*1,6);

					x += 24;

					//if (ig.game.timeElapsed.game > 0){
						y += 16;
						if (ig.game.getInventory("piper","clarinet").quantity == 0 ) ig.game.buttonFont.draw("Elapsed: " + new Date(null, null, null, null, null, ig.game.timeElapsed.game).toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0], x, y, ig.Font.ALIGN.RIGHT);
						else 														 ig.game.buttonFont.draw("Elapsed: " + new Date(null, null, null, null, null, ig.game.playerStats.timeElapsed.game).toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0], x, y, ig.Font.ALIGN.RIGHT);
					//}
				}else{
					ig.game.buttonFont.draw(ig.game.version, x-12, y, ig.Font.ALIGN.RIGHT);
				}
				y -= 18;
				if (ig.game.playerStats.currentLevel != "Title"){	// don't show some things on title screen
					for (var i = 0; i < ig.game.inventory.player.length; i++) {
						if (ig.game.inventory.player[i].quantity > 0) {
							if (ig.game.inventory.player[i].item == "musicalnotes") {
								spriteSize = 12;
							} else {
								spriteSize = 24;
							}
							if (ig.game.inventory.player[i].item == "curiosity" ||
								ig.game.inventory.player[i].item == "gamevictory"||
								ig.game.inventory.player[i].item == "wisdom"||
								ig.game.inventory.player[i].item == "spirit"||
								ig.game.inventory.player[i].item == "courage"
								) { // this is for internal use, or does not need to draw icon in inventory. curiosity is so Una will give an item just on initial player contact.
								// do nothing...
							} else {
								x += 12; // advance drawing order for sprite graphic
								var icon = ig.game.inventory.player[i].icon;
								var spritePosition = ig.game.inventory.player[i].spritePosition;
								ig.game[icon].drawTile(x, y - 16, spritePosition, spriteSize); // We  want to draw the 255th tile of game sprite-sheet (255 = spritePosition)
								x += spriteSize; // advance drawing order some more for count
								if (ig.game.inventory.player[i].item == "countdown") {

									var seconds = ig.game.danteSecondsLeft();

									ig.game.buttonFont.draw("Time\nleft\n" + new Date(null, null, null, null, null, (seconds)).toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0], x, y - 12);
								} else ig.game.buttonFont.draw('x ' + ig.game.inventory.player[i].quantity, x, y - 12);
								x += spriteSize;
							}
						}
					}
				}
			}
			// Draw touch buttons, if we have any -- buttons A and B
			if (window.myTouchButtons) {
				window.myTouchButtons.align();
				window.myTouchButtons.draw();
				ig.game.joystick.draw();
			}
*/
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