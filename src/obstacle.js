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
        this.anchor.set(0.5, 0.75);

        game.physics.enable(this);

        this.body.setSize(32,20,0, 30);
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
        console.log(frameKey, this.frame);
    };

    return Obstacle;

});