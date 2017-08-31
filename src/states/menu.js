define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, 
        selected,
        bg,
        Players,
        memory,
        move,
        music;

    return {
        // Intro
        init: function () {
            game = this.game;

            // When in full-screen mode, take up as much of the screen as 
            // possible while maintaining game proportions.
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        },


        create: function () {
            var pos = 114;
            bg = game.add.sprite(pos,20,'menu-bg-1');
            bg.scale.setTo(2,2);
            Players = [
                {key:'white',entity:game.add.sprite(pos+229,100,'white-player')},
                {key:'green',entity:game.add.sprite(pos+371,100,'green-player')},
                {key:'blue',entity:game.add.sprite(pos+229,246,'blue-player')},
                {key:'red',entity:game.add.sprite(pos+371,246,'red-player')}
            ];
            for(var i=0;i<Players.length;i++){
                Players[i].entity.scale.setTo(2,2);
                Players[i].entity.inputEnabled = true;
                //Players[i].move = game.add.tween(Players[i].entity);

                Players[i].entity.events.onInputDown.add(function(sprite){
                    selected = 'chariot-'+ sprite.key.split('-')[0];
                    for(var i=0;i<Players.length;i++){
                        Players[i].entity.alpha =0;
                    }
                    sprite.alpha = 1;
                    memory = [sprite.x,sprite.y];
                    move =game.add.tween(sprite).to({x:pos+229,y:150},800).start();
                    selectBtn.alpha = 1;
                    backBtn.alpha = 1;
                    console.log(selected);
                });
            }
            var selectBtn = game.add.button(pos+371,410,'menu-btn',function(){
                music.onFadeComplete.addOnce(function() {
                    music.stop();
                    this.game.state.start('Play',true,false,{color:selected});
                }, this);
                music.fadeOut(1000);
            });
            selectBtn.scale.setTo(2,2);
            selectBtn.alpha = 0;
            var backBtn = game.add.button(pos+229,410,'menu-btn',function(){
                move.to({x:memory[0],y:memory[1]},300).start();
                for(var i=0;i<Players.length;i++){
                    if(Players[i].entity.alpha===0){
                        game.add.tween(Players[i].entity).to({alpha:1},1000,null,false,1000).start();
                    }

                }
                selectBtn.alpha = 0;
                backBtn.alpha = 0;

            });
            backBtn.scale.setTo(2,2);
            backBtn.alpha=0;
            // Music
            music = game.add.audio('menu-music', 0.5, true);
            music.play();

        },
        playerSelect:function(sprite){
            for(var i=0;i<Players.length;i++){
                Players[i].entity.alpha =0;
                //Players[i].entity.inputEnabled = false;
            }
            sprite.alpha = 1;
            game.add.tween(sprite).to({x:pos+229,y:200});
        },
        update:function(){

        }
    };
});