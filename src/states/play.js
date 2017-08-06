define([
    'phaser',
    'player',
    'spawner',
    'entity',
    'swipe'
], function (
    Phaser,
    Player,
    Spawner,
    Entity,
    Swipe) {

    'use strict';
    
    // Shortcuts
    var game, 
        moveKeys, 

        player,
        laneHeight=48,
        laneCount=3,
        laneOffset=27,
        lanes=[],
        laneYCoords,
        obstacleSpawner,
        obstacles=[],
        enemies,

        dirtTrack,
        dirtTrackHeight=laneHeight*laneCount;

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

            // Player set-up
            player = new Player(game);
            player.activeLane = 0;
            player.events.onDeath.add(this.onPlayerDeath);

            // Make player accessible via game object.
            game.player = player;
/*
            // Create map.
            map = this.game.add.tilemap(initialState.map.name);
            
            // Add images to map.
            map.addTilesetImage('Sci-Fi-Tiles_A2', 'Sci-Fi-Tiles_A2');
            
            // Add "background" layers to map.
            map.createLayer('backdrop')
               .resizeWorld(); // Base world size on the backdrop.
            map.createLayer('background-decoration');
            collisionLayer = map.createLayer('foreground-structure');
*/
            laneYCoords=[
                game.height-dirtTrackHeight-laneOffset,
                game.height-dirtTrackHeight+laneHeight-laneOffset,
                game.height-dirtTrackHeight+laneHeight*2-laneOffset
            ];

            //  The scrolling track background
            dirtTrack = game.add.tileSprite(0, game.height-dirtTrackHeight, game.width, dirtTrackHeight, 'dirt-track');

            // Insert spawners
            obstacleSpawner = this.createObstacleSpawner();
            game.add.existing(obstacleSpawner);

            // Insert player
            game.add.existing(player);
            player.x = 200;
            player.y = laneYCoords[0];
            player.fixedToCamera = true;
            
/*
            // Insert enemies
            enemies = [];
            spawners = new GameGroup(game);
            spawners = ObjectLayerHelper.createObjectsByType(game, 'spawner', map, 'spawners', Spawner, spawners);
            spawners.forEach(this.registerSpawnerEvents, this);
            game.add.existing(spawners);
*/

/*
            // Add "foreground" layers to map.
            map.createLayer('foreground-decoration');
*/

/*
            // Physics engine set-up
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.arcade.gravity.y = 1000;
            
            //  We check bounds collisions against all walls other than the bottom one
            game.physics.arcade.checkCollision.down = false;
            // Assign impasasble tiles for collision.
            map.setCollisionByExclusion([], true, 'foreground-structure');
*/
            
/*
            // HUD
            lapCounter = new LapCounter(game, 0, 0);
            game.add.existing(lapCounter);
            lapCounter.updateDisplay(player.currentLap);
*/           


            // add player
            //game.add.existing(player);

            this.swipe = new Swipe(game);
            this.swipe.dragLength = 25;
            // lanes


            // Camera
            game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

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
                // TO DO: Move lane positioning to a helper function or new class (e.g. LaneManager)
                player.y = laneYCoords[player.activeLane]
                player.cameraOffset.y = player.y;
            }

            // TO DO: Make dirtTrack and obstacles move at the same speed...not sure wha'ts wrong here.
            dirtTrack.tilePosition.x -= player.body.velocity.x;
            obstacles.forEach(function(obstacle) {
                obstacle.body.velocity.x = -player.body.velocity.x*2;
            }, this);

            // Collide player + enemies.
            game.physics.arcade.overlap(player, enemies, this.onPlayerCollidesEnemy);


        },

        shutdown: function () {
            // This prevents occasional momentary "flashes" during state transitions.
            game.camera.unfollow();
            pad1.onDownCallback = undefined;
        },

        createObstacleSpawner: function (spawner) {
            var oSpawner = new Spawner(game,
                                       game.width-32,
                                       game.height/2,
                                       null,
                                       0,
                                       {
                                            maxSpawned: 25,
                                            spawnRate: 1000,
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
/*
        onPlayerCollidesEnemy: function (player, enemy) {
            if(!enemy.invulnerable && !enemy.dying) {
                // Enemies don't do lethal damage; just knockback.
                player.damage(0, enemy);
            }
        },
*/
        onPlayerDeath: function (player) {
            game.camera.unfollow();
            game.stateTransition.to('GameOver', true, false);
        },
    };
});