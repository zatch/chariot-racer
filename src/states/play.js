define([
    'phaser',
    'player',
    'spawner',
    'finish-line',
    'token',
    'obstacle',
    'hud',
    'level-display',
    'level-data'
], function (
    Phaser,
    Player,
    Spawner,
    FinishLine,
    Token,
    Obstacle,
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
        finishLine,
        obstacles,
        tokens,
        indicators,
        warnings,
        currentPatternTokenCount=0,
        currentTokensCollected=0,
        restDuration=2000, // ms between spawns
        warningDuration=1000, // ms between warning and spawn
        spawnTimer,

        inPattern=false,
        currentLevel,
        currentLevelSpawnCount,
        levelDisplay,
        crowd,
        sky,
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

            sky = game.add.tileSprite(0, 0, game.width, 76, 'sky');
            clouds1 = game.add.tileSprite(0, 0, game.width, 66, 'clouds1');
            clouds2 = game.add.tileSprite(0, 0, game.width, 78, 'clouds2');
            crowd = game.add.tileSprite(0, 94, game.width, 129, 'crowd');

            sky.scale.setTo(2, 2);
            clouds1.scale.setTo(2, 2);
            clouds2.scale.setTo(2, 2);
            crowd   .scale.setTo(2, 2);

            laneYCoords=[352,352+48,352+48+48*1.2];

            lanes = [
                game.add.tileSprite(0, laneYCoords[0], game.width, 48, 'dirt-track'),
                game.add.tileSprite(0, laneYCoords[1], game.width, 48, 'dirt-track'),
                game.add.tileSprite(0, laneYCoords[2], game.width, 48, 'dirt-track')
            ];

            lanes[0].scale.setTo(1, 1);
            lanes[1].scale.setTo(1, 1.2);
            lanes[2].scale.setTo(1, 1.4);

            spawnTimer = game.time.create(false);
            spawnTimer.start();
            this.setSpawnTimer();

            // Tokens
            tokens = game.add.group();
            tokens.classType = Token;
            
            // Obstacles
            obstacles = game.add.group();
            obstacles.classType = Obstacle;

            // Warnings
            warnings = game.add.group();

            // Finish line
            finishLine = new FinishLine(game, -100, 352);
            finishLine.scale.setTo(2, 2);
            game.add.existing(finishLine);

            // Spawner
            spawner = new Spawner(game, 0, 0, 'blank', 0, 
            {
                spread: 48, // px between indices in spawn pattern arrays
                warningDuration: 1000,
                warningSpread: 10,
                warningGroup: warnings,
                finishLine: finishLine,
                spawnableObjects: {
                    'scaffolding': {
                        group: obstacles
                    },
                    'wheel': {
                        group: obstacles
                    },
                    'rock': {
                        group: obstacles
                    },
                    'token': {
                        group: tokens
                    }
                },
                lanes: [
                    {
                        x: game.width,
                        y: laneYCoords[0]+24,
                        spriteScale: 1.4
                    },
                    {
                        x: game.width,
                        y: laneYCoords[1]+28,
                        spriteScale: 1.6
                    },
                    {
                        x: game.width,
                        y: laneYCoords[2]+32,
                        spriteScale: 1.8
                    }
                ]
            });
            spawner.events.onSpawn.add(this.onSpawnerSpawn, this);
            game.add.existing(spawner);

            // Insert player
            player = new Player(game, 320 , 0, playerKey);
            player.activeLane = 1;
            player.events.onDeath.add(this.onPlayerDeath);
            player.events.onPowerUpStart.add(this.onPowerUpStart, this);
            player.events.onPowerUpEnd.add(this.onPowerUpEnd, this);
            player.fixedToCamera = true;
            player.scale.setTo(1.2);
            player.cameraOffset.y = laneYCoords[player.activeLane] + 44;

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
                        targetY = laneYCoords[0]+36;
                        targetScale = {x: 1.1, y: 1.1};
                        break;
                    case 1:
                        targetY = laneYCoords[1]+44;
                        targetScale = {x: 1.2, y: 1.2};
                        break;
                    case 2:
                        targetY = laneYCoords[2]+52;
                        targetScale = {x: 1.3, y: 1.3};
                        break;
                }

                game.add.tween(player.cameraOffset).to({y:targetY}, tweenDuration, tweenEasing, tweenAutoPlay);
                game.add.tween(player.scale).to(targetScale, tweenDuration, tweenEasing, tweenAutoPlay);
            }

            metersTraveled += player.body.velocity.x / pixelsPerMeter;


            hud.updateDisplay(currentLevel,0,metersTraveled);

            // TO DO: Make Sprites and tileSprites move relative to teh same speed...not sure what's wrong here.
            lanes[0].tilePosition.x -= player.body.velocity.x/2;
            lanes[1].tilePosition.x -= player.body.velocity.x/2;
            lanes[2].tilePosition.x -= player.body.velocity.x/2;
            crowd.tilePosition.x -= player.body.velocity.x/2;
            clouds1.tilePosition.x -= player.body.velocity.x/2*0.1;
            clouds2.tilePosition.x -= player.body.velocity.x/2*0.09;

            finishLine.body.x -= player.body.velocity.x;

            // Clean up off-screen obstacles.
            obstacles.forEachAlive(function(obstacle) {
                obstacle.body.x -= player.body.velocity.x;

                // Recycle off-camera obstacles.
                // Not using killOffCamera because we want to start obstacles off camera.
                if(!obstacle.inCamera && obstacle.body.x < 0) {
                    // Recycle off-camera obstacles.
                    // Not using killOffCamera because we want to start obstacles off camera.
                    obstacle.kill();
                }
            }, this);

            // Clean up off-screen tokens.
            tokens.forEachAlive(function(token) {
                token.body.x -= player.body.velocity.x;

                if(!token.inCamera && token.body.x < 0) {
                    // Recycle off-camera tokens.
                    // Not using killOffCamera because we want to start tokens off camera.
                    token.kill();
                }
            }, this);

            // Collide player + obstacles.
            if (!player.invulnerable) {
                game.physics.arcade.overlap(player, obstacles, this.onPlayerCollidesObstacle, null, this);               
            }
            // Collide player + tokens.
            if (!player.dying) {
                game.physics.arcade.overlap(player, tokens, this.onPlayerCollidesToken, null, this);
                game.physics.arcade.overlap(player, finishLine, this.onPlayerCollidesFinishLine, null, this);
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

            // Mockup
            var eighth = 0;
            if(currentPatternTokenCount>0){
                eighth =  Math.floor(currentTokensCollected/currentPatternTokenCount*8);
            }
            levelDisplay.updateDisplay(currentLevel,eighth);
        },

        onPlayerCollidesFinishLine: function (player, fLine) {
            if (inPattern) {
                // Clear flag.
                inPattern = false;

                // Mockup
                var eighth = 0;
                if(currentPatternTokenCount>0){
                    eighth =  Math.floor(currentTokensCollected/currentPatternTokenCount*8);
                }
                levelDisplay.updateDisplay(currentLevel,eighth);

                // boost
                player.powerUp(currentTokensCollected/currentPatternTokenCount);
                // Mockup
                var pseudoDeplete = player.powerupDuration/8;
                var self = this;
                var stop = setInterval(function(){
                    if(eighth<1){
                        clearInterval(stop);
                        self.setSpawnTimer();
                    }
                    levelDisplay.updateDisplay(currentLevel,eighth);
                    eighth=eighth-1;
                    console.log(eighth);
                },pseudoDeplete);
            }
        },

        onPlayerDeath: function (player) {
            game.camera.unfollow();
            metersTraveled = 0;
            game.time.events.add(Phaser.Timer.SECOND * 2, function () {
                game.stateTransition.to('GameOver', true, false);
                if(soundOn){
                    music.fadeOut(2500);
                }
            }, this);
        },

        onSpawnerSpawn: function () {
            // Set flag.
            inPattern = true;
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