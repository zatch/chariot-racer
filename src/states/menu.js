define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,
        selectedPlayer,
        bg,
        players,
        okBtn,
        backBtn,
        memory,
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

            players = [
                game.add.sprite(playerBtnPos.white.x, playerBtnPos.white.y, 'white-player'),
                game.add.sprite(playerBtnPos.green.x, playerBtnPos.green.y, 'green-player'),
                game.add.sprite(playerBtnPos.blue.x, playerBtnPos.blue.y, 'blue-player'),
                game.add.sprite(playerBtnPos.red.x, playerBtnPos.red.y, 'red-player')
            ];
            for(var i=0;i<players.length;i++){
                players[i].scale.setTo(2,2);
                players[i].inputEnabled = true;
                players[i].events.onInputDown.add(this.playerSelect);
            }

            okBtn = game.add.button(okBtnPos.x, okBtnPos.y, 'menu-btn', this.onOkBtnClicked);
            okBtn.scale.setTo(2,2);
            okBtn.alpha = 0;

            backBtn = game.add.button(backBtnPos.x, backBtnPos.y, 'menu-btn', this.onBackBtnClicked);
            backBtn.scale.setTo(2,2);
            backBtn.alpha=0;

            // Music
            music = game.add.audio('menu-music', 0.5, true);
            music.play();
        },

        playerSelect:function(sprite){
            selectedPlayer = sprite;
            for(var i=0;i<players.length;i++){
                players[i].alpha =0;
            }
            sprite.alpha = 1;
            memory = [sprite.x,sprite.y];
            move =game.add.tween(sprite).to({x:selectedPlayerPos.x,y:selectedPlayerPos.y},800).start();
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
            move.to({x:memory[0],y:memory[1]},300).start();
            for(var i=0;i<players.length;i++){
                if(players[i].alpha===0){
                    game.add.tween(players[i]).to({alpha:1},1000,null,false,1000).start();
                }
            }
            okBtn.alpha = 0;
            backBtn.alpha = 0;
        },

        update:function(){

        }
    };
});