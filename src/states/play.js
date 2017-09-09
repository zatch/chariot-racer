define([
    'phaser',
    'mute-button',
    'player',
    'spawner',
    'token',
    'power-up',
    'obstacle',
    'spawn-warning',
    'hud',
    'level-data'
], function (
    Phaser,
    MuteButton,
    Player,
    Spawner,
    Token,
    PowerUp,
    Obstacle,
    SpawnWarning,
    HUD,
    levelData) {

    'use strict';
    
    // Shortcuts
    var game, 
        gameWorld,

        player,
        playerKey,
        laneHeight,
        laneCount,
        laneOffset,
        laneYCoords=[370,420,476],

        pixelsPerMeter=60, // Divisor for Phaser-to-reality physics conversion
        metersTraveled,

        spawner,
        setMarker,
        finishLine,
        powerupToken,
        lanes,
        currentPatternTokenCount=0,
        currentTokensCollected=0,
        restDuration=2000, // ms between spawns
        spawnTimer,

        inPattern=false,
        currentLevel,
        currentLevelSpawnCount,
        crowd,
        ground,
        foreground,
        sky,
        clouds1,
        clouds2,
        activeLaneMarker,
        sfx={},
        hud,
        music;

    return {
        // Intro
        init: function (data) {

            // Shortcut variables.
            game = this.game;
            playerKey = data.color;
        },
        
        // Main
        create: function () {

            var self = this;

            gameWorld = game.add.group();

            laneHeight = 48;
            laneCount = 3;
            laneOffset = 27;

            sky = gameWorld.add(new Phaser.TileSprite(game, 0, -28, game.width+50, 180, 'sky'));
            clouds1 = gameWorld.add(new Phaser.TileSprite(game, 0, 18, game.width+50, 128, 'clouds1'));
            clouds2 = gameWorld.add(new Phaser.TileSprite(game, 0, 8, game.width+50, 128, 'clouds2'));
            crowd = gameWorld.add(new Phaser.TileSprite(game, 0, 94, game.width+50, 258, 'crowd'));
            ground = gameWorld.add(new Phaser.TileSprite(game, 0, 352, game.width+50, 226, 'ground'));

            // Finish line
            finishLine = new Phaser.Sprite(game, -500, 352, 'finish-line');
            game.physics.enable(finishLine);
            gameWorld.add(finishLine);

            // Set marker (invisible marker similar to finish line to indicate set end)
            setMarker = new Phaser.Sprite(game, -500, 352, 'finish-line');
            setMarker.renderable = false;
            game.physics.enable(setMarker);
            gameWorld.add(setMarker);

            // Active lane marker
            activeLaneMarker = gameWorld.create(game.width, 0, 'active-lane-marker');
            activeLaneMarker.anchor.set(1, 0.88);

            spawnTimer = game.time.create(false);
            spawnTimer.start();
            this.setSpawnTimer();

            // Obstacles
            lanes = [];
            for (var lcv = 0; lcv < 3; lcv++) {
                lanes.push({
                    obstacles: gameWorld.add(new Phaser.Group(game)),
                    tokens: gameWorld.add(new Phaser.Group(game)),
                    warnings: gameWorld.add(new Phaser.Group(game)),
                    powerups: gameWorld.add(new Phaser.Group(game)),
                    x: game.width
                });
                lanes[lcv].y = laneYCoords[lcv]+24;
                lanes[lcv].obstacles.classType = Obstacle;
                lanes[lcv].tokens.classType = Token;
                lanes[lcv].powerups.classType = PowerUp;
                lanes[lcv].warnings.classType = SpawnWarning;
            }
            lanes[0].spriteScale = 1.4;
            lanes[1].spriteScale = 1.6;
            lanes[2].spriteScale = 1.8;

            // Spawner
            spawner = new Spawner(game, 0, 0, 'blank', 0, 
            {
                spread: 64, // px between indices in spawn pattern arrays
                warningDuration: 800,
                warningSpread: 10,
                finishLine: finishLine,
                setMarker: setMarker,
                lanes: lanes
            });
            spawner.events.onSpawn.add(this.onSpawnerSpawn, this);
            gameWorld.add(spawner);

            // Insert player
            player = new Player(game, 0, 0, playerKey);
            player.activeLane = 1;
            player.events.onDeath.add(this.onPlayerDeath);
            player.events.onPowerUpStart.add(this.onPowerUpStart, this);
            player.events.onPowerUpStep.add(this.onPowerUpStep, this);
            player.events.onPowerUpEnd.add(this.onPowerUpEnd, this);
            player.fixedToCamera = true;
            player.scale.setTo(1.2);
            player.cameraOffset.y = laneYCoords[player.activeLane] + 56;
            player.cameraOffset.x = 0;

            // Tween player in from left edge of screen during intro.
            // Start after slight delay for mobile performance.
            game.time.events.add(Phaser.Timer.SECOND*0.1, function () {
                game.add.tween(player.cameraOffset).to({x:320}, 1400, Phaser.Easing.Back.Out, true);
            }, this);

            // Sync activeLaneMarker to player
            activeLaneMarker.fixedToCamera = true;
            activeLaneMarker.scale.setTo(1.2);
            activeLaneMarker.cameraOffset.y = player.cameraOffset.y - player.activeLane * 2;

            // Make player accessible via game object.
            game.player = player;
            gameWorld.add(player);

            foreground = gameWorld.add(new Phaser.TileSprite(game, 0, game.height - 108, game.width+50, 108, 'foreground'));

            // HUD
            hud = new HUD(game, game.width/2, 0);
            game.add.existing(hud);

            // Mute button
            game.add.existing(new MuteButton(game));

            // SFX
            sfx.tokenCollect = game.sound.add('token-collect');
            sfx.powerupCollect = game.sound.add('powerup-collect');
            sfx.powerupMiss = game.sound.add('powerup-miss');
            sfx.speedUp = game.sound.add('speed-up');
            sfx.slowDown = game.sound.add('slow-down');
            sfx.heartbeat = game.sound.add('heartbeat', 1, true);
            sfx.crash = game.sound.add('crash');
            sfx.lose = game.sound.add('lose');

            // Music
            music = game.sound.add('race-music');
            music.addMarker('intro', 0, 1.446);
            music.addMarker('loop', 1.446, 69.39, 1, true);
            
            music.play('intro');
            music.onStop.addOnce(function() {
                music.play('loop');
            }, this);

            inPattern = false;
            metersTraveled = 0;
            currentLevel = 0;
            currentLevelSpawnCount = 0;
        },

        render: function () {
            
        },

        update: function () {
            // Direct input to player.
            if(game.input.activePointer.isDown && !player.dying){
                if (game.input.y > laneYCoords[0]-30 * gameWorld.scale.y + gameWorld.y &&
                    game.input.y < laneYCoords[1] * gameWorld.scale.y + gameWorld.y) {
                    this.setPlayerActiveLane(0);
                }
                else if (game.input.y > laneYCoords[1] * gameWorld.scale.y + gameWorld.y &&
                         game.input.y < laneYCoords[2] * gameWorld.scale.y + gameWorld.y) {
                    this.setPlayerActiveLane(1);
                }
                else if (game.input.y > laneYCoords[2] * gameWorld.scale.y + gameWorld.y) {
                    this.setPlayerActiveLane(2);
                }
            }
            // Update distance travaled.
            metersTraveled += player.body.velocity.x / pixelsPerMeter;

            // Update HUD.
            hud.updateDistanceDisplay(metersTraveled);

            // Move all the things relative to the player.
            ground.tilePosition.x -= player.body.velocity.x;
            crowd.tilePosition.x -= player.body.velocity.x;
            foreground.tilePosition.x -= player.body.velocity.x;
            clouds1.tilePosition.x -= player.body.velocity.x*0.1;
            clouds2.tilePosition.x -= player.body.velocity.x*0.09;
            finishLine.x -= player.body.velocity.x;
            setMarker.x -= player.body.velocity.x;

            // Move sprites and kill them if they're off camera.
            for (var lcv = 0; lcv < 3; lcv++) {
                lanes[lcv].obstacles.forEachAlive(this.updateSpawnedSprite, this);
                lanes[lcv].tokens.forEachAlive(this.updateSpawnedSprite, this);
                lanes[lcv].powerups.forEachAlive(this.updateSpawnedSprite, this);
            }

            // Collide player and spawned stuff.
            // Only check against active lane, if applicable.
            if (!player.dying) {
                game.physics.arcade.overlap(player, lanes[player.activeLane].obstacles, this.onPlayerCollidesObstacle, null, this);  
                game.physics.arcade.overlap(player, lanes[player.activeLane].tokens, this.onPlayerCollidesToken, null, this);
                game.physics.arcade.overlap(player, lanes[player.activeLane].powerups, this.onPlayerCollidesPowerUp, null, this);
                game.physics.arcade.overlap(player, finishLine, this.onPlayerCollidesFinishLine, null, this);
                game.physics.arcade.overlap(player, setMarker, spawner.spawnNextInQueue, null, spawner);

                if (player.body.y-10 > laneYCoords[0] * gameWorld.scale.x + gameWorld.y &&
                    player.body.y-10 < laneYCoords[1] * gameWorld.scale.x + gameWorld.y) {
                    lanes[0].tokens.forEachAlive(this.checkPlayerOverlapToken, this);
                    lanes[0].powerups.forEachAlive(this.checkPlayerOverlapPowerUp, this);
                    lanes[0].obstacles.forEachAlive(this.checkPlayerOverlapObstacle, this);
                }
                else if (player.body.y-10 > laneYCoords[1] * gameWorld.scale.x + gameWorld.y &&
                         player.body.y-10 < laneYCoords[2] * gameWorld.scale.x + gameWorld.y) {
                    lanes[1].tokens.forEachAlive(this.checkPlayerOverlapToken, this);
                    lanes[1].powerups.forEachAlive(this.checkPlayerOverlapPowerUp, this);
                    lanes[1].obstacles.forEachAlive(this.checkPlayerOverlapObstacle, this);
                }
                else if (player.body.y-10 > laneYCoords[2] * gameWorld.scale.x + gameWorld.y) {
                    lanes[2].tokens.forEachAlive(this.checkPlayerOverlapToken, this);
                    lanes[2].powerups.forEachAlive(this.checkPlayerOverlapPowerUp, this);
                    lanes[2].obstacles.forEachAlive(this.checkPlayerOverlapObstacle, this);
                }

                //if (finishLine.x < player.body.x + player.body.width) this.onPlayerCollidesFinishLine();
            }
        },

        checkPlayerOverlapToken: function(token) {
            if (token.x > player.body.x && token.x < player.body.x + player.body.width) {
                this.onPlayerCollidesToken(player, token);
            }
        },

        checkPlayerOverlapPowerUp: function(powerup) {
            if (powerup.x > player.body.x && powerup.x < player.body.x + player.body.width) {
                this.onPlayerCollidesPowerUp(player, powerup);
            }
        },

        checkPlayerOverlapObstacle: function(obstacle) {
            if (obstacle.x > player.body.x && obstacle.x < player.body.x + player.body.width) {
                this.onPlayerCollidesObstacle(player, obstacle);
            }
        },

        updateSpawnedSprite: function(sprite) {
            sprite.x -= player.body.velocity.x;

            // Recycle off-camera sprites.
            // Not using killOffCamera because we want to start sprites off camera.
            if(!sprite.inCamera && sprite.x < 0) {
                sprite.kill();
            }
        },

        setPlayerActiveLane: function(newLane) {
            if(newLane!==player.activeLane){
                player.activeLane = newLane;
                var targetY,
                    targetScale,
                    tweenDuration=100,
                    tweenEasing=Phaser.Easing.Cubic.In,
                    tweenAutoPlay=true;
                switch(player.activeLane){
                    case 0: 
                        targetY = laneYCoords[0]+48;
                        targetScale = {x: 1.1, y: 1.1};
                        break;
                    case 1:
                        targetY = laneYCoords[1]+56;
                        targetScale = {x: 1.2, y: 1.2};
                        break;
                    case 2:
                        targetY = laneYCoords[2]+64;
                        targetScale = {x: 1.3, y: 1.3};
                        break;
                }

                // Sort render order based on new active lane.
                gameWorld.bringToTop(player);
                for (var lcv = player.activeLane+1; lcv < lanes.length; lcv++) {
                    gameWorld.bringToTop(lanes[lcv].obstacles);
                    gameWorld.bringToTop(lanes[lcv].tokens);
                }
                gameWorld.bringToTop(foreground);

                // Tween player to new lane.
                game.add.tween(player.cameraOffset).to({y:targetY}, tweenDuration, tweenEasing, tweenAutoPlay);
                game.add.tween(player.scale).to(targetScale, tweenDuration, tweenEasing, tweenAutoPlay);

                // Tween active lane marker to new lane.
                game.add.tween(activeLaneMarker.cameraOffset).to({y:targetY - player.activeLane * 2}, tweenDuration, tweenEasing, tweenAutoPlay);
                game.add.tween(activeLaneMarker.scale).to(targetScale, tweenDuration, tweenEasing, tweenAutoPlay);
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

        onPlayerCollidesPowerUp: function (player, powerup) {
            this.consumeToken();

            powerupToken = powerup;
            //game.add.existing(powerup);
            player.addChild(powerup);
            powerup.anchor.set(0, 0.5);
            powerup.scale.setTo(0.7,0.7);
            powerup.x = -110;
            powerup.y = -30;

            var targetX = -210,
                targetY = -65,
                targetScale = 1.2,
                tweenDuration = 500,
                tweenAutoPlay = true;
            game.add.tween(powerup).
                to({x: targetX, y:targetY}, tweenDuration, Phaser.Easing.Back.In, tweenAutoPlay);
            game.add.tween(powerup.scale).
                to({x: targetScale, y:targetScale}, tweenDuration, Phaser.Easing.Back.Out, tweenAutoPlay);

            var boostPercent = currentTokensCollected/currentPatternTokenCount;
            if (boostPercent > 0) {
                // Power up!
                player.powerUp(boostPercent);
            }
            else {
                // Set timer to clean up after bonus text.
                game.time.events.add(Phaser.Timer.SECOND, hud.hideBonusText, hud);
        
                // Prepare for next spawn.
                this.setSpawnTimer();
            }
            hud.showBonusText(boostPercent, player.powerupDuration);

            sfx.tokenCollect.play();
            sfx.powerupCollect.play();
        },

        onPlayerCollidesToken: function (player, token) {
            // TO DO: Animate tokens into HUD before killing them.
            game.add.existing(token);
            token.animations.stop();
            token.frame = 13;

            this.consumeToken();

            var targetX = hud.x+10,
                targetY = hud.y+20,
                targetScale,
                tweenDuration = 300,
                tweenEasing = Phaser.Easing.Cubic.In,
                tweenAutoPlay = true;
            game.add.tween(token)
                .to({x: targetX, y:targetY}, tweenDuration, tweenEasing, tweenAutoPlay)
                .onComplete.add(function(token) { token.kill(); }, this);
            sfx.tokenCollect.play();
        },

        consumeToken: function (token) {
            currentTokensCollected++;
            hud.updateBoostMeter(currentTokensCollected/currentPatternTokenCount);
        },

        onPlayerCollidesFinishLine: function () {
            if (inPattern) {
                // Clear flag.
                inPattern = false;

                if (player.stateMachine.getState() !== 'powered-up') {
                    // Play Miss message and sfx.
                    hud.showBonusText(0, 0);
                    sfx.powerupMiss.play();

                    // Set timer to clean up after bonus text.
                    game.time.events.add(Phaser.Timer.SECOND, hud.hideBonusText, hud);


                    // Prepare for next spawn.
                    this.setSpawnTimer();
                }
            }
        },

        onPlayerDeath: function (player) {
            game.camera.unfollow();
            game.score = Math.floor(metersTraveled);

            music.fadeOut(500);
            sfx.lose.play();
            
            game.time.events.add(Phaser.Timer.SECOND * 2, function () {
                game.stateTransition.to('GameOver', true, false, {metersTraveled: metersTraveled});
            }, this);
        },

        onSpawnerSpawn: function () {
            // Set flag.
            inPattern = true;
        },

        onPowerUpStart: function (player) {
            spawnTimer.pause();

            // Zoom in for close-up of player.
            game.add.tween(gameWorld.scale).to({x: 1.5, y: 1.5}, 300, Phaser.Easing.Back.In, true);
            game.add.tween(gameWorld).to({y: game.height/-2.66}, 300, Phaser.Easing.Back.In, true);

            // Switch to power-up sound effects.
            music.fadeTo(500, 0.25);
            sfx.slowDown.play();
            sfx.heartbeat.play('', 0 , 3);
        },

        onPowerUpStep: function (player, percentRemaining) {
            hud.updateBoostMeter(percentRemaining);
        },

        onPowerUpEnd: function (player) {
            // Return to normal scale and position.
            game.add.tween(gameWorld.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.In, true);
            game.add.tween(gameWorld).to({y: 0}, 300, Phaser.Easing.Back.In, true);

            // Get rid of current power-up token.
            game.add.tween(powerupToken.scale).to({x: 0, y: 0}, 300, Phaser.Easing.Back.In, true).
                onComplete.add(function() {
                    powerupToken.kill();
                });

            // Hide bonus text, but make sure it's on screen long enough to read.
            game.time.events.add(Phaser.Timer.SECOND, hud.hideBonusText, hud);

            // Switch to normal music.
            music.fadeTo(500, 1);
            sfx.speedUp.play();
            sfx.heartbeat.stop();
            
            // Prepare for next spawn.
            this.setSpawnTimer();
        },

        setSpawnTimer: function () {
            spawnTimer.add(restDuration, this.spawnPattern, this);
            spawnTimer.resume();
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

            // Reset power-up counters.
            currentTokensCollected = 0;
            currentPatternTokenCount = pattern.tokenCount;
            
            // Send the pattern to the spawn queue.
            spawner.queue(pattern);
            spawner.spawnNextInQueue();

            // Increment spawn count for this level.
            currentLevelSpawnCount++;
        }
    };
});