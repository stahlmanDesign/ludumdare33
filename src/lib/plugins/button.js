// A Button Entity for Impact.js
ig.module('plugins.button').requires('impact.entity').defines(function() {
	Button = ig.Entity.extend({
		size: {
			x: 76,
			y: 24
		},
		altText: [],
		useAltText:false,
		text: [],
		textPos: {
			x: 37,
			y: 8
		},
		name:null,
		textAlign: ig.Font.ALIGN.CENTER,
		font: null,
		animSheet: new ig.AnimationSheet('media/button.png', 75, 23),
		state: 'idle',
		topMenu: {
			"isTopMenu": false,
			"offset": {
				"x": 0,
				"y": 0
			}
		},

		_oldPressed: false,
		_startedIn: false,
		_actionName: 'click',
		killed:false,
		init: function(x, y, settings) {
			this.parent(x, y, settings);
			this.addAnim('idle', 1, [0]);
			this.addAnim('active', 1, [1]);
			this.addAnim('deactive', 1, [2]);
			if (this.text.length > 0 && this.font === null) {
				if (ig.game.buttonFont !== null) this.font = ig.game.buttonFont;
				else console.error('If you want to display text, you should provide a font for the button.');
			}

			// save buttons in array to do special draw on top of all other layers
			if (ig.game.entitiesOnTop) ig.game.entitiesOnTop.push(this);
			if (ig.game.buttons) ig.game.buttons.push(this);

			//console.log(settings)
			if (settings.topMenu){

				if (settings.topMenu.isTopMenu) {

					this.topMenu.isTopMenu = true;
					this.topMenu.offset.x = settings.topMenu.offset.x;
				}
			}


		},
		update: function() {

			if (this.state !== 'hidden') {

				var _clicked = ig.input.state(this._actionName);
				if (!this._oldPressed && _clicked && this._inButton()) {
					this._startedIn = true;
				}
				if (this._startedIn && this.state !== 'deactive' && this._inButton()) {
					if (_clicked && !this._oldPressed) { // down
						this.setState('active');
						this.pressedDown();
					} else if (_clicked) { // pressed
						this.setState('active');
						this.pressed();
					} else if (this._oldPressed) { // up
						this.setState('idle');
						this.pressedUp();
					}
				} else if (this.state === 'active') {
					this.setState('idle');
				}
				if (this._oldPressed && !_clicked) {
					this._startedIn = false;
				}
				this._oldPressed = _clicked;
			}

			if (this.topMenu.isTopMenu){
				this.pos.x = ig.game.screen.x + this.topMenu.offset.x;
				this.pos.y = ig.game.screen.y + this.topMenu.offset.y;
			}

		},
		draw: function(reallyDraw) {
		// reallyDraw means draw on top of all layers, this entity only
			if (this.state !== 'hidden' && reallyDraw && !this.killed) {
				this.parent();
				var textToRender = this.text;
				if (this.altText && this.useAltText) textToRender = this.altText;
				if (this.font !== null) {
					for (var i = 0; i < this.text.length; i++) {
						this.font.draw(
						textToRender[i], this.pos.x + this.textPos.x - ig.game.screen.x, this.pos.y + ((this.font.height + 2) * i) + this.textPos.y - ig.game.screen.y, this.textAlign);
						//Math.floor(ig.input.mouse.y + ig.game.screen.y)+" "+Math.floor(this.pos.y), this.pos.x + this.textPos.x - ig.game.screen.x, this.pos.y + ((this.font.height + 2) * i) + this.textPos.y - ig.game.screen.y, this.textAlign);
						//Math.floor(ig.game.screen.x)+ " "+Math.floor(ig.game.screen.y), this.pos.x + this.textPos.x - ig.game.screen.x, this.pos.y + ((this.font.height + 2) * i) + this.textPos.y - ig.game.screen.y, this.textAlign);
					}
				}
			}
		},
		setState: function(s) {
			this.state = s;
			if (this.state !== 'hidden') {
				this.currentAnim = this.anims[this.state];
			}
		},
		pressedDown: function() {},
		pressed: function() {},
		pressedUp: function() {},
		_inButton: function() {
			return ig.input.mouse.x + ig.game.screen.x > this.pos.x && ig.input.mouse.x + ig.game.screen.x < this.pos.x + this.size.x && ig.input.mouse.y + ig.game.screen.y > this.pos.y && ig.input.mouse.y + ig.game.screen.y < this.pos.y + this.size.y;
		}
	});
});