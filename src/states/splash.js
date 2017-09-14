define([
    'phaser',
    'mute-button'
], function (Phaser, MuteButton) { 
    'use strict';

    // Shortcuts
    var game,

        title,
        playBtn,

        muteBtn,

        music;

    return {
        // Intro
        init: function () {
            game = this.game;
        },
        
        // Main
        create: function () {
            // Button SFX
            game.sound.add('menu-select');

            // Background
            title = game.add.sprite(game.width / 2, 80, 'title');
            title.anchor.set(0.5, 0);

            // Credits button
            playBtn = game.add.button(game.width / 2, game.height - 80, 'tap-to-play-btn', this.onPlayBtnClicked);
            playBtn.anchor.set(0.5, 1);
            playBtn.animations.add('selected', [0,1,0], 20);
            
            playBtn.animations.add('blink-off', [0,4,5], 30);
            playBtn.animations.add('blink-on', [5,4,0], 30);
            this.blinkOff();

            game.input.onDown.add(this.onPlayBtnClicked, this); 

            // Mute button
            muteBtn = game.add.existing(new MuteButton(game));

            // Music
            music = game.add.audio('menu-music', 0.5, true);
            music.play();
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
            if (!muteBtn.input.pointerOver()) {
                game.sound.play('menu-select');

                playBtn.animations.play('selected').onComplete.addOnce(function() {
                    music.stop();
                    this.game.stateTransition.to('Menu', true, false);
                }, this);
            }
        }
    };
});