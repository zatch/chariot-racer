define([
    'phaser',
    'utilities/state-machine'
], function (Phaser, StateMachine) { 
    'use strict';

    // Shortcuts
    var game;

    function Player (_game, x, y, key) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, key);
        this.anchor.set(1, 1);

        // Set up animations.
        this.anims = {};
        this.animations.add('walk', [0,1,2,3,4,5,6,7,8], 20);
        this.animations.add('dying', [9,10,11,12,13,14,15,16,17,18], 15, true);
        this.frame = 0;
        this.dyingLastFrame = 14; // 16 is a blank frame
        this.dying = false;

        this.poweredUpMaxVelocity = 50;
        this.normalMaxVelocity = 17;

        this.powerupDuration = 0;
        this.maxPowerupDuration = 4000;
        this.powerupTimer = game.time.create(false);
        this.powerupTimer.start();

        // Enable physics.
        game.physics.enable(this);

        // Resize player body/hitbox.
        this.body.setSize(122,2,30,110);

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.velocity.x = this.normalMaxVelocity;
        this.body.drag.x = 0;

        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 80;

        // Signals
        this.events.onDeath = new Phaser.Signal();
        this.events.onPowerUpStart = new Phaser.Signal();
        this.events.onPowerUpStep = new Phaser.Signal();
        this.events.onPowerUpEnd = new Phaser.Signal();

        StateMachine.extend(this);
        this.stateMachine.onStateChange.add(this.onSelfChangeState, this);
        this.stateMachine.states = {
            'normal': {
                'update': this.update_normal
            },
            'powered-up': {
                'update': this.update_poweredUp
            },
            'dying': {
                'update': this.update_dying
            }
        };
        this.stateMachine.setState('normal');
    }


    Player.prototype = Object.create(Phaser.Sprite.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.update_normal = function () {
        
    };

    Player.prototype.update_poweredUp = function () {
        // Announce remaining power up as percentage of total duration.
        this.events.onPowerUpStep.dispatch(this, this.powerupTimer.duration / this.maxPowerupDuration);
    };

    Player.prototype.update_dying = function () {

    };
    
    // Update children.
    Player.prototype.update = function () {
        this.stateMachine.handle('update');
        Phaser.Sprite.prototype.update.call(this);
    };

    Player.prototype.stopMoving = function () {
        this.body.acceleration.x = 0;
        this.body.drag.x = 60;
    };

    Player.prototype.damage = function () {
        this.stateMachine.setState('dying');
    };

    Player.prototype.powerUp = function (percentage) {
        this.powerupDuration = this.maxPowerupDuration * percentage;
        if (this.powerupDuration > 0) {
            this.stateMachine.setState('powered-up');
        }
    };
    
    Player.prototype.onSelfChangeState = function (sm, stateName) {
        // Normal
        if (stateName === 'normal') {
            this.powerupDuration = 0;

            this.animations.play('walk', 20, true);
            this.animations.getAnimation('walk').speed = 20;

            game.add.tween(this.body.velocity).to(
                { x: this.normalMaxVelocity }, 
                500, 
                Phaser.Easing.Cubic.In, 
                true);
            this.events.onPowerUpEnd.dispatch(this);
        }

        // Powered Up
        else if (stateName === 'powered-up') {
            this.animations.play('walk', 40, true);
            this.animations.getAnimation('walk').speed = 40;

            game.add.tween(this.body.velocity).to(
                { x: this.poweredUpMaxVelocity }, 
                250, 
                Phaser.Easing.Cubic.In, 
                true);

            this.powerupTimer.removeAll();
            this.powerupTimer.add(
                this.powerupDuration,
                function () {
                    this.stateMachine.setState('normal');
                }, 
                this);
            this.events.onPowerUpStart.dispatch(this);
        }

        // Dying
        else if (stateName === 'dying') {
            this.animations.play('dying', 20, false);
            this.dying = true;
            this.stopMoving();
            this.animations.getAnimation('dying').onComplete.add(function() {
                this.events.onDeath.dispatch(this);
            }, this);
        }
    };
    
    return Player;

});