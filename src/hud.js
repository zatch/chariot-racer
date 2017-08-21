define([
    'phaser',
    'laps-display',
    'distance-display'
], function (Phaser,LapsDisplay,DistanceDisplay) {
    'use strict';
    var distanceDisplay,
        lapsDisplay;
    function Hud(game){
        distanceDisplay = new DistanceDisplay(game, 0, 0);
        game.add.existing(distanceDisplay);
        distanceDisplay.fixedToCamera = true;
        distanceDisplay.cameraOffset.x = 4;
        distanceDisplay.cameraOffset.y = 4;

        lapsDisplay = new LapsDisplay(game, 0, 0);
        game.add.existing(lapsDisplay);
        lapsDisplay.updateDisplay(1);
    }
    return Hud;

});