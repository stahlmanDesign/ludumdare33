ig.module(
	'game.main'						// Namespace of the game. Defines class name and filename
)
.requires(							// As of version 1.19 you no longer have to add each entity to your game's requires block. They are loaded when level is loaded
	'impact.game',					// Tell game which classes are needed. Our main class inherets from the Game glass
	'impact.font',					// Font class used to instantiate a font.
	'impact.timer',

	'plugins.camera',				// UI components
	'plugins.touch-button',			// for tactile devices
	'plugins.impact-splash-loader',
	'plugins.gamepad',				// for tactile devices
	'plugins.imageblender',			// plugin to change tint // https://github.com/deakster/impact-imageblender
	'plugins.button',				// Button plugin https://gist.github.com/Houly/1395616/
	'plugins.impact-storage',		// local storage plugin for saving game
	'plugins.analog-stick',			// touch-screen 'joystick'
	'plugins.fade-entity',			// Makes an entity fade into the game, and optionally fade out
	'plugins.rotate-entity',

	'game.entities.basecharacter',	// most characters extend this
	'game.entities.baseitem',		// most items extend this
	'game.system.eventChain',		// for walking around, pausing, rabbits digging etc. https://github.com/drhayes/impactjs-eventchain



	'game.entities.spawnpoint',		// to put player back in hammock if dies, or when transitioning from different levels

	//'game.levels.title',			// credits, story, instructions etc.
	'game.levels.main',				// the main world map

	'impact.debug.debug'			// Include debugger

)
.defines(function() { 				// Everybaseitem in defines() is the game logic
	feefifofum = ig.Game.extend({
		gravity: 600,				// All entities affected by this. Without this, entities don't fall

		buttonFont: new ig.Font('media/outlinedfont.png'),
		init: function(levelToStart) {
/*

			// Bind keys, gamepad and tactile input
			ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
			ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
			ig.input.bind(ig.KEY.UP_ARROW, 'up');
			ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
			ig.input.bind(ig.KEY.X, 'jump');
			ig.input.bind(ig.KEY.C, 'throw');

			ig.input.bind(ig.KEY.MOUSE1, 'click');				// required for button to be clickable

			ig.input.bind(ig.GAMEPAD.PAD_LEFT, 'left');
			ig.input.bind(ig.GAMEPAD.PAD_RIGHT, 'right');
			ig.input.bind(ig.GAMEPAD.PAD_UP, 'up');
			ig.input.bind(ig.GAMEPAD.PAD_DOWN, 'down');
			ig.input.bind(ig.GAMEPAD.FACE_1, 'jump');
			ig.input.bind(ig.GAMEPAD.FACE_2, 'throw');
			//ig.input.bind(ig.GAMEPAD.FACE_3, 'load');

			var joystickBaseSettings = {
				"baseSize": ig.system.height/10,		// 60
				"stickSize": ig.system.height/20,		// 30
				"margin": ig.system.height/30			// 20
			}
			//console.log("ig.system.height = " + ig.system.height + ", ig.system.width = " + ig.system.width);

			var joystickCalcutaledVals = {
				"y": ig.system.height - joystickBaseSettings.baseSize - joystickBaseSettings.margin,
				"x1": 					joystickBaseSettings.baseSize - joystickBaseSettings.margin + 40,
				"x2": ig.system.width - joystickBaseSettings.baseSize - joystickBaseSettings.margin
			}

			ig.game.joystick = new ig.AnalogStick(
				joystickCalcutaledVals.x1,
				joystickCalcutaledVals.y,
				joystickBaseSettings.baseSize,
				joystickBaseSettings.stickSize
			);

			// add game music and set volume, looping params
			this.themeSong.name = "theme";
			this.slowSong.name = "slow";
			this.whale.name = "whale";
			this.cave.name = "cave";
			this.kansas.name = "kansas";

			ig.music.add(this.themeSong, "theme");
			ig.music.add(this.slowSong, "slow");
			ig.music.add(this.whale, "whale");
			ig.music.add(this.cave, "cave");
			ig.music.add(this.kansas, "kansas");
			//ig.music.volume = 0.5;
			ig.music.loop = true;

			ig.game.buttonFont.letterSpacing = -1; // because added black outline around font

			ig.game.storage = new ig.Storage();		// new instance of impact storage plugin https://github.com/datamosh/ImpactStorage

			// add a method to turn a layer (hiddenInteriors) on or off during the game. It is used here to turn on layers that hide interiors when you go inside a cave
			ig.BackgroundMap.inject({
				visible: true,
				draw: function() {
					if (!this.visible) return;
					this.parent();
				}
			});

			// This is for tactile joystick
			ig.Input.inject({
				trigger: function(action) {
					this.actions[action] = true;
					this.presses[action] = true;
					this.delayedKeyup[action] = true;
				}
			});


			if (levelToStart == undefined) levelToStart = ig.game.playerStats.mainMenuLevel;	// external config-like JSON file

			ig.game.loadLevel(ig.global['Level' + levelToStart]);
*/
			ig.game.loadLevel(ig.global['Level' + 'Main']);
			// end init()
		},

		loadLevel: function(data) {
			// Call the parent implemenation; this renders the level, background maps and entities.
			console.log(data)
			ig.game.parent(data);

/*
			ig.game.setupCamera();	// used to keep player in middle of screen and move map

			for (var i = 0; i < ig.game.backgroundMaps.length; i++) {
				var bgmap = ig.game.backgroundMaps[i];
				if (bgmap.name == "hiddenInteriors") ig.game.hiddenInteriors = bgmap; // keep a reference to the layer hiddenInteriors in the Worldmap

			}
*/

		},
		setupCamera: function() {
			// Set up the camera. The camera's center is at a third of the screen
			// size, i.e. somewhat shift left and up. Damping is set to 3px.
			this.camera = new ig.Camera(ig.system.width / 2.25, ig.system.height / 3, 3);
			// The camera's trap (the deadzone in which the player can move with the
			// camera staying fixed) is set to according to the screen size as well.
			this.camera.trap.size.x = ig.system.width / 10;
			this.camera.trap.size.y = ig.system.height / 3;
			// The lookahead always shifts the camera in walking position; you can
			// set it to 0 to disable.
			this.camera.lookAhead.x = ig.system.width / 12; // was 6
			// Set camera's screen bounds and reposition the trap on the player
			this.camera.max.x = this.collisionMap.pxWidth - ig.system.width;
			this.camera.max.y = this.collisionMap.pxHeight - ig.system.height;
			this.camera.set(this.player);
		},
		reloadLevel: function() {
			this.loadLevelDeferred(this.currentLevelData);
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
		loadOrSaveNumberOrCancel: function(keypress){

			if (ig.game.loading) {
				//console.log("loading = " + keypress);
				if (keypress == 'esc'){
					console.log("cancel loading")
					ig.game.removeLoadOrSaveButtons(function(){
						ig.game.unpause(); // this UNpauses the game cause it's a toggle function
						ig.game.loading = false; // we've cancelled so no longer loading
						return;
					});
				}
			}else
			if (ig.game.saving){
				//console.log("saving = " + keypress);
				if (keypress == 'esc'){
					console.log("cancel saving")
					ig.game.removeLoadOrSaveButtons(function(){
						ig.game.unpause(); // this UNpauses the game cause it's a toggle function
						ig.game.saving = false; // we've cancelled so no longer loading
						return;
					});
				}
			}

			ig.game.removeLoadOrSaveButtons(function(){
				if (ig.game.saving) {
					ig.game.saveGameSlot(keypress*1); // cast as number
				}
				if (ig.game.loading) {
					ig.game.loadGameSlot(keypress*1); // cast as number
				}
			});
		},
		update: function() {
			//console.log(ig.game.playerStats.currentLevel)

			//ig.show("dt", Math.round(ig.game.timer.dante.delta()) );

			if (ig.input.pressed("new")) this.newGame();
			if (ig.input.pressed("save")) this.saveGame();
			if (ig.input.pressed('load')) this.loadGame();
			if (ig.input.pressed('1')) this.loadOrSaveNumberOrCancel('1');
			if (ig.input.pressed('2')) this.loadOrSaveNumberOrCancel('2');
			if (ig.input.pressed('3')) this.loadOrSaveNumberOrCancel('3');
			if (ig.input.pressed('esc')) this.loadOrSaveNumberOrCancel('esc');
			if (ig.input.pressed("pause")) this.pause(); // pause whole game
			if (ig.input.pressed("unpause")) this.unpause(); // unpause whole game

/*
			if 		(ig.game.joystick.input.x < -0.25) ig.input.trigger('left')
			else if (ig.game.joystick.input.x > 0.25) ig.input.trigger('right')
			if 		(ig.game.joystick.input.y < -0.25) ig.input.trigger('up')
			else if (ig.game.joystick.input.y > 0.25) ig.input.trigger('down')
*/
			//if 		(!ig.global.wm) ig.show("fish", this.gameFish.length)


			// Camera follows the player
			//this.camera.follow(this.player);
			// Instead of using the camera plugin, we could also just center
			// the screen on the player directly, like this:
			// this.screen.x = this.player.pos.x - ig.system.width/2;
			// this.screen.y = this.player.pos.y - ig.system.height/2;

/*
			var wisdom = ig.game.getInventory("player","wisdom");
			var courage = ig.game.getInventory("player","courage");
			var spirit = ig.game.getInventory("player","spirit");

			// if player "dies" just transport back to beginning of main level
			if (spirit.quantity < 1) {

				wisdom.quantity < 30 ? wisdom.quantity++ : wisdom.quantity = 30; // wisdom grows with each death
				spirit.quantity = 1; // having rested set it to 3

				this.playerStats.message = "You were found unconscious\nSadder and wiser..."
				this.playerStats.currentLevel = this.playerStats.worldLevel; // this makes sure fog of war is not on
				this.spawnpoint = "hammock"; // if this instance of level change has a spawn point, put player there, otherwise put where weltmeister layout has player
				this.loadLevelDeferred(ig.global['Level' + this.playerStats.worldLevel]);
			}

			// I think this fixes player being in front of s
			if (Math.random() > .99) {
				this.player.zIndex = 1;
				this.sortEntitiesDeferred();
				//console.log(ig.game.joystick.input)
				//console.log("player = " + ig.game.player.zIndex)
				//console.log("EntityLadder = " + ig.game.getEntitiesByType("EntityLadder")[0].zIndex)
			}

			// this ensures game timer and dante timer unpause after load or save, basically as long as game is being played ...
			if (!ig.game.saving || !ig.game.loading){ // if game not paused at dialog prompt

				// ...unless these conditions
				if (ig.game.playerStats.piperDefeated || ig.game.playerStats.gameOver) ig.game.timer.game.pause();
				else{
					if (ig.game.getInventory("player","countdown").quantity > 0 )
					ig.game.timeElapsed.dante = Math.round(ig.game.timer.dante.delta()) + ig.game.playerStats.timeElapsed.dante;
						//Math.round(ig.game.timer.game.delta()) + ig.game.playerStats.secondsDanteAllows - ig.game.playerStats.timeElapsed.dante // ig.game.playerStats.timeElapsed.game ;//- ig.game.playerStats.timeDanteCountdownBegan;
					ig.game.timeElapsed.game =  Math.round(ig.game.timer.game.delta()) + ig.game.playerStats.timeElapsed.game;
				}
			}

			// dante timer is up! game over!

			var seconds = ig.game.danteSecondsLeft();
			//console.log(ig.game.playerStats.gameOver);
			if (seconds <= 0 && !ig.game.playerStats.gameOver && !ig.game.loading && !ig.game.saving && ig.game.getInventory("player","countdown").quantity > 0 ){
				//alert("going to assign game over message")
				ig.game.playerStats.message = "GAME OVER\nDante: Your time is up!\nYou failed to give the clarinet to\nthe piper... Your soul is mine forever!";
				ig.game.playerStats.gameOver = true;
				ig.game.playerStats.currentLevel = ig.game.playerStats.worldLevel; // this makes sure fog of war is not on
				//console.log("set level to world level");
				ig.game.spawnpoint = "underworldJail"; // if this instance of level change has a spawn point, put player there, otherwise put where weltmeister layout has player
				ig.game.loadLevelDeferred(ig.global['Level' + ig.game.playerStats.worldLevel]);
			}
*/

			// Update all entities and BackgroundMaps
			this.parent();
/*

			// slowly adjust wisdom, spirit and courage
			// increase wisdom once a minute
			var timeDividedBySomeFactor = Math.round(ig.game.timer.game.delta()) / 60; // this factor changes wisdom generation. lower number = faster. 60 means wisdom increases 1 pixel a minute

			if (this.isInt(timeDividedBySomeFactor) && timeDividedBySomeFactor != this.lastValidIntegerForGameTimerDividedBySomeFactor) {
				this.lastValidIntegerForGameTimerDividedBySomeFactor = timeDividedBySomeFactor;

				if (wisdom.quantity < 30) wisdom.quantity +=1; // increase wisdom but only once a minute

				if (Math.random() * 25 < wisdom.quantity) courage.quantity += 1; // high wisdom increases courage
				if (Math.random() * 25 > courage.quantity) spirit.quantity -= 1; // low courage drains spirit
				else spirit.quantity += 1; // high courage generates spirit
			}
			if (wisdom.quantity > 30) wisdom.quantity = 30;
			if (spirit.quantity > 30) spirit.quantity = 30;
			if (courage.quantity > 30) courage.quantity = 30;
			if (courage.quantity < 0) courage.quantity = 0;	// don't let it go below zero
			if (spirit.quantity < 0) spirit.quantity = 0;
*/


		},
		isInt: function(x){
			var y = parseInt(x, 10);
			return !isNaN(y) && x == y && x.toString() == y.toString();
		},
		updateEntityInfoCurrentLevel: function() {
			var entityInfoCurrentLevel = []; // array inside of ig.game.playerStats["Worldmap"]
			for (var i in ig.game.entities) {
				var ent = ig.game.entities[i];
				if (ent.name != undefined && ent.name.indexOf("savegame") == -1 && ent.name != "cancel") { // don't save unnamed entities or the entities buttons for saving in slots or the cancel button
					//if (ent.name == "spirit") console.log("saved a spirit");
					var namedEntity = {
						"name": ent.name,
						// if entity has a name, save its position
						"pos": {
							"x": Math.round(ent.pos.x),
							"y": Math.round(ent.pos.y)
						}
					}
					entityInfoCurrentLevel.push(namedEntity); // each level will have saved positions of named entities
				}
			}
			ig.game.playerStats.entityInfo[ig.game.playerStats.currentLevel] = entityInfoCurrentLevel;
		},
		newGame: function(){

			// assume starting at title screen and thereforce paused
			ig.game.timer.dante.reset();
			ig.game.timer.game.reset();

			ig.game.timer.dante.pause();

			ig.game.playerStats.gameOver = false;	// reset in case restarting from game over

			ig.game.inventory = ig.copy(gameInventory); //JSON.parse(JSON.stringify(gameInventory)); // reset all settings so we don't have the main menu messages from characters
			ig.game.playerStats = ig.copy(newGamePlayerStats); //JSON.parse(JSON.stringify(newGamePlayerStats)); // copy default settings because this is a brand new game
			ig.game.restoreEntitiesToSavedPositions = false;
			ig.game.restoreLoadedGamePositions = false;
			ig.game.player.asleep = true;

			//if (ig.game.playerStats.gameOver) ig.game.init(ig.game.playerStats.mainMenuLevel);	// start over and go to Title level because
			//else
			ig.game.init(ig.game.playerStats.worldLevel); // new game true
		},
		saveGame: function() {

			if (ig.game.saving || ig.game.playerStats.currentLevel == "Title") return; // don't allow saving if save slot buttons already visible or on title screen

			ig.game.saving = true;

			ig.game.changeMenuButtonVisibility("hidden");

			ig.game.pause(); // this pauses the game...

			var buttonsDTO = [{
				"name": "savegame3",
				"text": "Save in slot 3",
				"value": 3
			}, {
				"name": "savegame2",
				"text": "Save in slot 2",
				"value": 2
			}, {
				"name": "savegame1",
				"text": "Save in slot 1",
				"value": 1
			}];

			ig.game.spawnDialogButtons(buttonsDTO, "saving", false);

		},
		saveGameSlot: function(slotNum){

			ig.game.updateEntityInfoCurrentLevel();

			ig.game.playerStats.levelSpecific[ig.game.playerStats.currentLevel] = {
				"isDark": ig.game.playerStats.isDark

				//"currentTrackName": ig.game.playerStats.music.currentTrackName
			};

			ig.game.playerStats.message = "";
			ig.game.playerStats.message2 = ""; // don't save these messages because dispalying them upon load makes no sense. they should fade moments after they appear


			var savedTimeBeforeSave = ig.copy(ig.game.playerStats.timeElapsed); //JSON.parse(JSON.stringify(this.playerStats.timeElapsed));
			var timeElapsedBeforeSave = ig.copy(ig.game.timeElapsed); //JSON.parse(JSON.stringify(this.timeElapsed)); // stringify to copy object so it does not change

			ig.game.playerStats.timeElapsed = ig.game.timeElapsed;

			//console.log("saved music " + ig.game.playerStats.music.currentTrackName)
			//console.log("saved timeElapsed.game: " + ig.game.playerStats.timeElapsed.game);
			//console.log("saved timeElapsed.dante: " + ig.game.playerStats.timeElapsed.dante);

			//console.log("saveGame");
			//console.log(JSON.stringify(this.playerStats.timeElapsed));

			//this.storage.clear(); // Clears all localStorage data associated with this origin.

			ig.game.storage.set("playerStats"+slotNum, ig.game.playerStats);
			ig.game.storage.set("inventory"+slotNum, ig.game.inventory);

			setTimeout(function(){
				ig.game.saving = false; // allow saving again by pressing s or save button. avoid spawning slot buttons more than once
				ig.game.unpause(); // this UNpauses the game cause it's a toggle function
				ig.game.playerStats.timeElapsed = savedTimeBeforeSave;	// prevents time from growing super fast for some reason TODO figure out why
				//console.log("saving currentLevel = " + ig.game.playerStats.currentLevel)
			},200);
		},
		loadGame: function() {

			if (ig.game.loading) return; // don't disrupt save

			ig.game.loading = true;

			ig.game.changeMenuButtonVisibility("hidden");

			ig.game.pause(); // pause game while selecting save game slot;

			var buttonsDTO = [{
				"name": "loadgame3",
				"text": "Load game 3",
				"value": 3
			}, {
				"name": "loadgame2",
				"text": "Load game 2",
				"value": 2
			}, {
				"name": "loadgame1",
				"text": "Load game 1",
				"value": 1
			}];

			ig.game.spawnDialogButtons(buttonsDTO, "loading", false);

		},
		loadGameSlot: function(slotNum){
			//console.log("loading level before loaded = " + ig.game.playerStats.currentLevel)
			ig.game.clearStatsAndTimers();

			var ps = ig.game.storage.get("playerStats"+slotNum);
			var inv = ig.game.storage.get("inventory"+slotNum);

			//console.log("loading level right after load = " + ig.game.playerStats.currentLevel)
			setTimeout(function() {

				if (ps == null){
					alert("No saved game in slot "+slotNum);
					ig.game.loading = false; // attempt to load cancelled, allow load attempt next time
					return; // attempt to prevent loading when never have saved
				}
				ig.game.clearStatsAndTimers();
				ig.game.restoreLoadedGamePositions = true;
				ig.game.killButtons();

				ig.game.restoreEntitiesToSavedPositions = true;
				ig.game.playerStats = ps;
				ig.game.inventory = inv;

				//console.log("just loaded game, song should be : " + ig.game.playerStats.music.currentTrackName);
				//console.log("time elapsed game : " + ig.game.playerStats.timeElapsed.game);
				//console.log("time elapsed dante : " + ig.game.playerStats.timeElapsed.dante);
				//console.log(ig.game.playerStats);
				//console.log("loading level after setTimeout = " + ig.game.playerStats.currentLevel)
				ig.game.loadLevelDeferred(ig.global['Level' + ig.game.playerStats.currentLevel]);

				// timers

				if (ig.game.getInventory("player", "countdown").quantity > 0) ig.game.timer.dante.unpause();
				else ig.game.timer.dante.pause(); // console.log("player does not have dante's countdown?");

				ig.game.loading = false;

				ig.game.unpause(); // this UNpauses the game to un-freeze the loading buttons, even though the game will be loaded from previous state

				ig.game.timer.game.unpause();


			}, 500) // give it time to load cause no success callback for local storage
		},
		spawnDialogButtons: function(buttonsDTO, savingOrLoading, savingOrLoadingValue){

			var yStep = -33;
			var xPos = ig.game.player.pos.x-32;

			ig.game.spawnEntity("Button", xPos, ig.game.player.pos.y + yStep, {
				name: "cancel",
				text: ['Cancel'],
				buttonType: "dialog",
				pressedUp: function() {
					ig.game.removeLoadOrSaveButtons(function(){
						ig.game.unpause(); // this UNpauses the game cause it's a toggle function
						ig.game[savingOrLoading] = savingOrLoadingValue; // if not cancelling, ig.game.saving will be set to false after setTimeout for local storage to work

					});
				}
			});

			for (var i in buttonsDTO){
				yStep -= 30;

				ig.game.spawnEntity("Button", xPos, ig.game.player.pos.y + yStep, {
					name: buttonsDTO[i].name,
					text: [buttonsDTO[i].text],
					buttonSlotValue: buttonsDTO[i].value,
					buttonType: "dialog",
					pressedUp: function() {
						var self = this;
						ig.game.removeLoadOrSaveButtons(function(){
							if (savingOrLoading == "saving") {
								//console.log(self.buttonSlotValue)
								ig.game.saveGameSlot(self.buttonSlotValue);
							}
							if (savingOrLoading == "loading") {
								ig.game.loadGameSlot(self.buttonSlotValue);
							}
						});
					}
				});
			}
		},
		changeMenuButtonVisibility: function(hiddenOrVisible){

			for (var i in ig.game.entities){
				var ent = ig.game.entities[i];
				if (ent.buttonType){

					if (ent.buttonType != "dialog") {

						ent.setState(hiddenOrVisible); // show or hide
					}
				}
			}
		},
		removeLoadOrSaveButtons: function(callback){

			for (var i in ig.game.entities){
				var ent = ig.game.entities[i];
				if (ent.buttonType){
					if (ent.buttonType == "dialog") {
						ent.setState("hidden"); // because this plugin doesn't update normally and needs to be hidden before kill
						ent.kill();
					}
				}
			}
			ig.game.changeMenuButtonVisibility("idle"); // idle is animation name for visible button
			if (callback) callback();
		},
		clearStatsAndTimers: function(){
			ig.game.playerStats = ig.copy(newGamePlayerStats); //JSON.parse(JSON.stringify(newGamePlayerStats)); // set to defaults
			ig.game.inventory = ig.copy(gameInventory); //JSON.parse(JSON.stringify(gameInventory)); // set to defaults

			ig.game.timer.dante.set(0);
			ig.game.timer.game.set(0);

		},
		killButtons: function() {
			//console.log(ig.game.buttons)
			// this function needed because calling .kill() on button entity doesn't remove it immediately and it gets left drawn on canvas

			for (var i = ig.game.buttons.length - 1; i >= 0; i--) {

				ig.game.buttons[i].killed = true;
				ig.game.buttons[i].kill();
				ig.game.buttons.splice(i,1);
			}


			for (var i = ig.game.entitiesOnTop.length - 1; i >= 0; i--) {
				ig.game.entitiesOnTop[i].killed = true;
				ig.game.entitiesOnTop[i].kill();
				ig.game.entitiesOnTop.splice(i,1);
			}

		},
		draw: function() {
			// Call the parent implementation to draw all Entities and BackgroundMaps
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
		},
		danteSecondsLeft: function(){
			//console.log("ig.game.playerStats.secondsDanteAllows = " + ig.game.playerStats.secondsDanteAllows);
			//console.log("ig.game.timeElapsed.dante = " + ig.game.timeElapsed.dante);
			var res;
			if (ig.game.getInventory("piper", "clarinet").quantity == 0) res = ig.game.playerStats.secondsDanteAllows - ig.game.timeElapsed.dante;
			else res = ig.game.playerStats.secondsDanteAllows - ig.game.playerStats.timeElapsed.dante;

			//console.log(res);
			return res; // 300 is five minutes
		},
		updateGameBasedOnSavedInfo: function(){		// this waits for local storage to load and player to be spawned

			if (ig.game.restoreEntitiesToSavedPositions == false) return;

			if (ig.game.deleteEntitiesRemovedFromLevel) ig.game.deleteEntitiesRemovedFromLevel();

			var entityJustInit = {};
			var savedEntity = {};

			if (ig.game.playerStats.currentLevel == "Title") return;

			var i, ii = 0;

			for ( i = ig.game.playerStats.entityInfo[ig.game.playerStats.currentLevel].length -1; i >= 0; i--){

				savedEntity = ig.game.playerStats.entityInfo[ig.game.playerStats.currentLevel][i]; // player, balalaika
				//if (savedEntity.name == "lantern") console.log("lantern in saved memory = " + savedEntity.pos.x, savedEntity.pos.y);
				for ( ii = ig.game.entities.length - 1; ii >= 0 ; ii-- ){
					entityJustInit = ig.game.entities[ii];	// player, balalaika
					savedEntity.found = false;

					if (savedEntity.name == entityJustInit.name){
						entityJustInit.pos = savedEntity.pos;
						savedEntity.found = true;
						break;	// TODO this system only allows saving position of unique items, not multiple instances like spirit or birds.
					}
				}
				var capitalizedName = savedEntity.name.charAt(0).toUpperCase() + savedEntity.name.slice(1);
				var EntityName = "Entity" + capitalizedName

				if (savedEntity.found == false) {

					console.log(savedEntity.name + " was not already in world, must spawn = " + savedEntity.name)
					ig.game.spawnEntity(EntityName,savedEntity.pos.x,savedEntity.pos.y);
					console.log(EntityName + " pos restored");

				}
			}

			// restore items saved that need to be spawned because don't have default position in game world (like heart1 and heart2, and lantern, which only exist in character inventories)
			// TODO if entity saved but not found in level, that means it needs to be spawned -- wait but should always exist, just off map, to top. Easier that way
			//if (savedEntity.found == false) ig.game.spawnEntity(savedEntity)

			ig.game.playerStats.isDark = ig.game.playerStats.levelSpecific[ig.game.playerStats.currentLevel].isDark;
			//ig.game.playerStats.music.currentTrackName = ig.game.playerStats.levelSpecific[ig.game.playerStats.currentLevel].currentTrackName;
			//ig.music.play();
			ig.game.restoreEntitiesToSavedPositions = false; // because we've just done that

			var piper = ig.game.getEntitiesByType("EntityPiper")[0];
			if (piper != null && ig.game.getInventory("piper","clarinet").quantity > 0 ) piper.kill(); // don't want him to reappear if loading saved game after victory

		},


		deleteEntitiesRemovedFromLevel: function() {

			if (ig.game.playerStats.currentLevel == "Bedroom") return; // show all instruments in final bedroom level

			for (var i in ig.game.entities) {
				var ent = ig.game.entities[i];
				if (ent.name != undefined) {
					if (ent.name == "balalaika" && 	(ig.game.getInventory("player", "balalaika").quantity > 0 	|| ig.game.getInventory("una", "balalaika").quantity > 0)) ent.kill();
					if (ent.name == "drum" && 		(ig.game.getInventory("player", "drum").quantity > 0 		|| ig.game.getInventory("dante", "drum").quantity > 0)) ent.kill();
					if (ent.name == "clarinet" && 	(ig.game.getInventory("player", "clarinet").quantity > 0	|| ig.game.getInventory("piper", "clarinet").quantity > 0)) ent.kill();
				}
			}
		}
	});
	// The title screen is simply a Game Class itself; it loads the LevelTitle
	// runs it and draws the title image on top.

	if (ig.ua.mobile) {
		// If we're running on a mobile device and not within Ejecta, disable
		// sound completely :(
		if (!window.ejecta) {
			ig.Sound.enabled = false;
		}
		// Use the TouchButton Plugin to create a TouchButtonCollection that we
		// can draw in our game classes.
		// Touch buttons are anchored to either the left or right and top or bottom
		// screen edge.
		var buttonImage = new ig.Image('media/touch-buttons.png');
		setTimeout(function(){
			myTouchButtons = new ig.TouchButtonCollection([
			//new ig.TouchButton('left', {	left: 0,		bottom: 0		}, 128, 128, buttonImage, 0),
			//new ig.TouchButton('right', {	left: 128+40,	bottom: 0		}, 128, 128, buttonImage, 1),
			//new ig.TouchButton('up', {		left: 84,		bottom: 84		}, 128, 128, buttonImage, 4),
			//new ig.TouchButton('down', {	left: 64+20,	bottom: 0		}, 128, 128, buttonImage, 5),

			new ig.TouchButton('throw', {
				right: ig.system.width/5,		// 128
				bottom: 0
			}, 128, 128, buttonImage, 2), new ig.TouchButton('jump', {
				right: 0,
				bottom: ig.system.width/4		//96
			}, 128, 128, buttonImage, 3)]);
		},200)
	}
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