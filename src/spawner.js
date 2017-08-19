define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,
        self;

    function Spawner (_game, x, y, key, frame, props) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, key, frame);

        Phaser.Utils.extend(true, this, {
            spread: 10, // px between indices in spawn pattern arrays
            warningDuration: 1000,
            spawnableObjects: {
                /*
                'sprite key': {
                    group: group // game group to revive sprites from
                }
                */
            },
            lanes: [
                /*
                {
                    x: game.width,      // sprite spawn x-coord
                    y: laneYCoords[0],  // sprite spawn y-coord
                    spriteScale: 1      // sprite scale percentage
                }
                */
            ]
        },
        props);

        // Spawn timer
        this.spawnTimer = game.time.create(false);
        this.spawnTimer.start(); 

        // Signals
        this.events.onSpawn = new Phaser.Signal();
        
    }

    Spawner.prototype = Object.create(Phaser.Sprite.prototype);
    Spawner.prototype.constructor = Spawner;

    Spawner.prototype.update = function () {
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    Spawner.prototype.queue = function (aObjectData) {
        // TO DO: Add warning sprites

        // 
        this.spawnTimer.add(this.warningDuration, function () {
            // TO DO: Get rid of warning sprites

            this.spawn(aObjectData);
        }, this);
    };

    Spawner.prototype.spawn = function (aObjectData) {
        var lane,
            group,
            sprite;

        aObjectData.forEach(function (oData) {
            lane = this.lanes[oData.lane];

            group = this.spawnableObjects[oData.key].group;

            sprite = group.getFirstDead(true, 
                                       lane.x + (this.spread * oData.index), 
                                       lane.y, 
                                       oData.key);

            sprite.revive();
            sprite.scale.x = lane.spriteScale;
            sprite.scale.y = lane.spriteScale;
            sprite.activeLane = oData.lane;
            sprite.x = lane.x + (this.spread * oData.index);
            sprite.y = lane.y;
        }, this);
    };

    return Spawner;

});