define([
    'phaser'
], function (Phaser) {
    'use strict';

    // Shortcuts
    var game,
        distanceDisplay,
        boostMeter,
        boostMeterMaxWidth = 120,
        boostMeterStepWidth = 2,
        boostMeterSteps = boostMeterMaxWidth / boostMeterStepWidth;

    function HUD(_game, x, y){
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'hud-frame', 0);
        this.anchor.set(0.5, 0);

        distanceDisplay = new Phaser.BitmapText(game, this.width/-4, 12, 'boxy_bold', '0m', 16);
        distanceDisplay.anchor.set(0.5, 0);
        this.addChild(distanceDisplay);

        boostMeter = new Phaser.TileSprite(game, 38, 12, 0, 20, 'boost-meter-fill');
        this.addChild(boostMeter);
        this.updateBoostMeter(0);
    }

    HUD.prototype = Object.create(Phaser.Sprite.prototype);
    HUD.prototype.constructor = HUD;

    HUD.prototype.updateDistanceDisplay = function (meters) {
        distanceDisplay.text = Math.floor(meters) + 'm';
    };

    HUD.prototype.updateBoostMeter = function (percent) {
        boostMeter.width = Math.floor(boostMeterSteps * percent) * boostMeterStepWidth;
    };

    return HUD;

});