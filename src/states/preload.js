define([
    'phaser',
    'states/menu',
    'states/play',
    'states/game-over'
], function (Phaser, Menu, Play, GameOver) { 
    'use strict';

    // Shortcuts
    var game,
        bg,
        fill;

    return {
        // Intro
        init: function () {
            // Shortcut variables.
            game = this.game;
        },

        preload: function () {
            bg = game.add.sprite(game.width/2, game.height/2, 'preload-bg');
            bg.anchor.set(0.5);

            fill = game.add.sprite(game.width/2, game.height/2-3, 'preload-fill');
            fill.x -= fill.width/2;
            game.load.setPreloadSprite(fill);

            // World textures
            game.load.image('crowd', 'assets/textures/crowd.png');
            game.load.image('ground', 'assets/textures/ground.png');
            game.load.image('sky', 'assets/textures/sky.png');
            game.load.image('clouds1', 'assets/textures/clouds1.png');
            game.load.image('clouds2', 'assets/textures/clouds2.png');
            game.load.image('active-lane-marker', 'assets/textures/active-lane-marker.png');
            game.load.image('foreground', 'assets/textures/foreground.png');
            game.load.image('finish-line', 'assets/sprites/finish-line.png');

            // HUD
            game.load.image('hud-frame', 'assets/hud/hud-frame.png');
            game.load.image('boost-meter-fill', 'assets/hud/boost-meter-fill.png');
            game.load.atlas('bonus-text', 'assets/sprites/bonus-text.png', 'assets/sprites/bonus-text.json');

            // Chariot racers
            game.load.atlas('chariot-blue', 'assets/sprites/chariot-blue.png', 'assets/sprites/chariot-blue.json');
            game.load.atlas('chariot-green', 'assets/sprites/chariot-green.png', 'assets/sprites/chariot-green.json');
            game.load.atlas('chariot-red', 'assets/sprites/chariot-red.png', 'assets/sprites/chariot-red.json');
            game.load.atlas('chariot-white', 'assets/sprites/chariot-white.png', 'assets/sprites/chariot-white.json');

            // Menu & game over
            game.load.atlas('blue-player', 'assets/menu_assets/ui_menu_button_chariot_blue.png', 'assets/menu_assets/ui_menu_button_chariot_blue.json');
            game.load.atlas('red-player', 'assets/menu_assets/ui_menu_button_chariot_red.png', 'assets/menu_assets/ui_menu_button_chariot_red.json');
            game.load.atlas('white-player', 'assets/menu_assets/ui_menu_button_chariot_white.png', 'assets/menu_assets/ui_menu_button_chariot_white.json');
            game.load.atlas('green-player', 'assets/menu_assets/ui_menu_button_chariot_green.png', 'assets/menu_assets/ui_menu_button_chariot_green.json');
            game.load.image('menu-bg-1', 'assets/menu_assets/ui_menu_bg_01.png');
            game.load.image('menu-bg-2', 'assets/menu_assets/ui_menu_bg_02.png');
            game.load.image('score-text', 'assets/menu_assets/ui_menu_banner_01.png');
            game.load.image('menu-btn', 'assets/menu_assets/ui_menu_button_01.png');
            game.load.image('menu-btn2', 'assets/menu_assets/ui_menu_button_02.png');
            game.load.image('menu-btn3', 'assets/menu_assets/ui_menu_button_03.png');

            // Spawnable objects
            game.load.atlas('spawn-warning', 'assets/sprites/spawn-warning.png', 'assets/sprites/spawn-warning.json');
            game.load.atlas('obstacle', 'assets/sprites/obstacle.png', 'assets/sprites/obstacle.json');
            game.load.atlas('token', 'assets/sprites/token.png', 'assets/sprites/token.json');

            // Blank placeholder (for Sprites without artwork)
            game.load.image('blank', 'assets/blank.png');

            // Music
            game.load.audio('menu-music', 'assets/music/Preparing_for_War.mp3');
            game.load.audio('race-music', 'assets/music/SuperHero_original.mp3');

            // SFX
            game.load.audio('token-collect', 'assets/sfx/Pickup_Coin.mp3');
            game.load.audio('speed-up', 'assets/sfx/qubodup-SpeedUp-trimmed.mp3');
            game.load.audio('slow-down', 'assets/sfx/qubodup-SlowDown-trimmed.mp3');
            game.load.audio('heartbeat', 'assets/sfx/heartbeat.mp3');
            game.load.audio('crash', 'assets/sfx/atari_boom.wav');
            game.load.audio('lose', 'assets/sfx/Jingle_Lose_00.mp3');

            // Fonts
            game.load.bitmapFont('boxy_bold', 'assets/font/boxy_bold.png', 'assets/font/boxy_bold.fnt');
        },
        
        // Main
        create: function () {
            // Add states to our game.
            game.state.add('Menu', Menu);
            game.state.add('Play', Play);
            game.state.add('GameOver', GameOver);

            // Now that everything is loaded, show the menu.
            game.stateTransition.to('Menu', true, false);

            // Debug: Skip Menu and go straight to Play (for dev testing)
            //game.stateTransition.to('Play',true,false,{color:'chariot-red'});
        }
    };
});