define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,
        self;

    function ObstacleSpawner (_game, x, y, key, frame, spawnGroup, properties) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, key, frame);

        // Set up animations.
        this.anims = {};
        this.anims.warn = this.animations.add('warn', [1,2,3,4,5], 15, true);

        // Spawn settings
        this.spawnGroup = spawnGroup;
        this.spawnCoords = properties.spawnCoords ? properties.spawnCoords : {x:0, y:0};

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

    ObstacleSpawner.prototype = Object.create(Phaser.Sprite.prototype);
    ObstacleSpawner.prototype.constructor = ObstacleSpawner;

    ObstacleSpawner.prototype.update = function () {
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    ObstacleSpawner.prototype.warn = function () {
        this.frame = 0;
        this.anims.warn.play();
        this.spawnTimer.add(this.warningDuration, function () {
            this.spawn();
        }, this);
    };

    ObstacleSpawner.prototype.spawn = function () {
        this.anims.warn.stop();
        this.frame = 0;

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

    return ObstacleSpawner;

});