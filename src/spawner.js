define([
    'phaser',
    'spawn-patterns'
], function (Phaser,spawnPatterns) {
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
    Spawner.prototype.find = function(level){
        var i,
            j,
            patternMatrix,
            minimum=0,
            pattern = [];
        if(level>1){
            minimum = (level>spawnPatterns[spawnPatterns.length-1].level?spawnPatterns[spawnPatterns.length-2].level:level-2);
        }
        for(i=0;i<spawnPatterns.length;i++){
            if(spawnPatterns[i].level<=level&&spawnPatterns[i].level>=minimum){
                pattern.push(spawnPatterns[i]);
            }
        }
        for (i = pattern.length; i; i--) {
            j = Math.floor(Math.random() * i);
            [pattern[i - 1], pattern[j]] = [pattern[j], pattern[i - 1]];
        }
        patternMatrix = pattern[0].pattern;

        return patternMatrix;
    };
    Spawner.prototype.queue = function (patternMatrix) {
        var lane,
            key,
            indicatorLane,
            iSprite,
            sprite;

        var ln,
            i;
        for (ln = 0; ln < patternMatrix.length; ln++) {
            lane = this.lanes[ln];
            indicatorLane = this.indicatorLanes[ln];
            for (i = patternMatrix[ln].length-1; i >= 0; i--) {
                key = patternMatrix[ln][i];
                // original
                if(key!==0){

                    // group = this.spawnableObjects[key].group;

                    iSprite = this.spawnableObjects[key].group.getFirstDead(true,
                        lane.x + (this.spread * i),
                        lane.y,
                        key);

                    iSprite.revive();
                    iSprite.scale.x = lane.spriteScale;
                    iSprite.scale.y = lane.spriteScale;
                    iSprite.activeLane = ln;
                }
                // indicator
                if (key === 'token') {

                    key += '-coin';
                    sprite = this.indicatorGroup.getFirstDead(true,
                                                game.width + (this.warningSpread * i),
                                                indicatorLane.y,
                                                key);

                    sprite.revive();
                    // big
                    sprite.frameName = 'empty';
                    if (i > 0 && patternMatrix[ln][i] === patternMatrix[ln][i-1]) {
                        //sprite.frame = 1; // little
                    }
                    // sprite.scale.x = lane.spriteScale;
                    // sprite.scale.y = lane.spriteScale;
                    sprite.activeLane = ln;
                }
            }
        }
        /*
        this.spawnTimer.add(this.warningDuration, function () {
            this.warningGroup.callAll('kill');
            // this.spawn(patternMatrix);
        }, this);
        */
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
                    sprite.scale.x = lane.spriteScale;
                    sprite.scale.y = lane.spriteScale;
                    sprite.activeLane = ln;
                }
            }
        }
    };

    return Spawner;

});