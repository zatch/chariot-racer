define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function Token (_game, x, y) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'power-up', 0);
        this.anchor.set(0, 0.5);
        
        this.animations.add('bounce');
        this.animations.play('bounce', 10, true);
    }

    Token.prototype = Object.create(Phaser.Sprite.prototype);
    Token.prototype.constructor = Token;
    
    Token.prototype.setAnimationFrame = function (frameIndex) {
        this.animations.getAnimation('bounce').frame = frameIndex;
    };

    return Token;

});