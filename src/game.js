define([
    'phaser',
    'phaser-transition',
    'states/preload'
], function (Phaser, PhaserState, Preload) { 
    'use strict';

    function Game() {    
        console.log('Making the Game');    
    }
    
    Game.prototype = {
        constructor: Game,

        start: function() {
            this.game = new Phaser.Game(980, 620, Phaser.AUTO, '', {
                preload: this.preload, 
                create: this.create,
                init: this.init
            });
        },

        init: function () {
            this.game.stateTransition = this.game.plugins.add(Phaser.Plugin.StateTransition);
            console.log(Phaser.Plugin.StateTransition.In);
            console.log(Phaser.Plugin.StateTransition.Out);
            /*this.game.stateTransition.configure({
                duration: Phaser.Timer.SECOND * 0.8,
                ease: Phaser.Easing.Exponential.InOut,
                properties: {
                    alpha: 0,
                    scale: {
                        x: 1.4,
                        y: 1.4
                    }
                }
            });*/

            // Keep my pixels crisp and crunchy!
            this.game.stage.smoothed = false;
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        },

        preload: function() {
            this.game.load.image('preload-bg', 'assets/preload/preload-bg.png');
            this.game.load.image('preload-fill', 'assets/preload/preload-fill.png');
        },
        
        create: function() {
            // Set up game background
            this.game.stage.backgroundColor = '#0c0e11';


            this.game.state.add('Preload', Preload);
            this.game.state.start('Preload');
        }
    };
    
    return Game;
});