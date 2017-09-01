define([
    'phaser',
    'level-display',
    'distance-display'
], function (Phaser,LevelDisplay,DistanceDisplay) {
    'use strict';
    var level,
        distanceDisplay,
        levelDisplay;
    function HUD(game){
        distanceDisplay = new DistanceDisplay(game, 0, 0);
        game.add.existing(distanceDisplay);
        distanceDisplay.fixedToCamera = true;
        distanceDisplay.cameraOffset.x = 20;
        distanceDisplay.cameraOffset.y = 20;

    }
    HUD.prototype = Object.create(Phaser.Sprite.prototype);
    HUD.prototype.constructor = HUD;

    HUD.prototype.updateDisplay = function (currentLevel,currentTokensCollected,meters) {
        distanceDisplay.updateDisplay(meters);
        //levelDisplay.updateDisplay(0,currentTokensCollected);
    };

    return HUD;

});