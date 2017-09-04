define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function Token (_game, x, y) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'token', 0);
        this.anchor.set(0, 0.5);
        
        this.animations.add('spin');
        this.animations.play('spin', 10, true);
    }

    Token.prototype = Object.create(Phaser.Sprite.prototype);
    Token.prototype.constructor = Token;
    
    Token.prototype.setAnimationFrame = function (frameIndex) {
        this.animations.getAnimation('spin').frame = frameIndex;
    };

    return Token;

});