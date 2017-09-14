define([
    'phaser',
    'states/splash',
    'states/menu',
    'states/credits',
    'states/play',
    'states/game-over'
], function (Phaser, Splash, Menu, Credits, Play, GameOver) { 
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
            game.load.image('menu-bg-3', 'assets/menu_assets/ui_menu_bg_03.png');
            game.load.image('menu-banner-1', 'assets/menu_assets/ui_menu_banner_01.png');
            game.load.image('menu-banner-2', 'assets/menu_assets/ui_menu_banner_02.png');
            game.load.atlas('menu-btn', 'assets/menu_assets/ui_menu_button_01.png', 'assets/menu_assets/ui_menu_button_01.json');
            game.load.atlas('menu-btn2', 'assets/menu_assets/ui_menu_button_02.png', 'assets/menu_assets/ui_menu_button_02.json');
            game.load.atlas('menu-btn3', 'assets/menu_assets/ui_menu_button_03.png', 'assets/menu_assets/ui_menu_button_03.json');
            game.load.atlas('credits-btn', 'assets/menu_assets/credits-button.png', 'assets/menu_assets/credits-button.json');

            // Mute button
            game.load.atlas('mute-btn', 'assets/menu_assets/mute-button.png', 'assets/menu_assets/mute-button.json');

            // Spawnable objects
            game.load.atlas('spawn-warning', 'assets/sprites/spawn-warning.png', 'assets/sprites/spawn-warning.json');
            game.load.atlas('obstacle', 'assets/sprites/obstacle.png', 'assets/sprites/obstacle.json');
            game.load.atlas('token', 'assets/sprites/token.png', 'assets/sprites/token.json');
            game.load.atlas('power-up', 'assets/sprites/token-laurel.png', 'assets/sprites/token-laurel.json');

            // Splash screen
            game.load.image('title', 'assets/splash/title.png');
            game.load.atlas('tap-to-play-btn', 'assets/splash/tap-to-play-button.png', 'assets/splash/tap-to-play-button.json');

            // Blank placeholder (for Sprites without artwork)
            game.load.image('blank', 'assets/blank.png');

            // Music
            game.load.audio('menu-music', 'assets/music/Preparing_for_War.mp3');
            game.load.audio('race-music', 'assets/music/SuperHero_original.mp3');
            game.load.audio('credits-music', 'assets/music/Lines_of_Code.mp3');

            // SFX
            game.load.audio('token-collect', 'assets/sfx/Pickup_Coin.mp3');
            game.load.audio('powerup-collect', 'assets/sfx/sfx_coin_cluster5.mp3');
            game.load.audio('powerup-miss', 'assets/sfx/Randomize3.mp3');
            game.load.audio('speed-up', 'assets/sfx/qubodup-SpeedUp-trimmed.mp3');
            game.load.audio('slow-down', 'assets/sfx/qubodup-SlowDown-trimmed.mp3');
            game.load.audio('heartbeat', 'assets/sfx/heartbeat.mp3');
            game.load.audio('crash', 'assets/sfx/atari_boom.mp3');
            game.load.audio('lose', 'assets/sfx/Jingle_Lose_00.mp3');
            game.load.audio('menu-select', 'assets/sfx/roughSelect.mp3');
            game.load.audio('menu-back', 'assets/sfx/roughBack.mp3');

            // Fonts
            game.load.bitmapFont('boxy_bold', 'assets/font/boxy_bold.png', 'assets/font/boxy_bold.fnt');
        },
        
        // Main
        create: function () {
            // Add states to our game.
            game.state.add('Splash', Splash);
            game.state.add('Menu', Menu);
            game.state.add('Credits', Credits);
            game.state.add('Play', Play);
            game.state.add('GameOver', GameOver);

            // Now that everything is loaded, show the menu.
            game.stateTransition.to('Splash', true, false);

            // Debug: Skip Menu and go straight to Play (for dev testing)
            //game.stateTransition.to('Play',true,false,{color:'chariot-red'});
            //game.stateTransition.to('GameOver', true, false, {metersTraveled: 12345});
        }
    };
});