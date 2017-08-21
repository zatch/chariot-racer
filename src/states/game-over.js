define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,
        dieText,
        music,
        openTime,
        totalTimeout,
        timeRemaining,
        data;

    return {
        // Intro
        init: function (_data) {
            // Shortcut variables.
            game = this.game;
            data = _data;
            console.log(data);
        },

        update: function () {
            timeRemaining = totalTimeout - (game.time.now - openTime);
            if(timeRemaining < 0) timeRemaining = 0;
        },
        
        // Main
        create: function () {
            game.stage.backgroundColor = "#616161";
            openTime = game.time.now;
            totalTimeout = 3000;
            music = game.add.audio('menu-music', 0.5, true);
            music.play();
            dieText = game.add.text(game.width / 2, game.height / 2, 'You reached '+Math.floor(game.score)+' Points', {align: 'center', fill: '#ff279a'});
            dieText.anchor.set(0.5);
            var button = game.add.button(game.world.centerX,game.world.centerY+50,'play-button',function(){
                music.onFadeComplete.addOnce(function() {
                    music.stop();
                    this.game.state.start('Menu',true,false);
                }, this);
                music.fadeOut(1000);
            });

        }
    };
});