define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,
        selectedPlayer,
        bg,
        players = {white:{}, green:{}, blue:{}, red:{}},
        okBtn,
        backBtn,
        move,
        music,

        bgPos={x: 114, y: 20},
        playerBtnPos = {
            white: {x: bgPos.x+229, y: bgPos.y+90},
            green: {x: bgPos.x+371, y: bgPos.y+90},
            blue:  {x: bgPos.x+229, y: bgPos.y+236},
            red:   {x: bgPos.x+371, y: bgPos.y+236}
        },

        selectedPlayerPos={x: bgPos.x+150, y: bgPos.y+130},

        backBtnPos={x: bgPos.x+240, y: bgPos.y+390},
        okBtnPos={x: bgPos.x+390, y: bgPos.y+390};

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
            bg.scale.setTo(2,2);
            bg.label = bg.addChild(new Phaser.BitmapText(
                game, 
                bg.width/2/2, // must divide twice due to scale
                20,
                'boxy_bold',
                'SELECT YOUR\nCHARIOTEER',
                8,
                'center'
            ));
            bg.label.anchor.set(0.5);

            for (var key in players) {
                var coords = playerBtnPos[key];
                players[key] = game.add.sprite(
                    coords.x, 
                    coords.y, 
                    key+'-player'
                );
                players[key].menuReturnCoords = coords;
                players[key].scale.setTo(2,2);
                players[key].inputEnabled = true;
                players[key].events.onInputDown.add(this.playerSelect);
            }

            okBtn = game.add.button(okBtnPos.x, okBtnPos.y, 'menu-btn', this.onOkBtnClicked);
            okBtn.scale.setTo(2,2);
            okBtn.alpha = 0;
            okBtn.label = okBtn.addChild(new Phaser.BitmapText(
                game, 
                okBtn.width/2/2, // must divide twice due to scale
                okBtn.height/2/2, // must divide twice due to scale
                'boxy_bold',
                'OK',
                8
            ));
            okBtn.label.anchor.set(0.5);

            backBtn = game.add.button(backBtnPos.x, backBtnPos.y, 'menu-btn', this.onBackBtnClicked);
            backBtn.scale.setTo(2,2);
            backBtn.alpha=0;
            backBtn.label = backBtn.addChild(new Phaser.BitmapText(
                game, 
                backBtn.width/2/2, // must divide twice due to scale
                backBtn.height/2/2, // must divide twice due to scale
                'boxy_bold',
                'BACK',
                8
            ));
            backBtn.label.anchor.set(0.5);

            // Music
            music = game.add.audio('menu-music', 0.5, true);
            music.play();
        },

        playerSelect:function(sprite){
            selectedPlayer = sprite;

            for (var key in players) {
                players[key].alpha = 0;
            }

            sprite.alpha = 1;
            move = game.add.tween(sprite).to({x:selectedPlayerPos.x,y:selectedPlayerPos.y},800).start();
            okBtn.alpha = 1;
            backBtn.alpha = 1;
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
            move.to(selectedPlayer.menuReturnCoords,300).start();
            for (var key in players) {
                if(players[key].alpha===0){
                    game.add.tween(players[key]).to({alpha:1},1000,null,false,1000).start();
                }
            }
            okBtn.alpha = 0;
            backBtn.alpha = 0;
        },

        update:function(){

        }
    };
});