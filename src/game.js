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
            this.game.load.image('crowd', 'assets/textures/crowd.png');
            this.game.load.image('clouds1', 'assets/textures/clouds1.png');
            this.game.load.image('clouds2', 'assets/textures/clouds2.png');

            // HUD
            //this.game.load.image('distance-display', 'assets/hud/distance-display.png');
            this.game.load.atlas('lane-warning', 'assets/hud/lane-warning.png', 'assets/hud/lane-warning.json');

            // Chariot racers
            this.game.load.atlas('chariot-blue', 'assets/sprites/chariot-blue.png', 'assets/sprites/chariot-blue.json');
            this.game.load.atlas('chariot-green', 'assets/sprites/chariot-green.png', 'assets/sprites/chariot-green.json');
            this.game.load.atlas('chariot-red', 'assets/sprites/chariot-red.png', 'assets/sprites/chariot-red.json');
            this.game.load.atlas('chariot-white', 'assets/sprites/chariot-white.png', 'assets/sprites/chariot-white.json');

            // Obstacles
            this.game.load.image('skull', 'assets/sprites/skull.png');

            // Power-ups
            this.game.load.image('power-up', 'assets/sprites/power-up.png');

            // Blank placeholder (for Sprites without artwork)
            this.game.load.image('blank', 'assets/blank.png');

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