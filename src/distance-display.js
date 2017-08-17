define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function DistanceDisplay (_game, x, y) {

        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'blank');

        this.distance = 0;
        this.distanceText = new Phaser.Text(game, 0, 0, this.distanceString, { font: "bold 16px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" });
        this.addChild(this.distanceText);
    }

    DistanceDisplay.prototype = Object.create(Phaser.Sprite.prototype);
    DistanceDisplay.prototype.constructor = DistanceDisplay;

    DistanceDisplay.prototype.updateDisplay = function (val) {
        this.distance = val;
        this.distanceText.setText(Math.floor(this.distance) + " meters :: " + Math.floor(game.time.totalElapsedSeconds()*10)/10);
    };

    return DistanceDisplay;
});