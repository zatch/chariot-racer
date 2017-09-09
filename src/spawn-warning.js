define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function SpawnWarning (_game, x, y) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'spawn-warning', 0);
        this.anchor.set(1);
        this.scale.setTo(2,2);

        this.animations.add('token-first', [0], 15, true);
        this.animations.add('token-subsequent', [1,2,3], 15, true);
        this.animations.add('power-up-first', [0], 15, true);
        this.animations.add('power-up-subsequent', [1,2,3], 15, true);
        this.animations.add('obstacle-first', [4], 15, true);
        this.animations.add('obstacle-subsequent', [5,6,7], 15, true);
    }

    SpawnWarning.prototype = Object.create(Phaser.Sprite.prototype);
    SpawnWarning.prototype.constructor = SpawnWarning;

    return SpawnWarning;

});