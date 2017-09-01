define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,
        selectedPlayer,

        bg,
        players = {white:{}, green:{}, blue:{}, red:{}},

        playerDescription,
        playerDescriptionMask,
        playerDescriptionText = {
            white: 'Cassius Cygnus\n\nWhite Team\nSeason: Winter\nDedicated to Zephyr, the god of the west wind.'.toUpperCase(),
            green: 'Actaeon III\n\nGreen Team\nSeason: Spring\nDedicated to Flora, the goddess of flowers.'.toUpperCase(),
            blue:  'Titus Primus\n\nBlue Team\nSeason: Autumn\nDedicated to the skies and the sea.'.toUpperCase(),
            red:   'Gaius Severus\n\nRed Team\nSeason: Summer\nDedicated to Mars, the god of war.'.toUpperCase()
        },

        okBtn,
        okBtnMask,

        backBtn,
        backBtnMask,

        playerXTween,
        playerYTween,
        playerReturnXTween,
        playerReturnYTween,
        playerScaleUpTween,
        playerScaleDownTween,

        music,

        bgPos = {x: 114, y: 80},
        playerBtnPos = {
            white: {x: bgPos.x+295, y: bgPos.y+158},
            green: {x: bgPos.x+437, y: bgPos.y+158},
            blue:  {x: bgPos.x+295, y: bgPos.y+304},
            red:   {x: bgPos.x+437, y: bgPos.y+304}
        },

        selectedPlayerPos = {x: bgPos.x+216, y: bgPos.y+198},

        playerDescriptionPos = {x: bgPos.x+300, y: bgPos.y+144},

        backBtnPos = {x: bgPos.x+240, y: bgPos.y+390},
        okBtnPos = {x: bgPos.x+390, y: bgPos.y+390};

    return {
        // Intro
        init: function () {
            game = this.game;

            // When in full-screen mode, take up as much of the screen as 
            // possible while maintaining game proportions.
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        },

        create: function () {
            bg = game.add.sprite(bgPos.x, bgPos.y, 'menu-bg-1');
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

            playerDescription = game.add.existing(new Phaser.BitmapText(
                game,
                playerDescriptionPos.x,
                playerDescriptionPos.y,
                'boxy_bold',
                'null',
                16
            ));
            playerDescription.maxWidth = 300;
            playerDescription.x -= playerDescription.maxWidth;

            playerDescriptionMask = game.add.graphics(0, 0);
            playerDescriptionMask.beginFill(0xffffff);
            playerDescriptionMask.drawRect(selectedPlayerPos.x+66, playerDescriptionPos.y, playerDescription.maxWidth+200, 500);
            playerDescription.mask = playerDescriptionMask;

            for (var key in players) {
                var coords = playerBtnPos[key];
                players[key] = game.add.sprite(
                    coords.x, 
                    coords.y, 
                    key+'-player'
                );
                players[key].anchor.set(0.5);
                players[key].animations.add('selected', [0,1,0,1,0,1,0], 20);
                players[key].menuReturnCoords = coords;
                players[key].inputEnabled = true;
                players[key].events.onInputDown.add(this.playerSelect);
            }

            okBtn = game.add.button(okBtnPos.x, okBtnPos.y, 'menu-btn', this.onOkBtnClicked);
            okBtn.inputEnabled = false;
            okBtn.y -= okBtn.height;
            okBtn.label = okBtn.addChild(new Phaser.BitmapText(
                game, 
                okBtn.width/2,
                okBtn.height/2,
                'boxy_bold',
                'OK',
                16
            ));
            okBtn.label.anchor.set(0.5);

            okBtnMask = game.add.graphics(0, 0);
            okBtnMask.beginFill(0xffffff);
            okBtnMask.drawRect(okBtnPos.x, okBtnPos.y, okBtn.width, okBtn.height);
            okBtn.mask = okBtnMask;

            backBtn = game.add.button(backBtnPos.x, backBtnPos.y, 'menu-btn', this.onBackBtnClicked);
            backBtn.inputEnabled = false;
            backBtn.y -= backBtn.height;
            backBtn.label = backBtn.addChild(new Phaser.BitmapText(
                game, 
                backBtn.width/2,
                backBtn.height/2,
                'boxy_bold',
                'BACK',
                16
            ));
            backBtn.label.anchor.set(0.5);

            backBtnMask = game.add.graphics(0, 0);
            backBtnMask.beginFill(0xffffff);
            backBtnMask.drawRect(backBtnPos.x, backBtnPos.y, backBtn.width, backBtn.height);
            backBtn.mask = backBtnMask;

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

            playerXTween.onComplete.addOnce(function() {
                game.add.tween(playerDescription).to({x:playerDescriptionPos.x},150,Phaser.Linear,true,150);
                game.add.tween(okBtn).to({y:okBtnPos.y},150,Phaser.Linear,true,150);
                game.add.tween(backBtn).to({y:backBtnPos.y},150,Phaser.Linear,true,150);
                okBtn.inputEnabled = true;
                backBtn.inputEnabled = true;
            }, this);

        },

        onOkBtnClicked: function() {
            var color = selectedPlayer.key.split('-')[0];
            music.onFadeComplete.addOnce(function() {
                music.stop();
                this.game.state.start('Play',true,false,{color:'chariot-'+ color});
            }, this);
            music.fadeOut(1000);
        },

        onBackBtnClicked: function() {
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

            okBtn.inputEnabled = false;
            backBtn.inputEnabled = false;
        },

        update:function(){

        }
    };
});