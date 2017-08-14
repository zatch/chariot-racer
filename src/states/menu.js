define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, selected;

    return {
        // Intro
        init: function () {
            game = this.game;

            // When in full-screen mode, take up as much of the screen as 
            // possible while maintaining game proportions.
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        },

        create: function () {
            var Players = [
                {key:'white',entity:game.add.sprite(0,0,'white-player')},
                {key:'green',entity:game.add.sprite(game.width/4,0,'green-player')},
                {key:'blue',entity:game.add.sprite(game.width/4*2,0,'blue-player')},
                {key:'red',entity:game.add.sprite(game.width/4*3,0,'red-player')}
            ];
            for(var i=0;i<Players.length;i++){
                Players[i].entity.inputEnabled = true;
                Players[i].entity.events.onInputDown.add(function(sprite){
                    selected = 'chariot-'+ sprite.key.split('-')[0];

                    console.log(selected);
                });
            }
            var button = game.add.button(game.world.centerX,game.world.centerY,'skull',function(){
                this.game.state.start('Play',true,false,{color:selected});
            });



        },
        update:function(){

        }
    };
});