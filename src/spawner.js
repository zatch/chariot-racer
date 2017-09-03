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
            position,
            sprite;

        var ln,
            i;
        for (ln = 0; ln < patternMatrix.length; ln++) {
            lane = this.lanes[ln];
            for (i = patternMatrix[ln].length-1; i >= 0; i--) {
                key = patternMatrix[ln][i];

                if (key !== 0) {
                    sprite = lane.warnings.getFirstDead(true, 
                                                game.width - 160 + (this.warningSpread * i), 
                                                lane.y+ln*2+22);
                    sprite.revive();
                    sprite.activeLane = ln;

                    if (patternMatrix[ln][i-1] && patternMatrix[ln][i-1] == key) {
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
            this.spawn(patternMatrix);
        }, this);
    };

    Spawner.prototype.spawn = function (patternMatrix) {
        var lane,
            key,
            group,
            sprite,
            tokenFrame=0;

        var ln,
            i,
            longest=0;
        for (ln = 0; ln < patternMatrix.length; ln++) {
            lane = this.lanes[ln];
            for (i = 0; i < patternMatrix[ln].length; i++) {
                key = patternMatrix[ln][i];
                if (key !== 0) {
                    if (key === 'token') {
                        group = lane.tokens;
                    }
                    else {
                        group = lane.obstacles;
                    }

                    sprite = group.getFirstDead(true, 
                                                lane.x + (this.spread * i), 
                                                lane.y);

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

        this.finishLine.x = this.lanes[0].x + this.spread * longest + 384;

        // Dispatch onSpawn event.
        this.events.onSpawn.dispatch(this);
    };

    return Spawner;

});