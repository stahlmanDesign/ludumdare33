/**
 *  @ladder.js
 *  @version: 2.0
 *  @author: Justin Stahlman
 *  @date: Oct 2013
 */
ig.module(
    'game.entities.ladder'
)
.requires(
	'bootstrap.entities.base-ladder'
)
.defines(function () {

EntityLadder = EntityBaseLadder.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(109,210,251,0.5)',
	_wmScalable: true,
	ladderTexture: new ig.Image("media/ds_ladderTexture.png"),
	size: { x: 25, y: 96 } // if making it 25 pixels wide when really 24, graphic will not appear. This allows placing it on top of another graphic and letting you climb
    });
});