define([
    'phaser',
    'mute-button'
], function (Phaser, MuteButton) { 
    'use strict';

    // Shortcuts
    var game,

        bg,
        banner,
        bannerText,

        creditsText,
        creditsTextMask,

        backBtn,

        music;

    return {
        // Intro
        init: function () {
            game = this.game;
        },

        create: function () {
            // Button SFX
            game.sound.add('menu-back');

            // Background
            bg = game.add.sprite(0, 80, 'menu-bg-3');
            bg.x = game.width / 2 - bg.width / 2;

            // Player descriptions
            creditsText = bg.addChild(new Phaser.BitmapText(
                game,
                bg.width/2,
                100,
                'boxy_bold',
                'CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE CREDIT TEXT GOES HERE',
                16,
                'center'
            ));
            creditsText.anchor.set(0.5, 0);
            creditsText.maxWidth = 560;

            game.physics.enable(creditsText);
            game.time.events.add(Phaser.Timer.SECOND*2, function () {
                creditsText.body.velocity.y = -20;
            }, this);

            creditsTextMask = bg.addChild(new Phaser.Graphics(game, 0, 0));
            creditsTextMask.beginFill(0xffffff);
            creditsTextMask.drawRect(50, 40, 632, 364);
            creditsText.mask = creditsTextMask;

            banner = bg.addChild(new Phaser.Sprite(game, bg.width/2, 8, 'menu-banner-2'));
            banner.anchor.set(0.5, 0);
            bannerText = banner.addChild(new Phaser.BitmapText(
                game, 
                banner/2,
                24,
                'boxy_bold',
                'CREDITS',
                16,
                'center'
            ));
            bannerText.anchor.set(0.5);

            // Back button
            backBtn = bg.addChild(new Phaser.Button(game, bg.width/2, 404, 'menu-btn', this.onBackBtnClicked));
            backBtn.anchor.set(0.5, 0);
            backBtn.label = backBtn.addChild(new Phaser.BitmapText(
                game, 
                0,
                backBtn.height/2,
                'boxy_bold',
                'BACK',
                16
            ));
            backBtn.label.anchor.set(0.5);
            backBtn.animations.add('selected', [0,1,0], 20);

            // Mute button
            game.add.existing(new MuteButton(game));

            // Music
            music = game.add.audio('credits-music', 0.5, true);
            music.play();
        },

        onBackBtnClicked: function() {
            game.sound.play('menu-back');

            backBtn.inputEnabled = false;

            backBtn.animations.play('selected').onComplete.addOnce(function() {
                music.stop();

                // The state transition plugin doesn't appear to support masks, so we kill
                // this text as a workaround to not show where it overflows from behind
                // the mask.
                creditsText.kill();

                this.game.stateTransition.to('Menu', true, false);
            }, this);
        },

        update:function(){
            if (creditsText.y < 0 - creditsText.height) creditsText.y = bg.height;
        }
    };
});