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
            this.game.load.atlas('skull-warning', 'assets/sprites/obstacle-warning.png', 'assets/sprites/obstacle-warning.json');
            this.game.load.atlas('token-warning', 'assets/sprites/token-warning.png', 'assets/sprites/token-warning.json');

            // Chariot racers
            this.game.load.atlas('chariot-blue', 'assets/sprites/chariot-blue.png', 'assets/sprites/chariot-blue.json');
            this.game.load.atlas('chariot-green', 'assets/sprites/chariot-green.png', 'assets/sprites/chariot-green.json');
            this.game.load.atlas('chariot-red', 'assets/sprites/chariot-red.png', 'assets/sprites/chariot-red.json');
            this.game.load.atlas('chariot-white', 'assets/sprites/chariot-white.png', 'assets/sprites/chariot-white.json');

            // warriors
            this.game.load.image('blue-player', 'assets/textures/blue-warrior.png');
            this.game.load.image('red-player', 'assets/textures/red-warrior.png');
            this.game.load.image('white-player', 'assets/textures/white-warrior.png');
            this.game.load.image('green-player', 'assets/textures/green-warrior.png');

            // Obstacles
            this.game.load.image('skull', 'assets/sprites/skull.png');

            // Power-ups
            this.game.load.image('power-up', 'assets/sprites/power-up.png');
            this.game.load.spritesheet('token', 'assets/sprites/coin.png', 16, 16, 18);

            // Blank placeholder (for Sprites without artwork)
            this.game.load.image('blank', 'assets/blank.png');

            // Music
            this.load.audio('menu-music', 'assets/music/Preparing_for_War.mp3');
            this.load.audio('race-music', 'assets/music/SuperHero_original_no_Intro.mp3');

            // SFX
            this.load.audio('token-collect', 'assets/sfx/coin10.mp3');
            this.load.audio('power-up', 'assets/sfx/power-up-amped-and-crushed.mp3');
            this.load.audio('crash', 'assets/sfx/atari_boom.wav');
            // Buttons
            this.game.load.image('play-button','assets/textures/play-button.png')
        },
        
        create: function() {
            // Add states to our game.
            this.game.state.add('Menu', Menu);
            this.game.state.add('Play', Play);
            this.game.state.add('GameOver', GameOver);

            // Now that everything is loaded, show the menu.
            this.game.state.start('Menu');
        }
    };
    
    return Game;
});