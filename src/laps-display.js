define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function LapsDisplay (_game, x, y) {

        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'distance-display');

        this.lap = 0;
        this.lapsText = new Phaser.Text(game, game.width - 100, 0, this.distanceString, { font: "bold 16px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" });
        this.addChild(this.lapsText);
    }

    LapsDisplay.prototype = Object.create(Phaser.Sprite.prototype);
    LapsDisplay.prototype.constructor = LapsDisplay;

    LapsDisplay.prototype.updateDisplay = function (val) {
        this.lap = val;
        this.lapsText.setText("Lap " + Math.floor(this.lap) + " (" + Math.floor(this.lap%1*100) + "%)");
    };

    return LapsDisplay;
});