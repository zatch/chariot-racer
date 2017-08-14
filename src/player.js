define([
    'phaser',
    'entity',
    'utilities/state-machine'
], function (Phaser, Entity, StateMachine) { 
    'use strict';

    // Shortcuts
    var game;

    function Player (_game, x, y) {
        game = _game;

        // Initialize sprite
        Entity.call(this, game, x, y, game.chariot_color);
        this.anchor.set(1, 0.5);

        // Set up animations.
        this.anims = {};
        this.anims.walk = this.animations.add('walk', [0,1,2,3,4,5,6,7,8,9,10], 15);
        this.anims.dying = this.animations.add('dying', [11,12,13,14,15,16], 15, true);
        this.frame = 0;
        this.dyingLastFrame = 16; // 16 is a blank frame
        this.dying = false;

        this.invulnerable = false;
        this.poweredUpMaxVelocity = 30;
        this.normalMaxVelocity = 10;

        this.powerupDuration = 5000;
        this.powerupTimer = game.time.create(false);
        this.powerupTimer.start();

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;

        // Resize player body/hitbox.
        this.body.setSize(100,40,86,72);

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = this.normalMaxVelocity;
        this.body.drag.x = 10;

        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 80;

        // Signals
        this.events.onDeath = new Phaser.Signal();

        StateMachine.extend(this);
        this.stateMachine.onStateChange.add(this.onSelfChangeState, this);
        this.stateMachine.states = {
            'normal': {
                'update': this.update_normal
            },
            'powered-up': {
                'update': this.update_normal
            },
            'dying': {
                'update': this.update_dying
            }
        };
        this.stateMachine.setState('normal');
    }


    Player.prototype = Object.create(Entity.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.update_normal = function () {
        // Play walk animation.
        if(!this.anims.walk.isPlaying) this.anims.walk.play();

        this.body.acceleration.x = this.moveAccel;

        Phaser.Sprite.prototype.update.call(this);
    };

    Player.prototype.update_dying = function () {
        if(!this.anims.dying.isPlaying && !this.dying) this.anims.dying.play();
        this.dying = true;
        this.body.acceleration.x = 0;

        Phaser.Sprite.prototype.update.call(this);

        if(this.frame===this.dyingLastFrame) {
            this.anims.dying.stop();
            this.events.onDeath.dispatch(this);
        }
    };
    
    // Update children.
    Player.prototype.update = function () {
        this.stateMachine.handle('update');
    };

    Player.prototype.stopMoving = function () {
        this.body.acceleration.x = 0;
    };

    Player.prototype.damage = function () {
        this.stateMachine.setState('dying');
    };

    Player.prototype.powerUp = function () {
        this.stateMachine.setState('powered-up');
    };
    
    Player.prototype.onSelfChangeState = function (sm, stateName) {
        if (stateName === 'normal') {
            this.invulnerable = false;
            this.body.maxVelocity.x = this.normalMaxVelocity;
        }
        else if (stateName === 'powered-up') {
            this.invulnerable = true;
            this.body.maxVelocity.x = this.poweredUpMaxVelocity;
            this.powerupTimer.removeAll();
            this.powerupTimer.add(
                this.powerupDuration,
                function () {
                    this.stateMachine.setState('normal');
                }, 
                this);
            console.log('powered up for ',this.powerupTimer.duration);
        }
    };
    
    return Player;

});