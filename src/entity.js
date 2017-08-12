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
        this.anchor.set(0);

        // Enable physics.
        game.physics.enable(this);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
       
        // Signals
        this.events.onDeath  = new Phaser.Signal();
        
    }


    Entity.prototype = Object.create(Phaser.Sprite.prototype);
    Entity.prototype.constructor = Entity;

    Entity.prototype.update = function () {
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
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
    };

    Entity.prototype.kill = function () {
        console.log('just killed',this);
        this.dying = false;
        Phaser.Sprite.prototype.kill.apply(this, arguments);
    };

    return Entity;

});