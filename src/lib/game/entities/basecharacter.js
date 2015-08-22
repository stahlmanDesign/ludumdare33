ig.module(
	'game.entities.basecharacter'
)
.requires(
	'impact.entity',
	'game.system.eventChain'		// event chain plugin https://github.com/drhayes/impactjs-eventchain
)
.defines(function(){

EntityBasecharacter = ig.Entity.extend({
	size: {
		x: 14,
		y: 32
	},
	offset: {
		x: 6,
		y: 16
	},
	maxVel: {
		x: 130,
		y: 150
	},
	friction: {
		x: 600,
		y: 0
	},
	jump: 80,
	type: ig.Entity.TYPE.A,	// Friendly or enemy group
	checkAgainst: ig.Entity.TYPE.BOTH,	// Check against
	collides: ig.Entity.COLLIDES.LITE,
	distanceToPlayerForMessage: 60,
	distanceToPlayerToStopAndListen: 30,

	health: 5,
	speed: 0,
	optionalSpeed: 0,
	flip: false,
	animSheet: new ig.AnimationSheet('media/ds_atlas.png', 24, 48),

	state: "idle",
	//name: "base basecharacter", // will be overridden
	messageFont: new ig.Font('media/outlinedfont.png'),
	message: "",
	flipTimer: null,
	chain: null,

	victory: false,
	mainmenu: false,
	basecharacterInventory:[],
	init: function(x, y, settings) {
		this.parent(x, y, settings);

		if (!ig.global.wm && settings.victory) {
			if (settings.victory == "true"){
				this.victory = true;
				ig.game.getInventory(this.name,"gamevictory").quantity += 1; // make each character begin with victory message instead of waiting for player to "deliver" it upon contact
				ig.game.getInventory("piper","clarinet").quantity = 0; // in the final victory level, if the piper has the clarinet, he spins away in defeat. On final levle we don't we want him there to deliver victory message
				if (ig.game.getInventory("player","moccasins").quantity < 1) ig.game.getInventory("player","moccasins").quantity = 1; // if game at victory, give mocassins so piper doesn't throw deadly musical notes and kill player when he has been defeated.

				this.distanceToPlayerForMessage = 200;
				this.distanceToPlayerToStopAndListen = 200;


			}
		}
		if (!ig.global.wm && settings.mainmenu) {

			if (settings.mainmenu == "true"){
				this.mainmenu = true;
				ig.game.getInventory(this.name,"mainmenu").quantity += 1; // make each character begin with victory message instead of waiting for player to "deliver" it upon contact
				//ig.game.getInventory("piper","clarinet").quantity = 0; // in the final victory level, if the piper has the clarinet, he spins away in defeat. On final levle we don't we want him there to deliver victory message
				//if (ig.game.getInventory("player","moccasins").quantity < 1) ig.game.getInventory("player","moccasins").quantity = 1; // if game at victory, give mocassins so piper doesn't throw deadly musical notes and kill player when he has been defeated.

				this.distanceToPlayerForMessage = 130;
				this.distanceToPlayerToStopAndListen = 50;


			}
		}
		this.startPosition = {
			x: x,
			y: y
		}

		this.chain = EventChain(this)
			.wait(1)
		    .then(function() {  // ...then spawn a baddie...
		        //ig.game.spawnEntity(EntitySeed, this.startPosition.x, this.startPosition.y);
		        this.state = "idle";
		      })
		    .wait(1)            // ...wait some more...
		    .then(function() {  // ...then spawn a lesser baddie...
			    this.state = "walk";
		      })
		    .wait(18)
		    .repeat();         // ...and repeat the whole baseitem forever.

		this.flipTimer = new ig.Timer(5); // only flip once a second to avoid frantic flipping in tight area
	},
	update: function() {
		//if (this.victory) console.log("victory for " + this.name + " amount = " + ig.game.getInventory(this.name,"gamevictory").quantity)
		this.chain(); // execute the event chain

		if (ig.game.player) {
			if (this.distanceTo(ig.game.player) < this.distanceToPlayerToStopAndListen ) {
				this.state = "idle"; // stop and pay attention to player
			}else{
				// carry on
			}
		}
		// toe about to step over an edge on next update?
		var toe = this.pos.y + this.size.y + 1
		if (!ig.game.collisionMap.getTile(this.pos.x + (this.flip ? +6 : this.size.x - 6), toe)) {
			// if walking on an entity or near an edge, flip if more than 1 second since last flip
			if ( this.flipTimer.delta() > 0	) {
				this.flip = !this.flip;
				this.flipTimer.reset();
			}
		}
		var xdir = this.flip ? -1 : 1;
		this.vel.x = this.speed * xdir * 1.5;

		if (this.state == "idle") {

				this.speed = 0;
				this.currentAnim = this.anims.idle;
				this.currentAnim.flip.x = this.flip; // sit still but in direction of last movement


		} else if (this.state == "walk" || this.state == "walkaway") {
			// ------------- walk -------------
			this.currentAnim = this.anims.walk;
			this.speed = this.optionalSpeed == 0 ? 40 : this.optionalSpeed; // if this.optionalSpeed is set, use that instead
			// seek player if close
			if (this.vel.x < 0) {
				this.flip = true
			} else {
				this.flip = false;
			}
			this.currentAnim.flip.x = this.flip;
		}
		this.currentAnim.flip.x = this.flip;
		this.parent();
	},
	draw: function(){

		this.parent();

		// show message. will be empty if not near player
		//var s = ig.system.scale;
		var s = ig.system.scale * 2; // modif because this game is upsampled for pixel look
		var x = this.pos.x * s - ig.game.screen.x * s;
		var y = (this.pos.y-65) * s - ig.game.screen.y * s;
		this.messageFont.draw(this.message, x/2, y/2, ig.Font.ALIGN.CENTER );
	},
	handleMovementTrace: function(res) {
		this.parent(res);
		//collision with a wall? return!
		if (res.collision.x) {
			this.flip = !this.flip;
			this.currentAnim.flip.x = this.flip;
		}
	},
	check: function(other){
		if (other instanceof EntityPlayer && this.covets){												// if touching player, except for jonah and crab which are TYPE.B
			//console.log(this.name)
			for (var c = 0; c < this.covets.length; c++){									// go through what basecharacter covets
				var playerItem = ig.game.getInventory(other.name,this.covets[c]);
				var basecharacterCovetedItem = ig.game.getInventory(this.name,this.covets[c]); // make sure to add this to inventory of basecharacter even if zero, so can acquire it
				var basecharacterOffer = ig.game.getInventory(this.name,this.offers[c]);

				if (playerItem.quantity > 0 && (basecharacterOffer.quantity > 0 || basecharacterOffer.item == "")){												// if player has that item in quantity > 0 ---- will fail if doesn't have that item
					//console.log(playerItem)
					basecharacterCovetedItem.quantity ++;						// increase basecharacterCovetedItem quantity

					if (basecharacterOffer.item != ""){
						playerItem.quantity --;	// decrease player quantity of that item, but not if offer is nothing
						//console.log(playerItem)
						for (var s=0; s < this.numOffer[c]; s++){
							//console.log(basecharacterOffer)
							ig.game.spawnEntity(basecharacterOffer.entity,this.pos.x + (Math.random()*20)-10,this.pos.y-(Math.random()*60)-20,{giverName:this.name, flip: false, vel: {y:-300}});
							basecharacterOffer.quantity --;										// decrease basecharacter quantity of item given away
						}
					}
				}
			}
		}
	},
	getMessage: function(){
		var res = "";
		if (ig.game.player){															// if player exists
			if (this.distanceTo(ig.game.player) < this.distanceToPlayerForMessage){		// if player in vicinity of charater
				res = this.messages[0]; // default
				for (var c = 0; c < this.covets.length; c++){
					if (ig.game.getInventory(this.name,this.covets[c]).quantity > 0){	// basecharacter has quantity > 0 of what he covets
						res = this.messages[c];											// message corresponds to coveted item, but assumes they are given in order, i.e., don,t give last coveted item first or can never show other messages
					}
				}
			}
		}
		return res;
	},
	kill: function(){
		//console.log(this.name + " killed");
		this.parent();
	}
});
});
