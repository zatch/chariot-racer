define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function Obstacle (_game, x, y) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'obstacle');
        this.anchor.set(0, 0.75);
        this.scale.setTo(2,2);
    }

    Obstacle.prototype = Object.create(Phaser.Sprite.prototype);
    Obstacle.prototype.constructor = Obstacle;
    
    Obstacle.prototype.setObstacleFrame = function (frameKey) {
        switch(frameKey){
            case 'scaffolding': 
                this.frame = 0;
                break;
            case 'wheel': 
                this.frame = 1;
                break;
            case 'rock': 
                this.frame = 2;
                break;
            default: 
                this.frame = 0;
                break;
        }
    };

    return Obstacle;

});