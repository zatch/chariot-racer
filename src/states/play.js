define([
    'phaser',
    'player',
    'spawn-patterns',
    'spawner',
    'power-up',
    'entity',
    'laps-display',
    'distance-display',
    'level-display',
    'swipe'
], function (
    Phaser,
    Player,
    spawnPatterns,
    Spawner,
    PowerUp,
    Entity,
    LapsDisplay,
    DistanceDisplay,
    LevelDisplay,
    Swipe) {

    'use strict';
    
    // Shortcuts
    var game, 
        moveKeys, 

        player,
        playerKey,
        laneHeight,
        laneCount,
        laneOffset,
        lanes,
        laneYCoords,

        pixelsPerMeter=30, // Divisor for Phaser-to-reality physics conversion
        metersTraveled=0,
        metersPerLap=1000,
        currentLap=1,

        spawner,
        obstacles,
        tokens,
        warnings,
        currentPatternTokenCount,
        currentTokensCollected=0,
        restDuration=5000, // ms between spawns
        warningDuration=1000, // ms between warning and spawn
        spawnTimer,

        currentLevel,

        crowd,
        clouds1,
        clouds2,
        lapsDisplay,
        distanceDisplay,
        levelDisplay,
        sfx={},
        soundOn=true,
        music;

    return {
        // Intro
        init: function (data) {

            // Shortcut variables.
            game = this.game;
            playerKey = data.color;
            game.spriteClassTypes = {
                'skull': Phaser.Sprite,
                'token': Phaser.Sprite
            };
        },
        
        // Main
        create: function () {

            var self = this;
            game.score =0;
            laneHeight = 48;
            laneCount = 3;
            laneOffset = 27;

            // Set up game background
            game.stage.backgroundColor = '#add3ff';

            clouds1 = game.add.tileSprite(0, 0, game.width, 70, 'clouds1');
            clouds2 = game.add.tileSprite(0, 0, game.width, 70, 'clouds2');
            
            crowd = game.add.tileSprite(0, 70, game.width, 100, 'crowd');

            laneYCoords=[170,170+36,170+36+48];

            lanes = [
                game.add.tileSprite(0, laneYCoords[0], game.width, 48, 'dirt-track'),
                game.add.tileSprite(0, laneYCoords[1], game.width, 48, 'dirt-track'),
                game.add.tileSprite(0, laneYCoords[2], game.width, 48, 'dirt-track')
            ];

            lanes[0].scale.setTo(1, 0.75);
            lanes[1].scale.setTo(1, 1);
            lanes[2].scale.setTo(1, 1.25);

            spawnTimer = game.time.create(false);
            spawnTimer.start();
            spawnTimer.add(restDuration, this.spawnPattern, this);

            // Obstacles
            obstacles = game.add.group();
            obstacles.enableBody = true;

            // Tokens
            tokens = game.add.group();
            tokens.enableBody = true;

            // Warnings
            warnings = game.add.group();

            // Spawner
            spawner = new Spawner(game, 0, 0, 'blank', 0, 
            {
                spread: 100, // px between indices in spawn pattern arrays
                warningDuration: 1000,
                warningSpread: 5,
                warningGroup: warnings,
                spawnableObjects: {
                    'skull': {
                        group: obstacles
                    },
                    'token': {
                        group: tokens
                    }
                },
                lanes: [
                    {
                        x: game.width,
                        y: laneYCoords[0]+6,
                        spriteScale: 0.75
                    },
                    {
                        x: game.width+30,
                        y: laneYCoords[1]+9,
                        spriteScale: 1
                    },
                    {
                        x: game.width+60,
                        y: laneYCoords[2]+12,
                        spriteScale: 1.25
                    }
                ]
            });
            game.add.existing(spawner);

            // Insert player
            player = new Player(game, 260 , 0, playerKey);
            player.activeLane = 1;
            player.events.onDeath.add(this.onPlayerDeath);
            player.events.onPowerUpStart.add(this.onPowerUpStart, this);
            player.events.onPowerUpEnd.add(this.onPowerUpEnd, this);
            player.fixedToCamera = true;
            player.scale.setTo(0.8);
            player.cameraOffset.y = laneYCoords[player.activeLane] - 12;

            // Make player accessible via game object.
            game.player = player;

            game.add.existing(player);

            // HUD

            distanceDisplay = new DistanceDisplay(game, 0, 0);
            game.add.existing(distanceDisplay);
            distanceDisplay.fixedToCamera = true;
            distanceDisplay.cameraOffset.x = 4;
            distanceDisplay.cameraOffset.y = 4;

            lapsDisplay = new LapsDisplay(game, 0, 0);
            game.add.existing(lapsDisplay);
            lapsDisplay.updateDisplay(currentLap);
            levelDisplay = new LevelDisplay(game);
            game.add.existing(levelDisplay);
            levelDisplay.updateDisplay(currentLevel,currentTokensCollected);

            this.swipe = new Swipe(game);
            this.swipe.dragLength = 25;

            // SFX
            sfx.tokenCollect = game.add.audio('token-collect');
            sfx.powerUp = game.add.audio('power-up');
            sfx.crash = game.add.audio('crash');

            // Music
            if(soundOn){
                music = game.add.audio('race-music', 0.25);
                music.fadeIn(2500, true);
            }



            currentLevel = 0;
        },

        render: function () {
            
        },

        update: function () {
            // Direct input to player and do all the map and collision stuff.
            var direction = this.swipe.check();
            if(direction!==null){
                switch(direction.direction){
                    case this.swipe.DIRECTION_UP: 
                    case this.swipe.DIRECTION_UP_RIGHT: 
                    case this.swipe.DIRECTION_UP_LEFT:
                        if(game.player.activeLane>0){
                            game.player.activeLane -=1;
                        }
                        break;
                    case this.swipe.DIRECTION_DOWN:
                    case this.swipe.DIRECTION_DOWN_RIGHT:
                    case this.swipe.DIRECTION_DOWN_LEFT:
                        if(game.player.activeLane<2){
                            game.player.activeLane +=1;
                        }
                        break;
                }
                // TO DO: Move lane positioning to a helper function or new class
                // TO DO: Make it so we don't need  all these hard-coded y-coord offsets.
                var targetY, 
                    targetScale, 
                    tweenDuration=100,
                    tweenEasing=Phaser.Easing.Cubic.In,
                    tweenAutoPlay=true;
                switch(player.activeLane){
                    case 0: 
                        targetY = laneYCoords[0]-10;
                        targetScale = {x: 0.6, y: 0.6};
                        break;
                    case 1:
                        targetY = laneYCoords[1]-12;
                        targetScale = {x: 0.8, y: 0.8};
                        break;
                    case 2:
                        targetY = laneYCoords[2]-14;
                        targetScale = {x: 1, y: 1};
                        break;
                }

                game.add.tween(player.cameraOffset).to({y:targetY}, tweenDuration, tweenEasing, tweenAutoPlay);
                game.add.tween(player.scale).to(targetScale, tweenDuration, tweenEasing, tweenAutoPlay);
            }

            metersTraveled += player.body.velocity.x / pixelsPerMeter;
            distanceDisplay.updateDisplay(metersTraveled);

            currentLap = (metersTraveled / metersPerLap);
            lapsDisplay.updateDisplay(currentLap);

            // TO DO: Make Sprites and tileSprites move relative to teh same speed...not sure what's wrong here.
            lanes[0].tilePosition.x -= player.body.velocity.x*0.8;
            lanes[1].tilePosition.x -= player.body.velocity.x*0.9;
            lanes[2].tilePosition.x -= player.body.velocity.x;
            crowd.tilePosition.x -= player.body.velocity.x*0.6;
            clouds1.tilePosition.x -= player.body.velocity.x*0.1;
            clouds2.tilePosition.x -= player.body.velocity.x*0.09;
            obstacles.forEach(function(obstacle) {
                switch(obstacle.activeLane){
                    case 0:
                        obstacle.body.x -= player.body.velocity.x*0.8;
                        break;
                    case 1:
                        obstacle.body.x -= player.body.velocity.x*0.9;
                        break;
                    case 2:
                        obstacle.body.x -= player.body.velocity.x;
                        break;
                }

                // Recycle off-camera obstacles.
                // Not using killOffCamera because we want to start obstacles off camera.
                if(!obstacle.inCamera && obstacle.body.x < 0) obstacle.kill();
            }, this);

            tokens.forEach(function(token) {
                switch(token.activeLane){
                    case 0:
                        token.body.x -= player.body.velocity.x*0.8;
                        break;
                    case 1:
                        token.body.x -= player.body.velocity.x*0.9;
                        break;
                    case 2:
                        token.body.x -= player.body.velocity.x;
                        break;
                }

                // Recycle off-camera obstacles.
                // Not using killOffCamera because we want to start obstacles off camera.
                if(!token.inCamera && token.body.x < 0) token.kill();
            }, this);

            // Collide player + obstacles.
            if (!player.invulnerable) {
                game.physics.arcade.overlap(player, obstacles, this.onPlayerCollidesObstacle);               
            }
            // Collide player + tokens.
            if (!player.dying) {
                console.log(currentTokensCollected);
                game.physics.arcade.overlap(player, tokens, this.onPlayerCollidesToken);
                levelDisplay.updateDisplay(currentLevel,currentTokensCollected);
            }
        },

        shutdown: function () {
            // This prevents occasional momentary "flashes" during state transitions.
            game.camera.unfollow();
        },

        onPlayerCollidesObstacle: function (player, enemy) {
            sfx.crash.play();
            player.damage();
        },

        onPlayerCollidesToken: function (player, token) {
            // TO DO: Animate tokens into HUD before killing them.
            sfx.tokenCollect.play();
            token.kill();
            currentTokensCollected++;
            if (currentTokensCollected >= 8) {
                player.powerUp();
                currentLevel++;
                currentTokensCollected = 0;
            }
        },

        onPlayerDeath: function (player) {
            game.camera.unfollow();
            game.score = currentLevel*.7*metersTraveled;
            currentLevel = 1;
            metersTraveled = 0;
            game.stateTransition.to('GameOver', true, false);
            if(soundOn){
                music.stop();
            }

        },

        onPowerUpStart: function () {
            sfx.powerUp.play();
            spawnTimer.pause();
        },

        onPowerUpEnd: function () {
            spawnTimer.resume();
        },

        spawnPattern: function () {
            spawner.queue(spawner.find(currentLevel));
            if(currentLevel===0){
                currentLevel++;
            }
            spawnTimer.add(restDuration, this.spawnPattern, this);
        }
    };
});