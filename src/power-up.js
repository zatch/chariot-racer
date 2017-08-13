define([
    'phaser',
    'utilities/state-machine'
], function (Phaser, StateMachine) { 
    'use strict';

    // Shortcuts
    var game, self;

    function PowerUp (_game, x, y) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'power-up');
        this.anchor.set(0.5);
        this.alpha = 0.9;

        // Enable physics.
        game.physics.enable(this);

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 20;
        this.body.maxVelocity.y = 20;
        this.body.drag.x = 0;
        this.body.drag.y = 0;
        
        // The horizontal acceleration that is applied when moving.
        this.minAccel = 30;
        this.maxAccel = 60;

        // Random force timer
        this.forceMinDelay = 1000;
        this.forceMaxDelay = 3000;
        this.forceTimer = game.time.create(false);
        this.forceTimer.start();
        this.applyRandomForce();

        // Accept tap/click input.
        game.input.onTap.add(this.onTap, this);

        // Signals
        this.events.onTap = new Phaser.Signal();

        game.add.tween(this.scale).to( { x: 0.9, y: 0.9 }, 2000, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
    }

    PowerUp.prototype = Object.create(Phaser.Sprite.prototype);
    PowerUp.prototype.constructor = PowerUp;

    PowerUp.prototype.update = function () {
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    PowerUp.prototype.reset = function (x, y, health) {
        // Call up!
        Phaser.Sprite.prototype.reset.call(this, x, y, health);
        this.forceTimer.start();
        this.applyRandomForce();
    };

    PowerUp.prototype.applyRandomForce = function () {
        // Select random x-acceleration.
        this.body.acceleration.x = Math.random() * (this.maxAccel - this.minAccel) + this.minAccel;
        if (this.x < this.width) {
            // Leave x-accel positive to steer away from left oedge of screen.
        }
        else if (this.x > game.width - this.width) {
            // Steer away from right edge of screen.
            this.body.acceleration.x *= -1;
        }
        else {
            // We're somewhere in the middle, so steer randomly.
            this.body.acceleration.x *= Math.random() < 0.5 ? -1 : 1;
        }

        // Select random y-aacceleration.
        this.body.acceleration.y = Math.random() * (this.maxAccel - this.minAccel) + this.minAccel;
        if (this.y < this.height) {
            // Leave y-accel positive to steer away from top edge of screen.
        }
        else if (this.y > game.height/2 - this.height) {
            // Steer away from the race track.
            this.body.acceleration.y *= -1;
        }
        else {
            // We're somewhere in the middle, so steer randomly.
            this.body.acceleration.y *= Math.random() < 0.5 ? -1 : 1;
        }

        this.resetForceTimer();
    };

    PowerUp.prototype.resetForceTimer = function () {
        this.forceTimer.add(Math.random() * (this.forceMaxDelay - this.forceMinDelay) + this.forceMinDelay,
                            this.applyRandomForce, 
                            this);
    };

    PowerUp.prototype.onTap = function (e) {
        if (this.getBounds().contains(e.x, e.y)) {
            this.events.onTap.dispatch(this);
            this.forceTimer.stop();
            this.kill();
        }
    };

    return PowerUp;

});