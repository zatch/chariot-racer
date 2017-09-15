define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,

        title,
        playBtn;

    return {
        // Intro
        init: function () {
            game = this.game;
        },
        
        // Main
        create: function () {
            // Background
            title = game.add.sprite(game.width / 2, 0, 'title');
            title.anchor.set(0.5, 0);

            // Play button
            playBtn = game.add.button(game.width / 2, game.height - 20, 'tap-to-play-btn', this.onPlayBtnClicked);
            playBtn.anchor.set(0.5, 1);
            playBtn.animations.add('selected', [0,1,0], 20);
            
            playBtn.animations.add('blink-off', [0,4,5], 30);
            playBtn.animations.add('blink-on', [5,4,0], 30);
            this.blinkOff();

            game.input.onDown.add(this.onPlayBtnClicked, this);
        },

        blinkOn: function() {
            playBtn.animations.play('blink-on');
            game.time.events.add(Phaser.Timer.SECOND*2, this.blinkOff, this);
        },

        blinkOff: function() {
            playBtn.animations.play('blink-off');
            game.time.events.add(Phaser.Timer.SECOND, this.blinkOn, this);
        },

        onPlayBtnClicked: function() {
            playBtn.animations.play('selected').onComplete.addOnce(function() {
                this.game.stateTransition.to('Menu', true, false);
            }, this);
        }
    };
});