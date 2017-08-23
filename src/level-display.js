define([
    'phaser'
], function (Phaser) {
    'use strict';

    var game,progress;

    function LevelDisplay (_game, x, y) {

        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'blank');
        this.level = 0;
        this.progressBar = game.add.sprite(game.width/2-100,5,'progress','0_8');


    }

    LevelDisplay.prototype = Object.create(Phaser.Sprite.prototype);
    LevelDisplay.prototype.constructor = LevelDisplay;

    LevelDisplay.prototype.updateDisplay = function (level,tokens) {
        this.level = level;
        //this.width = 300*(tokens/8);
        this.progressBar.frameName = tokens+'_8';
        //this.progressBar.clear();
        //this.progressBar.drawRoundedRect(1,1,this.width,18,6);
        // this.levelText.setText("Level " + level + " (" + tokens/8*100 + "%)");
    };
    return LevelDisplay;
});