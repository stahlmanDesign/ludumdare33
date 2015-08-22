ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function() {

    EntityPlayer = ig.Entity.extend({

        size: { x: 32, y: 32 },
        collides: ig.Entity.COLLIDES.PASSIVE,

        animSheet: new ig.AnimationSheet('media/player.png', 32, 32),

        init: function (x, y, settings) {

            this.parent(x, y, settings);

            this.addAnim('init', 1, [0]);
        },

        update: function() {

            this.parent();
        }
    });
});
