define([
    'phaser',
    'player',
    'spawner',
    'entity'
], function (
    Phaser,
    Player,
    Spawner,
    Entity) {

    'use strict';
    
    // Shortcuts
    var game, 
        moveKeys, 

        dirtTrack,

        player,
        obstacleSpawner,
        obstacles=[],
        enemies;

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
            player = new Player(game, 0, 0);
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

            //  The scrolling starfield background
            dirtTrack = game.add.tileSprite(0, game.height/2, 980, 621, 'dirt-track');

            // Insert player here?
            game.add.existing(player);
            player.x = 200;
            player.y = 200;
            player.fixedToCamera = true;

            // Insert spawners
            obstacleSpawner = this.createObstacleSpawner();
            game.add.existing(obstacleSpawner);
            //obstacleSpawner.fixedToCamera = true;
            
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


            // Keyboard input set-up
            moveKeys = game.input.keyboard.createCursorKeys();
            moveKeys.wasd = {
                up: game.input.keyboard.addKey(Phaser.Keyboard.W),
                down: game.input.keyboard.addKey(Phaser.Keyboard.S),
                left: game.input.keyboard.addKey(Phaser.Keyboard.A),
                right: game.input.keyboard.addKey(Phaser.Keyboard.D)
            };
            moveKeys.wasd.up.onDown.add(function () {
                
            });
            moveKeys.wasd.up.onUp.add(function () {
                
            });
            game.input.keyboard.addKey(Phaser.Keyboard.F).onDown.add(function() {
                if(game.scale.isFullScreen) {
                    game.scale.stopFullScreen();
                } else {
                    game.scale.startFullScreen();
                }
            });
        },

        render: function () {
            
        },

        update: function () {
            // Direct input to player and do all the map and collision stuff.
            
            dirtTrack.tilePosition.x -= player.body.velocity.x;
            obstacles.forEach(function(obstacle) {
                obstacle.body.velocity.x = -player.body.velocity.x;
            }, this);

            // Collide player + enemies.
            game.physics.arcade.overlap(player, enemies, this.onPlayerCollidesEnemy);

            // Player movement controls
            if(moveKeys.wasd.left.isDown) {
                player.moveLeft();
            } else if (moveKeys.wasd.right.isDown) {
                player.moveRight();
            } else {
                player.stopMoving();
            }
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
                                            maxSpawned: 5,
                                            spawnRate: 1000,
                                            sprites: {
                                                key: 'skull'
                                            }
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