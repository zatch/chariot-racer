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
        Entity.call(this, game, x, y, 'chariot');
        this.anchor.set(0.95, 0);

        // Set up animations.
        this.anims = {};
        this.anims.walk = this.animations.add('walk', [0], 40);
        this.frame = 0;

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;

        // Resize player body/hitbox.
        this.body.setSize(128,64,0,0);

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 100;
        this.body.maxVelocity.y = 10000;
        this.body.drag.x = 1500;
        this.body.drag.y = 0;

        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 800;

        this.maxMoveSpeed = new Phaser.Point(300, 10000);

        // Kill player when they fall outside the bounds of the map.
        this.events.onOutOfBounds.add(this.handleDeath, this);

        StateMachine.extend(this);
        this.stateMachine.states = {
            'normal': {
                'update': this.update_normal
            }
        };
        this.stateMachine.setState('normal');
    }


    Player.prototype = Object.create(Entity.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.update_normal = function () {
        // Update sprite.
        //if (this.body.velocity.y === 0) this.frame = 0; // Don't animate when stopped.
        
        this.moveRight();

        Phaser.Sprite.prototype.update.call(this);
    };
    
    // Update children.
    Player.prototype.update = function () {
        this.stateMachine.handle('update');
    };

    Player.prototype.moveLeft = function () {
        // Play walk animation.
        if(!this.anims.walk.isPlaying) this.anims.walk.play();

        // Don't exceed max move speed.
        if(this.body.velocity.x <=  -this.maxMoveSpeed.x) this.body.velocity.x = -this.maxMoveSpeed.x;
        
    };

    Player.prototype.moveRight = function () {
        // Play walk animation.
        if(!this.anims.walk.isPlaying) this.anims.walk.play();

        // Don't exceed max move speed.
        if(this.body.velocity.x >=  this.maxMoveSpeed.x) this.body.velocity.x = this.maxMoveSpeed.x;

        this.body.acceleration.x = this.moveAccel;
    };

    Player.prototype.stopMoving = function () {
        this.body.acceleration.x = 0;
    };
    
    return Player;

});