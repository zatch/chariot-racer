define([
    'phaser',
    'level-display'
], function (Phaser, LevelDisplay) {
    'use strict';

    // Shortcuts
    var game,
        level,
        distanceDisplay,
        levelDisplay;

    function HUD(_game, x, y){
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'hud-frame', 0);
        this.anchor.set(0.5, 0);

        distanceDisplay = new Phaser.BitmapText(game, this.width/-4, 12, 'boxy_bold', '0m', 16);
        distanceDisplay.anchor.set(0.5, 0);
        this.addChild(distanceDisplay);
    }

    HUD.prototype = Object.create(Phaser.Sprite.prototype);
    HUD.prototype.constructor = HUD;

    HUD.prototype.updateDisplay = function (currentLevel,currentTokensCollected,meters) {
        this.updateDistanceDisplay(meters);
        //levelDisplay.updateDisplay(0,currentTokensCollected);
    };

    HUD.prototype.updateDistanceDisplay = function (meters) {
        distanceDisplay.text = Math.floor(meters) + 'm';
    };

    return HUD;

});