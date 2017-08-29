define([
    'phaser',
    'player',
    'spawner',
    'entity',
    'hud',
    'level-display',
    'level-data'
], function (
    Phaser,
    Player,
    Spawner,
    Entity,
    HUD,
    LevelDisplay,
    levelData) {

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

        spawner,
        obstacles,
        tokens,
        indicators,
        warnings,
        currentPatternTokenCount=0,
        currentTokensCollected=0,
        restDuration=2000, // ms between spawns
        warningDuration=1000, // ms between warning and spawn
        spawnTimer,

        currentLevel,
        currentLevelSpawnCount,
        levelDisplay,
        crowd,
        clouds1,
        clouds2,
        sfx={},
        soundOn=false,
        hud,
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
            laneHeight = 48;
            laneCount = 3;
            laneOffset = 27;

            // Set up game background
            game.stage.backgroundColor = '#add3ff';

            clouds1 = game.add.tileSprite(0, 0, game.width, 70, 'clouds1');
            clouds2 = game.add.tileSprite(0, 0, game.width, 70, 'clouds2');
            crowd = game.add.tileSprite(0, 41, game.width, 129, 'crowd');

            laneYCoords=[170,170+48*0.5,170+48*0.5+48*0.6];

            lanes = [
                game.add.tileSprite(0, laneYCoords[0], game.width, 48, 'dirt-track'),
                game.add.tileSprite(0, laneYCoords[1], game.width, 48, 'dirt-track'),
                game.add.tileSprite(0, laneYCoords[2], game.width, 48, 'dirt-track')
            ];

            lanes[0].scale.setTo(1, 0.5);
            lanes[1].scale.setTo(1, 0.6);
            lanes[2].scale.setTo(1, 0.7);

            spawnTimer = game.time.create(false);
            spawnTimer.start();
            this.setSpawnTimer();

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
                spread: 24, // px between indices in spawn pattern arrays
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
                        y: laneYCoords[0]+12,
                        spriteScale: 0.7
                    },
                    {
                        x: game.width,
                        y: laneYCoords[1]+14,
                        spriteScale: 0.8
                    },
                    {
                        x: game.width,
                        y: laneYCoords[2]+16,
                        spriteScale: 0.9
                    }
                ]
            });
            game.add.existing(spawner);

            // Insert player
            player = new Player(game, 160 , 0, playerKey);
            player.activeLane = 1;
            player.events.onDeath.add(this.onPlayerDeath);
            player.events.onPowerUpStart.add(this.onPowerUpStart, this);
            player.events.onPowerUpEnd.add(this.onPowerUpEnd, this);
            player.fixedToCamera = true;
            player.scale.setTo(0.6);
            player.cameraOffset.y = laneYCoords[player.activeLane] + 22;

            // setup input
            lanes[player.activeLane].frame =1;
            game.input.y = laneYCoords[player.activeLane];

            // Make player accessible via game object.
            game.player = player;

            game.add.existing(player);

            // HUD
            hud = new HUD(game);
            // mockup level
            levelDisplay = new LevelDisplay(game,0,0);
            game.add.existing(levelDisplay);
            levelDisplay.fixedToCamera = true;

            // SFX
            sfx.tokenCollect = game.sound.add('token-collect');
            sfx.powerUp = game.sound.add('power-up');
            sfx.crash = game.sound.add('crash');

            // Music
            if(soundOn){
                music = game.sound.add('race-music',0.25);
                music.fadeIn(2500, true);
            }

            currentLevel = 0;
            currentLevelSpawnCount = 0;
        },

        render: function () {
            
        },

        update: function () {
            // Direct input to player and do all the map and collision stuff.
            var newLane=player.activeLane;
            if(game.input.activePointer.isDown){
                if (game.input.y < laneYCoords[1]) {
                    newLane = 0;
                }
                else if (game.input.y > laneYCoords[2]) {
                    newLane = 2;
                }
                else {
                    newLane = 1;
                }
            }

            if(newLane!==player.activeLane){
                player.activeLane = newLane;
                lanes[0].frame = 0;
                lanes[1].frame = 0;
                lanes[2].frame = 0;
                lanes[player.activeLane].frame = 1;
                var targetY,
                    targetScale,
                    tweenDuration=100,
                    tweenEasing=Phaser.Easing.Cubic.In,
                    tweenAutoPlay=true;
                switch(player.activeLane){
                    case 0: 
                        targetY = laneYCoords[0]+18;
                        targetScale = {x: 0.55, y: 0.55};
                        break;
                    case 1:
                        targetY = laneYCoords[1]+22;
                        targetScale = {x: 0.6, y: 0.6};
                        break;
                    case 2:
                        targetY = laneYCoords[2]+26;
                        targetScale = {x: 0.65, y: 0.65};
                        break;
                }

                game.add.tween(player.cameraOffset).to({y:targetY}, tweenDuration, tweenEasing, tweenAutoPlay);
                game.add.tween(player.scale).to(targetScale, tweenDuration, tweenEasing, tweenAutoPlay);
            }

            metersTraveled += player.body.velocity.x / pixelsPerMeter;


            hud.updateDisplay(currentLevel,0,metersTraveled);

            // TO DO: Make Sprites and tileSprites move relative to teh same speed...not sure what's wrong here.
            lanes[0].tilePosition.x -= player.body.velocity.x;
            lanes[1].tilePosition.x -= player.body.velocity.x;
            lanes[2].tilePosition.x -= player.body.velocity.x;
            crowd.tilePosition.x -= player.body.velocity.x;
            clouds1.tilePosition.x -= player.body.velocity.x*0.1;
            clouds2.tilePosition.x -= player.body.velocity.x*0.09;

            // Clean up off-screen obstacles.
            obstacles.forEachAlive(function(obstacle) {
                obstacle.body.x -= player.body.velocity.x;

                // Recycle off-camera obstacles.
                // Not using killOffCamera because we want to start obstacles off camera.
                if(!obstacle.inCamera && obstacle.body.x < 0) {
                    // Recycle off-camera obstacles.
                    // Not using killOffCamera because we want to start obstacles off camera.
                    obstacle.kill();

                    // Check for and handle pattern completion.
                    this.checkPatternCompletion();
                }
            }, this);

            // Clean up off-screen tokens.
            tokens.forEachAlive(function(token) {
                token.body.x -= player.body.velocity.x;

                if(!token.inCamera && token.body.x < 0) {
                    // Recycle off-camera tokens.
                    // Not using killOffCamera because we want to start tokens off camera.
                    token.kill();

                    // Check for and handle pattern completion.
                    this.checkPatternCompletion();
                }
            }, this);

            // Collide player + obstacles.
            if (!player.invulnerable) {
                game.physics.arcade.overlap(player, obstacles, this.onPlayerCollidesObstacle, null, this);               
            }
            // Collide player + tokens.
            if (!player.dying) {
                game.physics.arcade.overlap(player, tokens, this.onPlayerCollidesToken, null, this);
            }
        },

        checkPatternCompletion: function () {
            // Mockup
            var eighth = 0;
            if(currentPatternTokenCount>0){
                eighth =  Math.floor(currentTokensCollected/currentPatternTokenCount*8);
            }
            levelDisplay.updateDisplay(currentLevel,eighth);

            // Pattern is complete if all obstacles and tokens are dead.
            if (obstacles.countLiving() === 0 && tokens.countLiving() ===0) {
                // boost
                player.powerUp(currentTokensCollected/currentPatternTokenCount);
                // Mockup
                var pseudoDeplete = player.powerupDuration/8;

                var stop = setInterval(function(){
                    if(eighth<1){
                        clearInterval(stop);
                    }
                    levelDisplay.updateDisplay(currentLevel,eighth);
                    eighth=eighth-1;
                    console.log(eighth);
                },pseudoDeplete);

                // Start new spawn timer.
                this.setSpawnTimer();
            }
        },

        shutdown: function () {
            // This prevents occasional momentary "flashes" during state transitions.
            game.camera.unfollow();
        },

        onPlayerCollidesObstacle: function (player, enemy) {
            sfx.crash.play();
            player.damage();

            // Check for and handle pattern completion.
            this.checkPatternCompletion();
        },

        onPlayerCollidesToken: function (player, token) {
            // TO DO: Animate tokens into HUD before killing them.
            sfx.tokenCollect.play();
            token.kill();
            currentTokensCollected++;



            
            // Check for and handle pattern completion.
            this.checkPatternCompletion();
        },

        onPlayerDeath: function (player) {
            game.camera.unfollow();
            metersTraveled = 0;
            game.stateTransition.to('GameOver', true, false);
            if(soundOn){
                music.fadeOut(2500);
            }

        },

        onPowerUpStart: function () {
            sfx.powerUp.play();
            spawnTimer.pause();
        },

        onPowerUpEnd: function () {
            spawnTimer.resume();
        },

        setSpawnTimer: function () {
            spawnTimer.add(restDuration, this.spawnPattern, this);
        },

        clearSpawnTimer: function () {
            spawnTimer.removeAll();
        },

        spawnPattern: function () {
            var currentLevelData = levelData[currentLevel];

            // Advance level, if:
            //      - Level has reached its max spawn count
            //      - We aren't already at max level
            if (currentLevelSpawnCount >= currentLevelData.maxSpawns &&
                currentLevel < levelData.length - 1) {
                currentLevel++;
                currentLevelSpawnCount = 0;
                currentLevelData = levelData[currentLevel];
            }

            // Pick a pattern from the level.
            var patternIndex = Math.floor(Math.random() * currentLevelData.patterns.length);
            var pattern = currentLevelData.patterns[patternIndex];
            
            // Send the pattern's lanes to the spawn queue.
            var lanes = pattern.lanes;
            spawner.queue(lanes);

            // Reset power-up counters.
            currentTokensCollected = 0;
            currentPatternTokenCount = pattern.tokenCount;

            // Increment spawn count for this level.
            currentLevelSpawnCount++;
        }
    };
});