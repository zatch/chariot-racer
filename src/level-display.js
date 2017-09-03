define([
    'phaser'
], function (Phaser) {
    'use strict';

    var game,progress;

    function LevelDisplay (_game, x, y) {

        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'progress', 0);
        this.level = 0;

    }

    LevelDisplay.prototype = Object.create(Phaser.Sprite.prototype);
    LevelDisplay.prototype.constructor = LevelDisplay;

    LevelDisplay.prototype.updateDisplay = function (level,tokens) {
        this.level = level;
        this.frame = tokens;
    };
    return LevelDisplay;
});