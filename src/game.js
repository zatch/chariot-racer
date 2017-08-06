define([
    'phaser',
    'phaser-transition',
    'states/menu',
    'states/play',
    'states/game-over'
], function (Phaser, PhaserState, Menu, Play, GameOver) { 
    'use strict';

    function Game() {    
        console.log('Making the Game');    
    }
    
    Game.prototype = {
        constructor: Game,

        start: function() {
            this.game = new Phaser.Game(490, 310, Phaser.AUTO, '', {
                preload: this.preload, 
                create: this.create,
                init: this.init
            });

        },

        init: function () {
            this.game.stateTransition = this.game.plugins.add(Phaser.Plugin.StateTransition);

            this.game.stateTransition.configure({
                duration: Phaser.Timer.SECOND * 0.8,
                ease: Phaser.Easing.Exponential.InOut,
                properties: {
                    alpha: 0,
                    scale: {
                        x: 1.4,
                        y: 1.4
                    }
                }
            });

            // Keep my pixels crisp and crunchy!
            this.game.stage.smoothed = false;
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        },

        preload: function() {
            // World textures
            this.game.load.image('dirt-track', 'assets/textures/dirt-track.png');
            this.game.load.image('clouds1', 'assets/textures/clouds1.png');

            // Chariot racers
            this.game.load.atlas('chariot', 'assets/sprites/chariot.png', 'assets/sprites/chariot.json');

            // Obstacles
            this.game.load.image('skull', 'assets/sprites/skull.png');

        },
        
        create: function() {
            // Add states to our game.
            this.game.state.add('Menu', Menu);
            this.game.state.add('Play', Play);
            this.game.state.add('GameOver', GameOver);

            // Now that everything is loaded, show the menu.
            this.game.state.start('Play');
        }
    };
    
    return Game;
});