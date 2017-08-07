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
        dirtTrackHeight=laneHeight*laneCount,
        crowd,
        clouds1,
        clouds2;

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
            player.activeLane = 1;
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
            obstacleSpawner = this.createObstacleSpawner();
            game.add.existing(obstacleSpawner);

            // Insert player
            game.add.existing(player);
            player.x = 150;
            player.fixedToCamera = true;
            player.scale.setTo(1.6);
            player.y = laneYCoords[player.activeLane];
            player.y -= 12;
            player.cameraOffset.y = player.y;
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
            // HUD
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
                // TO DO: Move lane positioning to a helper function or new class (e.g. LaneManager)
                player.y = laneYCoords[player.activeLane];

                // TO DO: Make it so we don't need  all these hard-coded y-coord offsets.
                switch(player.activeLane){
                    case 0: 
                        player.scale.setTo(1.2);
                        player.y -= 10;
                        break;
                    case 1:
                        player.scale.setTo(1.6);
                        player.y -= 12;
                        break;
                    case 2:
                        player.scale.setTo(2);
                        player.y -= 14;
                        break;
                }

                player.cameraOffset.y = player.y;
            }

            // TO DO: Make Sprites and tileSprites move relative to teh same speed...not sure what's wrong here.
            //dirtTrack.tilePosition.x -= player.body.velocity.x;
            lanes[0].tilePosition.x -= player.body.velocity.x/40;
            lanes[1].tilePosition.x -= player.body.velocity.x/35;
            lanes[2].tilePosition.x -= player.body.velocity.x/30;
            crowd.tilePosition.x -= player.body.velocity.x/50;
            clouds1.tilePosition.x -= player.body.velocity.x/90;
            clouds2.tilePosition.x -= player.body.velocity.x/100;
            obstacles.forEach(function(obstacle) {
                obstacle.body.velocity.x = -player.body.velocity.x*2;

                switch(obstacle.activeLane){
                    case 0:
                        obstacle.body.velocity.x = -player.body.velocity.x*1.5;
                        obstacle.scale.setTo(0.75);
                        break;
                    case 1:
                        obstacle.body.velocity.x = -player.body.velocity.x*1.75;
                        obstacle.scale.setTo(1);
                        break;
                    case 2:
                        obstacle.body.velocity.x = -player.body.velocity.x*2;
                        obstacle.scale.setTo(1.25);
                        break;
                }

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