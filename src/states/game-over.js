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
            openTime = game.time.now;
            totalTimeout = 3000;

            dieText = game.add.text(game.width / 2, game.height / 2, 'You reached '+Math.floor(game.score)+' Points', {align: 'center', fill: '#ff279a'});
            dieText.anchor.set(0.5);
            var button = game.add.button(game.world.centerX,game.world.centerY+50,'play-button',function(){
                this.game.stateTransition.to('Menu',true,false);
            });

        }
    };
});