define([
    'phaser',
    'player',
    'spawner',
    'finish-line',
    'token',
    'obstacle',
    'spawn-warning',
    'hud',
    'level-data'
], function (
    Phaser,
    Player,
    Spawner,
    FinishLine,
    Token,
    Obstacle,
    SpawnWarning,
    HUD,
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
        laneYCoords=[370,420,476],

        pixelsPerMeter=60, // Divisor for Phaser-to-reality physics conversion
        metersTraveled=0,

        spawner,
        finishLine,
        lanes,
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
        crowd,
        ground,
        foreground,
        sky,
        clouds1,
        clouds2,
        activeLaneMarker,
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
        },
        
        // Main
        create: function () {

            var self = this;
            laneHeight = 48;
            laneCount = 3;
            laneOffset = 27;

            sky = game.add.tileSprite(0, 0, game.width, 152, 'sky');
            clouds1 = game.add.tileSprite(0, 0, game.width, 124, 'clouds1');
            clouds2 = game.add.tileSprite(0, 0, game.width, 128, 'clouds2');
            crowd = game.add.tileSprite(0, 94, game.width, 258, 'crowd');
            ground = game.add.tileSprite(0, 352, game.width, 226, 'ground');

            // Finish line
            finishLine = new FinishLine(game, -100, 352);
            game.add.existing(finishLine);

            // Active lane marker
            activeLaneMarker = game.add.sprite(game.width, 0, 'active-lane-marker');
            activeLaneMarker.anchor.set(1, 0.88);

            spawnTimer = game.time.create(false);
            spawnTimer.start();
            this.setSpawnTimer();

            // Obstacles
            lanes = [];
            for (var lcv = 0; lcv < 3; lcv++) {
                lanes.push({
                    obstacles: game.add.group(),
                    tokens: game.add.group(),
                    warnings: game.add.group(),
                    x: game.width
                });
                lanes[lcv].y = laneYCoords[lcv]+24;
                lanes[lcv].obstacles.classType = Obstacle;
                lanes[lcv].tokens.classType = Token;
                lanes[lcv].warnings.classType = SpawnWarning;
            }
            lanes[0].spriteScale = 1.4;
            lanes[1].spriteScale = 1.6;
            lanes[2].spriteScale = 1.8;

            // Spawner
            spawner = new Spawner(game, 0, 0, 'blank', 0, 
            {
                spread: 48, // px between indices in spawn pattern arrays
                warningDuration: 1000,
                warningSpread: 10,
                finishLine: finishLine,
                lanes: lanes
            });
            spawner.events.onSpawn.add(this.onSpawnerSpawn, this);
            game.add.existing(spawner);

            // Insert player
            player = new Player(game, 320 , 0, playerKey);
            player.activeLane = 1;
            player.events.onDeath.add(this.onPlayerDeath);
            player.events.onPowerUpStart.add(this.onPowerUpStart, this);
            player.events.onPowerUpStep.add(this.onPowerUpStep, this);
            player.events.onPowerUpEnd.add(this.onPowerUpEnd, this);
            player.fixedToCamera = true;
            player.scale.setTo(1.2);
            player.cameraOffset.y = laneYCoords[player.activeLane] + 56;

            // Sync activeLaneMarker to player
            activeLaneMarker.fixedToCamera = true;
            activeLaneMarker.scale.setTo(1.2);
            activeLaneMarker.cameraOffset.y = player.cameraOffset.y;

            // Make player accessible via game object.
            game.player = player;
            game.add.existing(player);

            foreground = game.add.tileSprite(0, game.height - 108, game.width, 108, 'foreground');

            // HUD
            hud = new HUD(game, game.width/2, 0);
            game.add.existing(hud);

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
            var newLane=player.activeLane,
                lcv;
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
                game.world.bringToTop(player);
                for (lcv = player.activeLane+1; lcv < lanes.length; lcv++) {
                    game.world.bringToTop(lanes[lcv].obstacles);
                    game.world.bringToTop(lanes[lcv].tokens);
                }
                game.world.bringToTop(foreground);

                // Tween player to new lane.
                game.add.tween(player.cameraOffset).to({y:targetY}, tweenDuration, tweenEasing, tweenAutoPlay);
                game.add.tween(player.scale).to(targetScale, tweenDuration, tweenEasing, tweenAutoPlay);

                // Tween active lane marker to new lane.
                game.add.tween(activeLaneMarker.cameraOffset).to({y:targetY}, tweenDuration, tweenEasing, tweenAutoPlay);
                game.add.tween(activeLaneMarker.scale).to(targetScale, tweenDuration, tweenEasing, tweenAutoPlay);

            }

            metersTraveled += player.body.velocity.x / pixelsPerMeter;

            // Update HUD.
            hud.updateDistanceDisplay(metersTraveled);

            // Move all the things relative to the player.
            ground.tilePosition.x -= player.body.velocity.x;
            crowd.tilePosition.x -= player.body.velocity.x;
            foreground.tilePosition.x -= player.body.velocity.x;
            clouds1.tilePosition.x -= player.body.velocity.x*0.1;
            clouds2.tilePosition.x -= player.body.velocity.x*0.09;
            finishLine.body.x -= player.body.velocity.x;

            // Move sprites and kill them if they're off camera.
            for (lcv = 0; lcv < 3; lcv++) {
                lanes[lcv].obstacles.forEachAlive(this.updateSpawnedSprite, this);
                lanes[lcv].tokens.forEachAlive(this.updateSpawnedSprite, this);
            }

            // Collide player and spawned stuff.
            // Only check against active lane, if applicable.
            if (!player.dying) {
                game.physics.arcade.overlap(player, lanes[player.activeLane].obstacles, this.onPlayerCollidesObstacle, null, this);  
                game.physics.arcade.overlap(player, lanes[player.activeLane].tokens, this.onPlayerCollidesToken, null, this);
                game.physics.arcade.overlap(player, finishLine, this.onPlayerCollidesFinishLine, null, this);
            }
        },

        updateSpawnedSprite: function(sprite) {
            sprite.body.x -= player.body.velocity.x;

            // Recycle off-camera sprites.
            // Not using killOffCamera because we want to start sprites off camera.
            if(!sprite.inCamera && sprite.body.x < 0) {
                sprite.kill();
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
            game.add.existing(token);
            token.animations.stop();
            token.frame = 0;

            var targetX = hud.x+10,
                targetY = hud.y+20,
                targetScale,
                tweenDuration = 300,
                tweenEasing = Phaser.Easing.Cubic.In,
                tweenAutoPlay = true;
            game.add.tween(token)
                .to({x: targetX, y:targetY}, tweenDuration, tweenEasing, tweenAutoPlay)
                .onComplete.add(this.consumeToken, this);
            sfx.tokenCollect.play();
        },

        consumeToken: function (token) {
            token.kill();
            currentTokensCollected++;
            hud.updateBoostMeter(currentTokensCollected/currentPatternTokenCount);
        },

        onPlayerCollidesFinishLine: function (player, fLine) {
            if (inPattern) {
                // Clear flag.
                inPattern = false;

                var boostPercent = currentTokensCollected/currentPatternTokenCount;
                // Power up!
                player.powerUp(boostPercent);
                hud.showBonusText(boostPercent, player.powerupDuration);
                sfx.powerUp.play();
            }
        },

        onPlayerDeath: function (player) {
            game.camera.unfollow();
            game.score = Math.floor(metersTraveled);
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

        onPowerUpStart: function (player) {
            spawnTimer.pause();
        },

        onPowerUpStep: function (player, percentRemaining) {
            hud.updateBoostMeter(percentRemaining);
        },

        onPowerUpEnd: function (player) {
            // Hide bonus text, but make sure it's on screen long enough to read.
            game.time.events.add(Phaser.Timer.SECOND, hud.hideBonusText, hud);
            
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