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
        this.dying = false;
        this.maxHealth = 1;
        this.health = 1;
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
    
    Obstacle.prototype.damage = function () {
        if (this.health >= 1) {
            this.health--;
            this.dying = true;
            var finalX  = this.x + Math.floor(Math.random() * 20) + 20,
                finalY  = this.y + Math.floor((Math.random() - 0.5) * 40),
                peakY   = finalY + Math.floor((Math.random() - 0.5) * 20) - 50;
            game.add.tween(this).to(
                { x: finalX }, 
                500, 
                Phaser.Easing.Cubic.Out, 
                true);
            game.add.tween(this).to(
                { y: peakY }, 
                100, 
                Phaser.Easing.Cubic.Out, 
                true)
            .onComplete.add(function() {
                game.add.tween(this).to(
                    { y: finalY }, 
                    300, 
                    Phaser.Easing.Bounce.Out, 
                    true);
            }, this);
        }
    };

    return Obstacle;

});