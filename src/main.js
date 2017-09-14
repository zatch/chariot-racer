(function () {
    'use strict';

    requirejs.config({
        baseUrl: "src/",
        
        paths: {
            //  Edit the below path to point to where-ever you have placed the phaser.min.js file
            'phaser': 'lib/phaser/build/phaser.min',
            'phaser-transition': 'lib/phaser-state-transition-plugin/dist/phaser-state-transition-plugin.min',
            'swipe':'lib/phaser-swipe/swipe',
            'requireLib':'lib/requirejs/require'
        },

        include: [
            'phaser',
            'phaser-transition',
            'swipe',
            'requireLib',
            'main'
        ],

        shim: {
            'phaser': {
                exports: 'Phaser'
            },
            'swipe': {
                exports: 'Swipe'
            },
            'phaser-transition': {
                deps: ['phaser']
            }
        },

        name: 'main',
        out: 'main-built.js'
    });
 
    require(['phaser', 'game'], function (Phaser, Game) {
        var game = new Game();
        game.start();
    });
}());