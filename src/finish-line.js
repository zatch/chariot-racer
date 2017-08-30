define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function FinishLine (_game, x, y) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'finish-line');

        game.physics.enable(this);
    }

    FinishLine.prototype = Object.create(Phaser.Sprite.prototype);
    FinishLine.prototype.constructor = FinishLine;

    FinishLine.prototype.kill = function () {
        console.log('kill the line');
        Phaser.Sprite.prototype.kill.call(this);

    };

    return FinishLine;

});