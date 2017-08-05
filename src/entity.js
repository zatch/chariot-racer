define([
    'phaser',
    'utilities/state-machine'
], function (Phaser, StateMachine) { 
    'use strict';

    // Shortcuts
    var game, self;

    function Entity (_game, x, y, key, frame) {

        game = _game;
        self = this;
        
        key = key ? key : 'blank';

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, key, frame);
        this.anchor.set(0.5);

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
       
        // Signals
        this.events.onDeath  = new Phaser.Signal();
        
        // Assets for killing enemy when it goes off screen for a given period
        // of time.
        this.offCameraKillTimer = game.time.create(false);
        this.offCameraKillTimer.start(); 
        
    }


    Entity.prototype = Object.create(Phaser.Sprite.prototype);
    Entity.prototype.constructor = Entity;

    Entity.prototype.update = function () {
        
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
        
        if (this.alive) {
            if (!this.inCamera) {
                // Auto-kill if off camera for too long.
                this.offCameraKillTimer.add(2000, this.kill, this);
            }
            else {
                // Cancel auto-kill if returned to the camera.
                this.offCameraKillTimer.removeAll();
            }
        }
    };
    
    /*
     * Cause the entity to begin dying.  This is different from the "kill" 
     * method in that it does not remove the entity from the world.  Rather, it
     * provides an opportunity to, for example, show a death animation, generate
     * loot drops, etc.
     */ 
    Entity.prototype.handleDeath = function () {
        
        // You may only kill me once.  Sorry.
        if(this.dying) return;

        // Send out the obit
        this.events.onDeath.dispatch(this);

        // ... and now we're in the process of dying.  Weeeeee!
        this.dying = true;
/*
        // Now that we're dying, we don't collide with anything.
        this.body.checkCollision.up = false;
        this.body.checkCollision.down = false;
        this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;
*/
    };

    Entity.prototype.kill = function () {
        this.dying = false;
        Phaser.Sprite.prototype.kill.apply(this, arguments);
    };

    return Entity;

});