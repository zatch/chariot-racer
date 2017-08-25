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
            warningSpread: 10,
            //warningGroup: group,
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

    Spawner.prototype.queue = function (patternMatrix) {
        var lane,
            key,
            group = this.warningGroup,
            sprite;

        var ln,
            i;
        for (ln = 0; ln < patternMatrix.length; ln++) {
            lane = this.lanes[ln];
            for (i = patternMatrix[ln].length-1; i >= 0; i--) {
                key = patternMatrix[ln][i];
                if (key !== 0) {
                    key += '-warning';
                    sprite = group.getFirstDead(true, 
                                                game.width - 80 + (this.warningSpread * i), 
                                                lane.y+ln*2, 
                                                key);
                    sprite.anchor.set(1);
                    sprite.revive();
                    sprite.activeLane = ln;
                }
            }
        }

        // 
        this.spawnTimer.add(this.warningDuration, function () {
            this.warningGroup.callAll('kill');
            this.spawn(patternMatrix);
        }, this);
    };

    Spawner.prototype.spawn = function (patternMatrix) {
        var lane,
            key,
            group,
            sprite;

        var ln,
            i;
        for (ln = 0; ln < patternMatrix.length; ln++) {
            lane = this.lanes[ln];
            for (i = 0; i < patternMatrix[ln].length; i++) {
                key = patternMatrix[ln][i];
                if (key !== 0) {
                    group = this.spawnableObjects[key].group;

                    sprite = group.getFirstDead(true, 
                                                lane.x + (this.spread * i), 
                                                lane.y, 
                                                key);

                    sprite.revive();
                    sprite.anchor.set(0.5);
                    sprite.scale.x = lane.spriteScale;
                    sprite.scale.y = lane.spriteScale;
                    sprite.activeLane = ln;
                }
            }
        }
    };

    return Spawner;

});