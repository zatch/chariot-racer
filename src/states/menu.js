define([
    'phaser',
    'mute-button'
], function (Phaser, MuteButton) { 
    'use strict';

    // Shortcuts
    var game,
        selectedPlayer,

        bg,
        players = {white:{}, green:{}, blue:{}, red:{}},

        playerDescription,
        playerDescriptionMask,
        playerDescriptionText = {
            white: 'Cassius Cygnus\n\nWhite Team\nSeason: Winter\nDedicated to Zephyr, god of the west wind.'.toUpperCase(),
            green: 'Actaeon III\n\nGreen Team\nSeason: Spring\nDedicated to Flora, the goddess of flowers.'.toUpperCase(),
            blue:  'Titus Primus\n\nBlue Team\nSeason: Autumn\nDedicated to the skies and the sea.'.toUpperCase(),
            red:   'Gaius Severus\n\nRed Team\nSeason: Summer\nDedicated to Mars, the god of war.'.toUpperCase()
        },

        okBtn,
        okBtnMask,

        backBtn,
        backBtnMask,

        creditsBtn,

        playerXTween,
        playerYTween,
        playerReturnXTween,
        playerReturnYTween,
        playerScaleUpTween,
        playerScaleDownTween,

        music,

        playerBtnPos = {
            white: {x: 295, y: 158},
            green: {x: 437, y: 158},
            blue:  {x: 295, y: 304},
            red:   {x: 437, y: 304}
        },

        selectedPlayerPos = {x: 216, y: 198},

        playerDescriptionPos = {x: 300, y: 144},

        backBtnPos = {x: 240, y: 390},
        okBtnPos = {x: 390, y: 390};

    return {
        // Intro
        init: function () {
            game = this.game;
        },

        create: function () {
            // Button SFX
            game.sound.add('menu-select');
            game.sound.add('menu-back');

            // Background
            bg = game.add.sprite(0, 80, 'menu-bg-1');
            bg.x = game.width / 2 - bg.width / 2;

            bg.label = bg.addChild(new Phaser.BitmapText(
                game, 
                bg.width/2,
                40,
                'boxy_bold',
                'SELECT YOUR\nCHARIOTEER',
                16,
                'center'
            ));
            bg.label.anchor.set(0.5);

            // Player descriptions
            playerDescription = bg.addChild(new Phaser.BitmapText(
                game,
                300,
                144,
                'boxy_bold',
                'null',
                16
            ));
            playerDescription.maxWidth = 300;
            playerDescription.x -= playerDescription.maxWidth+200;

            playerDescriptionMask = bg.addChild(new Phaser.Graphics(game, 0, 0));
            playerDescriptionMask.beginFill(0xffffff);
            playerDescriptionMask.drawRect(selectedPlayerPos.x+66, playerDescriptionPos.y, playerDescription.maxWidth+200, 500);
            playerDescription.mask = playerDescriptionMask;

            // Player select buttons
            for (var key in players) {
                var coords = playerBtnPos[key];
                players[key] = bg.addChild(new Phaser.Sprite(
                    game,
                    coords.x, 
                    coords.y, 
                    key+'-player'
                ));
                players[key].anchor.set(0.5);
                players[key].animations.add('selected', [0,1,0,1,0,1,0], 20);
                players[key].menuReturnCoords = coords;
                players[key].inputEnabled = true;
                players[key].events.onInputDown.add(this.playerSelect);
            }

            // OK button
            okBtn = bg.addChild(new Phaser.Button(game, okBtnPos.x, okBtnPos.y, 'menu-btn', this.onOkBtnClicked));
            okBtn.inputEnabled = false;
            okBtn.y -= okBtn.height;
            okBtn.label = okBtn.addChild(new Phaser.BitmapText(
                game, 
                okBtn.width/2,
                26,
                'boxy_bold',
                'OK',
                16
            ));
            okBtn.label.anchor.set(0.5);
            okBtn.animations.add('selected', [0,1,0], 20);

            okBtnMask = bg.addChild(new Phaser.Graphics(game, 0, 0));
            okBtnMask.beginFill(0xffffff);
            okBtnMask.drawRect(okBtnPos.x, okBtnPos.y, okBtn.width, okBtn.height);
            okBtn.mask = okBtnMask;

            // Back button
            backBtn = bg.addChild(new Phaser.Button(game, backBtnPos.x, backBtnPos.y, 'menu-btn', this.onBackBtnClicked));
            backBtn.inputEnabled = false;
            backBtn.y -= backBtn.height;
            backBtn.label = backBtn.addChild(new Phaser.BitmapText(
                game, 
                backBtn.width/2,
                26,
                'boxy_bold',
                'BACK',
                16
            ));
            backBtn.label.anchor.set(0.5);
            backBtn.animations.add('selected', [0,1,0], 20);

            backBtnMask = bg.addChild(new Phaser.Graphics(game, 0, 0));
            backBtnMask.beginFill(0xffffff);
            backBtnMask.drawRect(backBtnPos.x, backBtnPos.y, backBtn.width, backBtn.height);
            backBtn.mask = backBtnMask;

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

        playerSelect:function(sprite){
            selectedPlayer = sprite;

            for (var key in players) {
                players[key].inputEnabled = false;
                if (players[key] !== selectedPlayer) {
                    game.add.tween(players[key].scale).to({x:0,y:0},200).start();
                }
                else {
                    playerDescription.text = playerDescriptionText[key];
                }
            }
            selectedPlayer.animations.play('selected');
            playerYTween = game.add.tween(sprite).to({y:selectedPlayerPos.y},300,Phaser.Linear,false,200);
            playerXTween = game.add.tween(sprite).to({x:selectedPlayerPos.x},300);
            playerYTween.chain(playerXTween);
            playerYTween.start();

            game.sound.play('menu-select');

            playerXTween.onComplete.addOnce(function() {
                game.add.tween(playerDescription).to({x:playerDescriptionPos.x},150,Phaser.Linear,true,150);
                game.add.tween(okBtn).to({y:okBtnPos.y},150,Phaser.Linear,true,150);
                game.add.tween(backBtn).to({y:backBtnPos.y},150,Phaser.Linear,true,150);
                okBtn.inputEnabled = true;
                backBtn.inputEnabled = true;
            }, this);

        },

        onOkBtnClicked: function() {
            game.sound.play('menu-select');

            okBtn.animations.play('selected').onComplete.addOnce(function() {
                var color = selectedPlayer.key.split('-')[0];
                music.stop();
                this.game.stateTransition.to('Play', true, false, {color:'chariot-'+ color});
            }, this);

            okBtn.inputEnabled = false;
            backBtn.inputEnabled = false;
        },

        onBackBtnClicked: function() {
            game.sound.play('menu-back');

            backBtn.animations.play('selected').onComplete.addOnce(function() {
                game.add.tween(playerDescription).to({x:playerDescriptionPos.x-playerDescriptionMask.width},200).start();
                game.add.tween(okBtn).to({y:okBtnPos.y-okBtn.height},200).start();
                game.add.tween(backBtn).to({y:backBtnPos.y-backBtn.height},200).start();
                playerReturnXTween = game.add.tween(selectedPlayer).to({x:selectedPlayer.menuReturnCoords.x},200);
                playerReturnYTween = game.add.tween(selectedPlayer).to({y:selectedPlayer.menuReturnCoords.y},200);
                playerReturnXTween.chain(playerReturnYTween);
                playerReturnXTween.onComplete.addOnce(function() {
                    for (var key in players) {
                        players[key].inputEnabled = true;
                        if (players[key] !== selectedPlayer) {
                            game.add.tween(players[key].scale).to({x:1,y:1},200).start();
                        }
                    }
                }, this);

                playerReturnXTween.start();
            }, this);

            okBtn.inputEnabled = false;
            backBtn.inputEnabled = false;
        },

        onCreditsBtnClicked: function() {
            game.sound.play('menu-select');

            creditsBtn.animations.play('selected').onComplete.addOnce(function() {
                music.stop();
                this.game.stateTransition.to('Credits', true, false);
            }, this);

            okBtn.inputEnabled = false;
            backBtn.inputEnabled = false;
            creditsBtn.inputEnabled = false;
        },

        update:function(){

        }
    };
});