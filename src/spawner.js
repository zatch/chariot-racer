define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,
        self,
        lanes=[0,1,2],
        lanesCount=lanes.length;

    function Spawner (_game, x, y, key, frame, properties) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'spawner');

        this.renderable = false;

        // Spawn settings
        this.maxSpawned = properties.maxSpawned ? properties.maxSpawned : 1;
        this.spawnRate = properties.spawnRate ? properties.spawnRate : 1000; // Delay to spawn, in ms

        this.isFresh = true;
        
        // Sprites spawned
        this.sprites = game.add.group();
        this.sprites.x = 0;
        this.sprites.y = 0;
        this.sprites.classType = game.spriteClassTypes[properties.sprites.key];
        this.sprites.createMultiple(this.maxSpawned, properties.sprites.key, 1, true);
        this.sprites.setAll('x', this.x);
        this.sprites.setAll('y', this.y);
        this.sprites.callAll('kill');
        
        // Spawn timer
        this.spawnTimer = game.time.create(false);
        this.spawnTimer.start(); 

        // Signals
        this.events.onSpawn = new Phaser.Signal();
        
        game.physics.enable(this);
        this.body.immovable = true;
        this.body.allowGravity = false;
    }

    Spawner.prototype = Object.create(Phaser.Sprite.prototype);
    Spawner.prototype.constructor = Spawner;

    Spawner.prototype.update = function () {
        if (!this.spawnTimer.duration) {
            this.spawn();
        }
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    function onCooldownComplete () {
        // this == sprite
    }

    Spawner.prototype.spawn = function () {
            var sprite,
                // How many to spawn at once, always leaving at least 1 lane open
                spawnCount = Math.floor(Math.random() * lanesCount),
                // Shuffled copy of potential lanes to spawn in
                spawnLanes = this.shuffleArray(lanes.slice());

            // Reduce list of potential spawn lanes based on count
            while (spawnLanes.length > spawnCount) {
                spawnLanes.pop();
            }

            // Spawn in predetirmined lanes
            while (spawnLanes.length > 0) {
                sprite = this.sprites.getFirstDead();
                if (sprite) {
                    sprite.x = this.x;
                    // TO DO: Move lane positioning to a helper function or new class (e.g. LaneManager)
                    sprite.y = (game.height/2)+spawnLanes.pop()*(game.height/2/3);

                    sprite.revive(); 
                    this.events.onSpawn.dispatch(this, sprite);

                    this.spawnTimer.add(this.spawnRate, onCooldownComplete, sprite);
                }
                else {
                    spawnLanes = []; // Exit condition for maximum number spawned.
                }
            }
    };

    // This probably shouldn't live here long term, but is convenient for now.
    Spawner.prototype.shuffleArray = function(array)
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
    };

    return Spawner;

});