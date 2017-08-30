define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function ObstacleWheel (_game, x, y) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'skull', 0);
        this.anchor.set(0.5);
    }

    ObstacleWheel.prototype = Object.create(Phaser.Sprite.prototype);
    ObstacleWheel.prototype.constructor = ObstacleWheel;

    return ObstacleWheel;

});