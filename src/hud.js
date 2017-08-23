define([
    'phaser',
    'level-display',
    'distance-display'
], function (Phaser,LevelDisplay,DistanceDisplay) {
    'use strict';
    var level,
        distanceDisplay,
        levelDisplay;
    function Hud(game){
        distanceDisplay = new DistanceDisplay(game, 0, 0);
        game.add.existing(distanceDisplay);
        distanceDisplay.fixedToCamera = true;
        distanceDisplay.cameraOffset.x = 4;
        distanceDisplay.cameraOffset.y = 4;

        //levelDisplay = new LevelDisplay(game);
        //game.add.existing(levelDisplay);
        //levelDisplay.updateDisplay(0,0);
    }
    Hud.prototype = Object.create(Phaser.Sprite.prototype);
    Hud.prototype.constructor = Hud;

    Hud.prototype.updateDisplay = function (currentLevel,currentTokensCollected,currentLap,meters) {
        //levelDisplay.updateDisplay(currentLevel,currentTokensCollected);
        distanceDisplay.updateDisplay(meters);
    };

    return Hud;

});