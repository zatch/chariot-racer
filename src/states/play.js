define([
    'phaser',
    'player',
    'spawner',
    'entity',
    'swipe',
    'distance-display'
], function (
    Phaser,
    Player,
    Spawner,
    Entity,
    Swipe,
    DistanceDisplay) {

    'use strict';
    
    // Shortcuts
    var game, 
        moveKeys, 

        player,
        laneHeight,
        laneCount,
        laneOffset,
        lanes,
        laneYCoords,

        pixelsPerMeter=50, // Divisor for Phaser-to-reality physics conversion
        distanceTraveled=0,
        lastSpawnDistance=1, // Non-zero to delay first spawn
        spawnRate=5, // # of meters between spawns

        obstacleSpawner,
        obstacles,
        enemies,

        dirtTrack,
        crowd,
        clouds1,
        clouds2,

        distanceDisplay;

    return {
        // Intro
        init: function (data) {

            // Shortcut variables.
            game = this.game;

            game.spriteClassTypes = {
                'skull': Entity
            };
        },
        
        // Main
        create: function () {

            var self = this;

            laneHeight = 48;
            laneCount = 3;
            laneOffset = 27;
            lanes = [];

            // Player setup
            player = new Player(game);
            player.activeLane = 1;
            player.events.onDeath.add(this.onPlayerDeath);

            // Make player accessible via game object.
            game.player = player;

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

            // Insert spawners
            //obstacleSpawner = this.createObstacleSpawner();
            //game.add.existing(obstacleSpawner);


            // Obstacles group setup
            obstacles = game.add.group();
            //game.width-32,
            //game.height/2,
            obstacles.classType = game.spriteClassTypes.skull;
            //obstacles.createMultiple(2, 'skull', 1, true);
            //obstacles.callAll('kill');

            // Insert player
            game.add.existing(player);
            player.x = 260;
            player.fixedToCamera = true;
            player.scale.setTo(0.8);
            player.y = laneYCoords[player.activeLane];
            player.y -= 12;
            player.cameraOffset.y = player.y;

            // HUD
            distanceDisplay = new DistanceDisplay(game, 0, 0);
            game.add.existing(distanceDisplay);
            distanceDisplay.fixedToCamera = true;
            distanceDisplay.cameraOffset.x = 4;
            distanceDisplay.cameraOffset.y = 4;
/*
            lapCounter = new LapCounter(game, 0, 0);
            game.add.existing(lapCounter);
            lapCounter.updateDisplay(player.currentLap);
*/

            this.swipe = new Swipe(game);
            this.swipe.dragLength = 25;

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

            distanceTraveled += player.body.velocity.x / pixelsPerMeter;
            distanceDisplay.updateDisplay(distanceDisplay.distance + player.body.velocity.x/50);
            
            this.spawnObstacles();

            // TO DO: Make Sprites and tileSprites move relative to teh same speed...not sure what's wrong here.
            lanes[0].tilePosition.x -= player.body.velocity.x*0.6;
            lanes[1].tilePosition.x -= player.body.velocity.x*0.8;
            lanes[2].tilePosition.x -= player.body.velocity.x;
            crowd.tilePosition.x -= player.body.velocity.x*0.6;
            clouds1.tilePosition.x -= player.body.velocity.x*0.1;
            clouds2.tilePosition.x -= player.body.velocity.x*0.09;
            obstacles.forEachAlive(function(obstacle) {
                switch(obstacle.activeLane){
                    case 0:
                        obstacle.body.x -= player.body.velocity.x*0.6;
                        break;
                    case 1:
                        obstacle.body.x -= player.body.velocity.x*0.8;
                        break;
                    case 2:
                        obstacle.body.x -= player.body.velocity.x;
                        break;
                }
            }, this);

            // Collide player + enemies.
            game.physics.arcade.overlap(player, obstacles, this.onPlayerCollidesObstacle);

        },

        shutdown: function () {
            // This prevents occasional momentary "flashes" during state transitions.
            game.camera.unfollow();
        },
/*
        createObstacleSpawner: function (spawner) {
            var oSpawner = new Spawner(game,
                                       game.width-32,
                                       game.height/2,
                                       null,
                                       0,
                                       {
                                            maxSpawned: 25,
                                            spawnRate: 2000,
                                            sprites: {
                                                key: 'skull'
                                            },
                                            spawnCoords: [
                                                {x: game.width, y: laneYCoords[0]},
                                                {x: game.width, y: laneYCoords[1]},
                                                {x: game.width, y: laneYCoords[2]}
                                            ]
                                       });

            oSpawner.sprites.forEach(this.registerObstacle, this);
            oSpawner.events.onSpawn.add(function(spawner, obstacle) {
                this.registerObstacle(obstacle);
            }, this);

            return oSpawner;
        },
        
        registerObstacle: function (obstacle) {
            obstacles.push(obstacle);
        },
*/
        onPlayerCollidesObstacle: function (player, enemy) {
            player.damage();
        },

        onPlayerDeath: function (player) {
            game.camera.unfollow();
            game.stateTransition.to('GameOver', true, false);
        },

        spawnObstacles: function () {
            if (distanceTraveled >= lastSpawnDistance + spawnRate) {
                var sprite,
                    // How many to spawn at once, always leaving at least 1 lane open
                    spawnCount = Math.floor(Math.random() * lanes.length),
                    // Shuffled copy of potential lanes to spawn in
                    spawnLanes = this.shuffleArray([0,1,2]);

                // Reduce list of potential spawn lanes based on count
                while (spawnLanes.length > spawnCount) {
                    spawnLanes.pop();
                }

                // Spawn in predetirmined lanes
                while (spawnLanes.length > 0) {
                    sprite = obstacles.getFirstDead(true, 0, 0, 'skull', 1);
                    sprite.activeLane = spawnLanes.pop();

                    // TO DO: Move lane positioning to a helper function or new class
                    // TO DO: Fix this so we don't need a hard-coded offset (see "+30" ugh...)
                    switch(sprite.activeLane){
                        case 0:
                            sprite.x = game.width;
                            sprite.y = laneYCoords[sprite.activeLane]+6;
                            sprite.scale.setTo(0.75);
                            break;
                        case 1:
                            sprite.x = game.width;//+30; removed due to offCameraKill issue
                            sprite.y = laneYCoords[sprite.activeLane]+9;
                            sprite.scale.setTo(1);
                            console.log(sprite);
                            break;
                        case 2:
                            sprite.x = game.width;//+60; removed due to offCameraKill issue
                            sprite.y = laneYCoords[sprite.activeLane]+12;
                            sprite.scale.setTo(1.25);
                            break;
                    }
                    console.log(sprite.activeLane);
                    sprite.revive();
                }

                lastSpawnDistance = distanceTraveled;
            }
        },

        shuffleArray: function(array)
        {
            // Fisher-Yates (aka Knuth) shuffle algorithm
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }
    };
});