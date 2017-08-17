define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,
        self;

    function TokenSpawner (_game, x, y, key, frame, spawnGroup, properties) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, key, frame);

        // Spawn settings
        this.spawnGroup = spawnGroup;
        this.spawnCoords = properties.spawnCoords ? properties.spawnCoords : {x:0, y:0};
        this.spawnCount = properties.spawnCount ? properties.spawnCount : 10;
        this.spawnDelay = properties.spawnDelay ? properties.spawnDelay : 10;

        this.activeLane = properties.activeLane ? properties.activeLane : 0;

        // Sprites spawned
        this.spriteScale = properties.spriteScale ? properties.spriteScale : 1;
        this.spawnKey = properties.sprites.key;
        
        // Spawn timer
        this.spawnTimer = game.time.create(false);
        this.spawnTimer.start(); 
        this.warningDuration = properties.warningDuration ? properties.warningDuration : 1000;

        // Signals
        this.events.onSpawn = new Phaser.Signal();
        
    }

    TokenSpawner.prototype = Object.create(Phaser.Sprite.prototype);
    TokenSpawner.prototype.constructor = TokenSpawner;

    TokenSpawner.prototype.update = function () {
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    TokenSpawner.prototype.queue = function () {
        for (var lcv = 0; lcv < this.spawnCount; lcv++) {
            this.spawnTimer.add(this.spawnDelay*lcv, function () {
                this.spawn();
            }, this);
        }
    };

    TokenSpawner.prototype.spawn = function () {
        //console.log()
        var sprite = this.spawnGroup.getFirstDead(true, 
                                                  this.spawnCoords.x, 
                                                  this.spawnCoords.y, 
                                                  this.spawnKey);
        sprite.revive();
        sprite.scale.x = this.spriteScale;
        sprite.scale.y = this.spriteScale;
        sprite.activeLane = this.activeLane;
        sprite.x = this.spawnCoords.x;
        sprite.y = this.spawnCoords.y;
        //this.events.onSpawn.dispatch(this, sprite);
    };

    return TokenSpawner;

});