ig.module(
    'game.entities.jack'
)
.requires(
    'impact.entity'
)
.defines(function() {

    EntityJack = ig.Entity.extend({

        size: { x: 18, y: 34 },
        collides: ig.Entity.COLLIDES.PASSIVE,

        animSheet: new ig.AnimationSheet('media/jack.png', 18, 34),

        init: function (x, y, settings) {

            this.parent(x, y, settings);

            this.addAnim('init', 1, [0]);
        },

        update: function() {

            this.parent();
        }
    });
});
