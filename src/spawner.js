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

        Phaser.Utils.extend(true, this, props);

        this.spawnQueue = [];
        this.isSpawning = false;

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

    Spawner.prototype.queue = function (pattern) {
        for (var lcv = pattern.sets.length-1; lcv >= 0; lcv--) {
            this.spawnQueue.push(pattern.sets[lcv].lanes);
        }
    };

    Spawner.prototype.spawnNextInQueue = function () {
        if (!this.isSpawning && this.spawnQueue.length > 0) {
            this.warn(this.spawnQueue.pop());
        }
    };

    Spawner.prototype.warn = function (lanesMatrix) {
        // Set spawning flag.
        this.isSpawning = true;

        var lane,
            key,
            position,
            sprite;

        var ln,
            i;
        for (ln = 0; ln < lanesMatrix.length; ln++) {
            lane = this.lanes[ln];
            for (i = lanesMatrix[ln].length-1; i >= 0; i--) {
                key = lanesMatrix[ln][i];

                if (key !== 0) {
                    sprite = lane.warnings.getFirstDead(true, 
                                                game.width - 160 + (this.warningSpread * i), 
                                                lane.y+ln*2+22);
                    sprite.revive();
                    sprite.activeLane = ln;

                    if (lanesMatrix[ln][i-1] && lanesMatrix[ln][i-1] == key) {
                        position = 'subsequent';
                    }
                    else {
                        position = 'first';
                    }

                    if (key === 'scaffolding' || key === 'wheel' || key === 'rock') {
                        key = 'obstacle-' + position;
                    }
                    else {
                        key = 'token-' + position;
                    }

                    sprite.animations.play(key);
                }
            }
        }

        // 
        this.spawnTimer.add(this.warningDuration, function () {
            for (var lcv = 0; lcv < this.lanes.length; lcv++) {
                this.lanes[lcv].warnings.callAll('kill');
            }
            this.spawn(lanesMatrix);
        }, this);
    };

    Spawner.prototype.spawn = function (lanesMatrix) {
        var lane,
            key,
            group,
            sprite,
            tokenFrame=0;

        var ln,
            i,
            longest=0;
        for (ln = 0; ln < lanesMatrix.length; ln++) {
            lane = this.lanes[ln];
            for (i = 0; i < lanesMatrix[ln].length; i++) {
                key = lanesMatrix[ln][i];
                if (key !== 0) {
                    if (key === 'token') {
                        group = lane.tokens;
                    }
                    else {
                        group = lane.obstacles;
                    }

                    sprite = group.getFirstDead(true, 
                                                lane.x + (this.spread * i), 
                                                lane.y - 4 + ln * 2); // funky math to fine-tune lane positioning

                    sprite.revive();
                    sprite.scale.x = lane.spriteScale;
                    sprite.scale.y = lane.spriteScale;
                    sprite.activeLane = ln;
                    if (key != 'token') {
                        sprite.setObstacleFrame(key);
                    }
                    else {
                        // 
                        sprite.setAnimationFrame(tokenFrame);
                        tokenFrame = tokenFrame >= 4 ? 0 : tokenFrame+1;
                    }
                }
                if (i > longest) longest++;
            }
        }


        if (this.spawnQueue.length <= 0) {
            this.finishLine.x = this.lanes[0].x + this.spread * longest + 384;
        }
        else {
            this.setMarker.x = this.lanes[0].x + this.spread * longest;
        }

        // Clear spawning flag.
        this.isSpawning = false;

        // Dispatch onSpawn event.
        this.events.onSpawn.dispatch(this);
    };

    return Spawner;

});