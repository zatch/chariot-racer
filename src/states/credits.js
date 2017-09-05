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
        creditsDirection,
        creditsSpeed,

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
            creditsText = bg.addChild(new Phaser.Sprite(game, bg.width/2, 0, 'blank'));
            game.physics.enable(creditsText);
            creditsText.body.setSize(560,0,0,0);
            creditsText.resizeFrame(Phaser.Sprite, creditsText.width, 0);
            this.writeCreditText();

            creditsTextMask = bg.addChild(new Phaser.Graphics(game, 0, 0));
            creditsTextMask.beginFill(0xffffff);
            creditsTextMask.drawRect(50, 40, 632, 364);
            creditsText.mask = creditsTextMask;

            creditsDirection = -1;
            creditsSpeed = 30;
            bg.inputEnabled = true;
            bg.events.onInputDown.add(function() {
                if (creditsText.body.velocity.y === 0) {
                    creditsText.body.velocity.y = creditsSpeed * creditsDirection;
                }
                else {
                    creditsText.body.velocity.y = 0;
                    creditsDirection *= -1;
                }
            }, this);

            game.time.events.add(Phaser.Timer.SECOND*2, function () {
                if (creditsText.body.velocity.y === 0) {
                    creditsText.body.velocity.y = creditsSpeed * creditsDirection;
                }
            }, this);

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

        update: function(){
            if (creditsText.y < 0 - creditsText.height) creditsText.y = bg.height;
            if (creditsText.y > bg.height) creditsText.y = 0 - creditsText.height;
        },

        addTitle: function(text){
            this.addText(text, 48, 192, 128);
            return this;
        },

        addH1: function(text){
            this.addText(text, 32, 64);
            return this;
        },

        addH2: function(text){
            this.addText(text, 24, 32);
            return this;
        },

        addP: function(text){
            this.addText(text, 16, 8);
            return this;
        },

        addText: function(text, fontSize, marginTop, marginBottom) {
            fontSize = fontSize ? fontSize : 16;
            marginTop = marginTop ? marginTop : 0;
            marginBottom = marginBottom ? marginBottom : 0;
            // Add margin-top to frame size.
            creditsText.resizeFrame(Phaser.Sprite, creditsText.width, creditsText.height + marginTop);
            var textObject = new Phaser.BitmapText(
                game,
                0,
                creditsText.getBounds().height,
                'boxy_bold',
                text.toUpperCase(),
                fontSize,
                'center'
            );  
            textObject.anchor.set(0.5, 0);
            textObject.maxWidth = 560;
            creditsText.addChild(textObject);
            creditsText.update();
            // Add height of text object to frame height.
            creditsText.resizeFrame(Phaser.Sprite, creditsText.width, creditsText.height + textObject.height + marginBottom);
        },

        writeCreditText: function() {
/*
            .addH1      ('');

            .addH2      ('');
            .addP       ('');

*/ 

            this.addTitle   ('Chariot Racer')

            .addH1      ('Game Development Team')

            .addH2      ('Director')
            .addP       ('Zachary Bennett')
            
            .addH2      ('Programming')
            .addP       ('Zachary Bennett')
            .addP       ('Stefan Roehrl')
            
            .addH2      ('Artwork')
            .addP       ('Peter Lazarski')
            .addP       ('www.imaginarymonsters.com')
        
            .addH2      ('Level Design')
            .addP       ('Zachary Bennett')
            .addP       ('Stefan Roehrl')



            .addH1      ('Communications Team')

            .addH2      ('Art Director')
            .addP       ('Eric Skivington')
        
            .addH2      ('Artwork')
            .addP       ('Roger Trinh')
        
            .addH2      ('Writing')
            .addP       ('Patrick Gear')
            
            .addH2      ('Website Development')
            .addP       ('Andy Knoll')
            
            .addH2      ('Project Leader')
            .addP       ('Christopher Phillips')

            .addH2      ('Communications Manager')
            .addP       ('Victoria Larco')



            .addH1      ('Powered by')
            
            .addH2      ('Phaser Game Engine')
            .addP       ('http://phaser.io/')
            .addP       ('@photonstorm')



            .addH1      ('Music')
            
            .addH2      ('"Preparing for War"')
            .addP       ('by Trevor Lentz')
            .addP       ('www.opengameart.org/users/trevor-lentz')
            .addP       ('used under CC BY-SA 3.0')
            
            .addH2      ('"Lines of Code"')
            .addP       ('by Trevor Lentz')
            .addP       ('www.opengameart.org/users/trevor-lentz')
            .addP       ('used under CC BY-SA 3.0')
            
            .addH2      ('"SuperHero"')
            .addP       ('by Cleyton Kauffman')
            .addP       ('www.opengameart.org/users/doppelganger')
            .addP       ('used under CC BY-SA 3.0')



            .addH1      ('Sound Effects')
            
            .addH2      ('"Atari Boom"')
            .addP       ('by dklon')
            .addP       ('www.opengameart.org/users/dklon')
            .addP       ('used under CC BY 3.0')
            
            .addH2      ('"idg-heartbeats-10"')
            .addP       ('by intermedia Design Graphics')
            .addP       ('www.idgraphics.com')
            .addP       ('used under Flash Kit Freeware terms')
            
            .addH2      ('"Jingle_Lose_00"')
            .addP       ('by Little Robot Sound Factory')
            .addP       ('www.littlerobotsoundfactory.com')
            .addP       ('used under CC BY 3.0')
            
            .addH2      ('"Pickup_Coin"')
            .addP       ('8-bit Platformer SFX commissioned by Mark McCorkle for OpenGameArt.org')
            .addP       ('www.opengameart.org')
            .addP       ('used under CC BY 3.0')
            
            .addH2      ('"SpeedUp" and "SlowDown"')
            .addP       ('Copyright 2012 Iwan "qubodup" Gabovitch ')
            .addP       ('http://qubodup.net qubodup@gmail.com')
            .addP       ('used under CC BY-SA 3.0')
            
            .addH2      ('"roughSelect" and "roughBack"')
            .addP       ('by MadameBerry')
            .addP       ('www.patreon.com/madameberry')
            .addP       ('used under CC0 1.0')



            .addH1      ('Fonts')
            
            .addH2      ('Boxy Bold')
            .addP       ('Originally created by Clint Bellanger, with additional contributions from cemkalyoncu, william.thompsonj, and usr_share')
            .addP       ('www.opengameart.org/content\n/boxy-bold-truetype-font')
            .addP       ('www.clintbellanger.net')
            .addP       ('www.opengameart.org/users/cemkalyoncu')
            .addP       ('www.opengameart.org/users/williamthompsonj')
            .addP       ('www.opengameart.org/users/usrshare')
            .addP       ('used under CC0 1.0')



            .addH1      ('Licenses')

            .addH2      ('CC BY-SA 3.0')
            .addP       ('Attribution-ShareAlike 3.0 Unported')
            .addP       ('https://creativecommons.org\n/licenses/by-sa/3.0/')

            .addH2      ('CC BY 3.0')
            .addP       ('Attribution 3.0 Unported')
            .addP       ('https://creativecommons.org\n/licenses/by/3.0/')

            .addH2      ('CC0 1.0')
            .addP       ('CC0 1.0 Universal')
            .addP       ('Public Domain Dedication')
            .addP       ('https://creativecommons.org\n/publicdomain/zero/1.0/')

            .addH2      ('Flash Kit Freeware')
            .addP       ('http://www.flashkit.com\n/soundfx/guidelines.php')

            ;
        }
    };
});