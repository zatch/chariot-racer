define([
    'phaser'
], function (Phaser) {
    'use strict';

    // Shortcuts
    var game,
        currentPattern;

    function Spawner (_game, x, y, key, frame, props) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, key, frame);

        Phaser.Utils.extend(true, this, props);

        this.spawnQueue = [];
        this.isSpawning = false;

        // Spawn timer
        this.spawnTimer = game.time.create(false);
        this.spawnTimer.start(); 

        // Signals
        this.events.onWarn = new Phaser.Signal();
        this.events.onSpawn = new Phaser.Signal();
        
    }

    Spawner.prototype = Object.create(Phaser.Sprite.prototype);
    Spawner.prototype.constructor = Spawner;

    Spawner.prototype.update = function () {
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    Spawner.prototype.queue = function (pattern) {
        currentPattern = pattern;
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
            type,
            position,
            sprite;

        var ln,
            i;
        for (ln = 0; ln < lanesMatrix.length; ln++) {
            lane = this.lanes[ln];
            for (i = lanesMatrix[ln].length-1; i >= 0; i--) {
                key = lanesMatrix[ln][i] ? lanesMatrix[ln][i].key : 0;
                type = lanesMatrix[ln][i] ? lanesMatrix[ln][i].type : 0;

                if (key !== 0) {
                    sprite = lane.warnings.getFirstDead(true, 
                                                game.width - 160 + (this.warningSpread * i), 
                                                lane.y+ln*2+22);
                    sprite.revive();
                    sprite.activeLane = ln;

                    if (lanesMatrix[ln][i-1] && lanesMatrix[ln][i-1].type && lanesMatrix[ln][i-1].type === type) {
                        sprite.animations.play(type + '-subsequent');
                    }
                    else {
                        sprite.animations.play(type + '-first');
                    }
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

        this.events.onWarn.dispatch(currentPattern.sets.length - this.spawnQueue.length);
    };

    Spawner.prototype.spawn = function (lanesMatrix) {
        var lane,
            key,
            type,
            group,
            sprite,
            tokenFrame=0;

        var ln,
            i,
            longest=0;
        for (ln = 0; ln < lanesMatrix.length; ln++) {
            lane = this.lanes[ln];
            for (i = 0; i < lanesMatrix[ln].length; i++) {
                key = lanesMatrix[ln][i] ? lanesMatrix[ln][i].key : 0;
                type = lanesMatrix[ln][i] ? lanesMatrix[ln][i].type : 0;

                if (type !== 0) {
                    switch(type) {
                        case 'obstacle':
                            group = lane.obstacles;
                            break;
                        case 'token':
                            group = lane.tokens;
                            break;
                        case 'power-up':
                            group = lane.powerups;
                            break;
                    }

                    sprite = group.getFirstDead(true, 
                                                lane.x + (this.spread * i), 
                                                lane.y - 4 + ln * 2); // funky math to fine-tune lane positioning

                    sprite.revive();
                    sprite.scale.x = lane.spriteScale;
                    sprite.scale.y = lane.spriteScale;
                    sprite.activeLane = ln;
                    switch(key) {
                        case 'scaffolding':
                        case 'wheel':
                        case 'rock':
                            sprite.setObstacleFrame(key);
                            break;
                        case 'token':
                            sprite.setAnimationFrame(tokenFrame);
                            tokenFrame = tokenFrame >= 4 ? 0 : tokenFrame+1;
                            break;
                    }
                }
                if (i > longest) longest++;
            }
        }


        if (this.spawnQueue.length <= 0) {
            this.finishLine.x = this.lanes[0].x + this.spread * longest + 196;
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