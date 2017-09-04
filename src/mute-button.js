define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function MuteButton (_game) {
        game = _game;

        // Initialize sprite
        Phaser.Button.call(this, game, 16, 12, 'mute-btn', this.toggle);
        if (game.sound.mute) {
            this.frame = 1;
        }
        else {
            this.frame = 0;
        }
    }

    MuteButton.prototype = Object.create(Phaser.Button.prototype);
    MuteButton.prototype.constructor = MuteButton;

    MuteButton.prototype.toggle = function () {
        game.sound.mute = !game.sound.mute;
        if (game.sound.mute) {
            this.frame = 1;
        }
        else {
            this.frame = 0;
        }
    };

    return MuteButton;

});