define([
    'phaser',
    'player',
    'swipe'
], function (
    Phaser,
    Player,
    Swipe) {

    'use strict';
    
    // Shortcuts
    var game, 
        moveKeys, 

        dirtTrack,

        player,
        lanes=[],
        enemies;

    return {
        // Intro
        init: function (data) {

            // Shortcut variables.
            game = this.game;

        },
        
        // Main
        create: function () {

            var self = this;

            // Player set-up
            player = new Player(game, 0, game.height/2+40);
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

            //  The scrolling starfield background
            dirtTrack = game.add.tileSprite(0, game.height/2, 800, 500, 'dirt-track');
/*
            // Spawn point
            var spawnPoint = ObjectLayerHelper.createObjectByName(game, 'player_spawn', map, 'spawns');

            // Insert player here?
            game.add.existing(player);
            player.x = spawnPoint.x;
            player.y = spawnPoint.y;
*/
            
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
            game.add.existing(player);

            this.swipe = new Swipe(game);
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
                        if(game.player.activeLane>0){
                            game.player.activeLane -=1;
                        }
                        break;
                    case this.swipe.DIRECTION_DOWN:
                        if(game.player.activeLane<2){
                            game.player.activeLane +=1;
                        }
                        break;
                }
                player.y = (game.height/2)+player.activeLane*(game.height/2/3)+40;
                console.log(game.player.activeLane);
            }
            // Collide player + enemies.
            game.physics.arcade.overlap(player, enemies, this.onPlayerCollidesEnemy);


        },

        shutdown: function () {
            // This prevents occasional momentary "flashes" during state transitions.
            game.camera.unfollow();
            pad1.onDownCallback = undefined;s
        },
/*        
        registerSpawnerEvents: function (spawner) {
            spawner.sprites.forEach(this.registerEnemyEvents, this);
            spawner.events.onSpawn.add(this.onSpawnerSpawn, this);
        },
        
        registerEnemyEvents: function (enemy) {
            enemies.push(enemy);
            enemy.events.onDeath.add(this.onEnemyDeath, this);
            enemy.events.onDrop.add(this.onEnemyDrop, this);
            if (enemy.events.onSpawnChild) enemy.events.onSpawnChild.add(this.onSpawnerSpawn, this);
        },
        
        onSpawnerSpawn: function(spawner, sprite) {
            this.registerEnemyEvents(sprite);
        },
        
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