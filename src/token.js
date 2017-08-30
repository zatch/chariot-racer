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
        this.anchor.set(0.5);
    }

    Token.prototype = Object.create(Phaser.Sprite.prototype);
    Token.prototype.constructor = Token;

    return Token;

});