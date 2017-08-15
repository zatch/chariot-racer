define([
    'phaser',
    'player',
    'spawner',
    'power-up',
    'entity',
    'swipe',
    'distance-display'
], function (
    Phaser,
    Player,
    Spawner,
    PowerUp,
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
        laneSpawners,
        laneYCoords,

        pixelsPerMeter=50, // Divisor for Phaser-to-reality physics conversion
        distanceTraveled=0,
        spawnRate=1250, // # of meters between spawns
        spawnTimer,
        lanesLastSpawned,

        obstacleSpawner,
        obstacles,
        powerup,

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
                'skull': Phaser.Sprite
            };
        },
        
        // Main
        create: function () {

            var self = this;

            laneHeight = 48;
            laneCount = 3;
            laneOffset = 27;

            // Player setup
            player = new Player(game);
            player.activeLane = 1;
            player.events.onDeath.add(this.onPlayerDeath);
            player.events.onPowerUpStart.add(this.onPowerUpStart, this);
            player.events.onPowerUpEnd.add(this.onPowerUpEnd, this);

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

            lanesLastSpawned = [0,1,2];
            spawnTimer = game.time.create(false);
            spawnTimer.start();
            spawnTimer.add(spawnRate, this.spawn, this);

            // Insert spawners
            //obstacleSpawner = this.createObstacleSpawner();
            //game.add.existing(obstacleSpawner);

            // Obstacles group setup
            obstacles = game.add.group();
            obstacles.enableBody = true;
            obstacles.classType = game.spriteClassTypes.skull;

            laneSpawners = [
                new Spawner(game,
                            game.width-32,
                            laneYCoords[0],
                            'lane-warning',
                            0,
                            obstacles,
                            {
                                activeLane: 0,
                                spriteScale: 0.75,
                                sprites: {
                                    key: 'skull'
                                },
                                spawnCoords: {
                                    x: game.width, 
                                    y: laneYCoords[0]+6
                                },
                                warningDuration: 1000
                            }),
                new Spawner(game,
                            game.width-32,
                            laneYCoords[1],
                            'lane-warning',
                            0,
                            obstacles,
                            {
                                activeLane: 1,
                                spriteScale: 1,
                                sprites: {
                                    key: 'skull'
                                },
                                spawnCoords: {
                                    x: game.width+30, 
                                    y: laneYCoords[1]+9
                                },
                                warningDuration: 1000
                            }),
                new Spawner(game,
                            game.width-32,
                            laneYCoords[2],
                            'lane-warning',
                            0,
                            obstacles,
                            {
                                activeLane: 2,
                                spriteScale: 1.25,
                                sprites: {
                                    key: 'skull'
                                },
                                spawnCoords: {
                                    x: game.width+60, 
                                    y: laneYCoords[2]+12
                                },
                                warningDuration: 1000
                            })
            ];
            game.add.existing(laneSpawners[0]);
            game.add.existing(laneSpawners[1]);
            game.add.existing(laneSpawners[2]);

            // Insert player
            game.add.existing(player);
            player.x = 260;
            player.fixedToCamera = true;
            player.scale.setTo(0.8);
            player.cameraOffset.y = laneYCoords[player.activeLane] - 12;

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

            // Insert power-up; starts off dead.
            powerup = new PowerUp(game, 0, 0);
            game.add.existing(powerup);
            powerup.events.onTap.add(function() {
                player.powerUp();
            }, this);
            powerup.kill();

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
            distanceDisplay.updateDisplay(distanceTraveled);
            
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

            // Collide player + obstacles.
            if (!player.invulnerable) {
                game.physics.arcade.overlap(player, obstacles, this.onPlayerCollidesObstacle);               
            }

        },

        shutdown: function () {
            // This prevents occasional momentary "flashes" during state transitions.
            game.camera.unfollow();
        },

        onPlayerCollidesObstacle: function (player, enemy) {
            player.damage();
        },

        onPlayerDeath: function (player) {
            game.camera.unfollow();
            game.stateTransition.to('GameOver', true, false);
        },

        onPowerUpStart: function () {
            console.log(spawnTimer);
            spawnTimer.removeAll();
        },

        onPowerUpEnd: function () {
            spawnTimer.add(spawnRate, this.spawn, this);
        },

        spawn: function () {
            this.spawnObstacles();
            this.spawnPowerUp();

            spawnTimer.add(spawnRate, this.spawn, this);
        },

        spawnObstacles: function () {
            var spawnCount = Math.random();
            // odds of no spawn
            if (spawnCount < 0.15) { 
                spawnCount = 0; 
            }
            // odds of 1 lane spawning
            else if (spawnCount < 0.5) {
                spawnCount = 1;
            }
            // odds of 2 lanes spawning
            else {
                spawnCount = 2;
            }

            // Shuffle before drawing exclusions, just for good measure
            this.shuffleArray(lanesLastSpawned);

            // Shuffled copy of potential lanes to spawn in
            var spawnLanes = [0,1,2];
            this.shuffleArray(spawnLanes);
            
            // Reduce list of potential spawn lanes based on count
            while (spawnLanes.length > spawnCount) {
                if (lanesLastSpawned.length) {
                    // Start by excluing lanes spawned last round
                    spawnLanes.splice(spawnLanes.indexOf(lanesLastSpawned.pop()), 1);
                }
                else {
                    // Then just pop off anything extra to reduce count
                    spawnLanes.pop();
                }
            }
            
            // Remember selected lanes for next round
            lanesLastSpawned = spawnLanes.slice();

            // Spawn in predetirmined lanes
            while (spawnLanes.length > 0) {
                laneSpawners[spawnLanes.pop()].warn();
            }
        },

        spawnPowerUp: function () {
            // Odds of spawning power-up
            var willSpawn = (Math.random() < 0.1);
            if (willSpawn && !powerup.alive) {
                powerup.reset(Math.random() * game.width, Math.random() * game.height / 2);
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