define([
    'phaser'
], function (Phaser) {
    'use strict';

    var game;

    function LevelDisplay (_game, x, y) {

        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'blank');
        this.level = 0;
        this.levelText = new Phaser.Text(game, game.width/2-100, 0, '', { font: "bold 16px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" });
        this.addChild(this.levelText);
    }

    LevelDisplay.prototype = Object.create(Phaser.Sprite.prototype);
    LevelDisplay.prototype.constructor = LevelDisplay;

    LevelDisplay.prototype.updateDisplay = function (level,tokens) {
        this.level = level;
        this.levelText.setText("Level " + level + " (" + tokens/8*100 + "%)");
    };
    return LevelDisplay;
});