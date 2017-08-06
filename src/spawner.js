define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, self;

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
        this.spawn();

        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    function onCooldownComplete () {
        // this == sprite
        this.revive(); 
        self.events.onSpawn.dispatch(self, this);
    }

    Spawner.prototype.spawn = function () {
        var sprite;
        if (!this.spawnTimer.duration) {

            sprite = this.sprites.getFirstDead();
            if (sprite) {
                sprite.x = this.x;
                sprite.y = this.y;

                this.spawnTimer.add(this.spawnRate, onCooldownComplete, sprite);
            }
        }
    };

    return Spawner;

});