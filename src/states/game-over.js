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

            // create background
            var cont = game.add.sprite(114,80,'menu-bg-1');

            // create text elements
            // GAME over
            var gameOverText = new Phaser.BitmapText(game, cont.width/2, 30, 'boxy_bold', 'GAME OVER', 16);
            gameOverText.anchor.set(0.5);
            cont.addChild(gameOverText);

            // Scoring
            var scoreText = game.add.sprite(cont.width/2,cont.height/2,'score-text');
            scoreText.anchor.set(0.5,0.5);
            cont.addChild(scoreText);

            dieText = new Phaser.BitmapText(game, 0, 0, 'boxy_bold', 'DISTANCE TRAVELLED: '+game.score+'m', 16);
            dieText.anchor.set(0.5);
            scoreText.addChild(dieText);

            // play again button
            var againBtn = game.add.button(game.width/6*2,game.height/5*4,'menu-btn2',function(){
                this.game.stateTransition.to('Menu',true,false);
            });
            againBtn.anchor.set(0.5);
            var abtnText = new Phaser.BitmapText(game,0,0,'boxy_bold','PLAY AGAIN',16);
            abtnText.anchor.set(0.5,0.5);
            againBtn.addChild(abtnText);

            // challenge a friend button
            var challengeBtn = game.add.button(game.width/5*3,game.height/5*4,'menu-btn3',function(){
                window.location.href='recommend.html';
            });
            challengeBtn.anchor.set(0.5);
            var challengedText = new Phaser.BitmapText(game,0,0,'boxy_bold','CHALLANGE A FRIEND',16);
            challengedText.anchor.set(0.5,0.5);
            challengeBtn.addChild(challengedText);
        }
    };
});