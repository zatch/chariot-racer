define([
    'phaser',
    'mute-button'
], function (Phaser, MuteButton) { 
    'use strict';

    // Shortcuts
    var game,

        bg,
        bannerText,

        distanceBanner,
        metersTraveled,

        playBtn,
        challengeBtn,
        creditsBtn,

        music;

    return {
        // Intro
        init: function (data) {
            game = this.game;
            metersTraveled = data.metersTraveled;
        },
        
        // Main
        create: function () {
            // Button SFX
            game.sound.add('menu-back');

            // Background
            bg = game.add.sprite(0, 80, 'menu-bg-2');
            bg.x = game.width / 2 - bg.width / 2;

            bg.label = bg.addChild(new Phaser.BitmapText(
                game, 
                bg.width/2,
                30,
                'boxy_bold',
                'GAME OVER',
                16,
                'center'
            ));
            bg.label.anchor.set(0.5);

            // Distance traveled message
            distanceBanner = bg.addChild(new Phaser.Sprite(game, bg.width/2, 160, 'menu-banner-1'));
            distanceBanner.anchor.set(0.5, 0);
            distanceBanner.label = distanceBanner.addChild(new Phaser.BitmapText(
                game, 
                0,
                40,
                'boxy_bold',
                'DISTANCE TRAVELED: ' + Math.floor(metersTraveled) + 'm',
                16,
                'center'
            ));
            distanceBanner.label.anchor.set(0.5);

            // Challenge a Friend button
            challengeBtn = bg.addChild(new Phaser.Button(game, 264, 390, 'menu-btn3', this.onChallengeBtnClicked));
            challengeBtn.anchor.set(0.5, 0);
            challengeBtn.label = challengeBtn.addChild(new Phaser.BitmapText(
                game, 
                0,
                26,
                'boxy_bold',
                'CHALLENGE A FRIEND',
                16
            ));
            challengeBtn.label.anchor.set(0.5);
            challengeBtn.animations.add('selected', [0,1,0], 20);

            // Play Again button
            playBtn = bg.addChild(new Phaser.Button(game, bg.width-200, 390, 'menu-btn2', this.onPlayBtnClicked));
            playBtn.anchor.set(0.5, 0);
            playBtn.label = playBtn.addChild(new Phaser.BitmapText(
                game, 
                0,
                26,
                'boxy_bold',
                'PLAY AGAIN',
                16
            ));
            playBtn.label.anchor.set(0.5);
            playBtn.animations.add('selected', [0,1,0], 20);

            // Credits button
            creditsBtn = game.add.button(game.width/2, game.height, 'credits-btn', this.onCreditsBtnClicked);
            creditsBtn.anchor.set(0.5, 1);
            creditsBtn.animations.add('selected', [0,1,0], 20);

            // Mute button
            game.add.existing(new MuteButton(game));

            // Music
            music = game.add.audio('menu-music', 0.5, true);
            music.play();
        },

        onChallengeBtnClicked: function() {
            game.sound.play('menu-select');

            challengeBtn.animations.play('selected').onComplete.addOnce(function() {
                var mailto = 'mailto:' +
                             '?subject=I made it ' + Math.floor(metersTraveled) + ' meters in Chariot Racer. Can you beat my score?' +
                             '&body=I made it ' + Math.floor(metersTraveled) + ' meters in Chariot Racer. Try to top my score!' +
                             '%0D%0A' +
                             '%0D%0A' +
                             'https://learntodomore.com/review/2104_shire_pres_club/chariot-racer/dev/index.html' +
                             '%0D%0A' +
                             '%0D%0A' +
                             'Will you accept the Emperor\'s challenge?';
                window.location.href = mailto;
            }, this);
        },

        onPlayBtnClicked: function() {
            game.sound.play('menu-select');

            playBtn.animations.play('selected').onComplete.addOnce(function() {
                music.stop();
                this.game.stateTransition.to('Menu', true, false);
            }, this);
        },

        onCreditsBtnClicked: function() {
            game.sound.play('menu-select');

            creditsBtn.animations.play('selected').onComplete.addOnce(function() {
                music.stop();
                this.game.stateTransition.to('Credits', true, false, {backState: 'GameOver', backData: {metersTraveled: metersTraveled}});
            }, this);
        }
    };
});