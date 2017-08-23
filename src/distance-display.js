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
        game.add.tileSprite(game.width/3+20, 21, 10,60, 'hud-position');
        this.distanceText = game.add.bitmapText(game.width/3, 1, 'carrier', '', 14);
        this.addChild(this.distanceText);
    }

    DistanceDisplay.prototype = Object.create(Phaser.Sprite.prototype);
    DistanceDisplay.prototype.constructor = DistanceDisplay;

    DistanceDisplay.prototype.updateDisplay = function (val) {
        this.distance = val;
        this.distanceText.text =Math.floor(this.distance) + " meters";
    };

    return DistanceDisplay;
});