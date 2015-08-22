ig.module('plugins.rotate-entity')
.defines(function() {

	MixinRotateEntity = {
		init: function(x, y, settings) {
			this.parent(x, y, settings);

			//this.rotateTimer = new ig.Timer(this.rotateDuration || 0);
			//this.rotationSpeed = (this.rotationSpeed || 0);

		},

		draw: function() {
			if (this.isRotating && this.rotateTimer.delta() < 0){
				this.currentAnim.angle = this._rotateEntity_getAngle();
			}else{
				this.isRotating = false;
				this.currentAnim.angle = 0; // make sure to reset to zero if currentAnim changed during rotation -- this could interfere though if you want to change angle for some other reason
			}
			this.parent();
		},
		beginRotate: function(settings){
			// settings example: {"duration":3,"speed":4,"numFullRotations":5}
			this.isRotating = true;
			this.rotateTimer = new ig.Timer(settings.duration || 0);
			this.rotationSpeed = (settings.speed || 0);
			this.clockwise = (settings.clockwise); // clockwise or counter-clockwise

			//this.numFullRotations = (settings.numFullRotations || 0);	// currently not supported
		},

		_rotateEntity_getAngle: function() {
			if(this.rotateTimer.delta() < 0) {
				if (!this.clockwise) return this.currentAnim.angle + Math.PI * ig.system.tick * this.rotationSpeed;
				else 				return this.currentAnim.angle - Math.PI * ig.system.tick * this.rotationSpeed;
			}else{
				return 0;
			}
			return 0;
		}
	};
});


