define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game,
        boostMsg;

    function BonusText (_game, x, y) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'bonus-text');
        this.anchor.set(0.5);

        this.animations.add('perfect', [0,1,2], 20, true);
        this.animations.add('great', [3,4,5], 20, true);
        this.animations.add('good', [6,7,8], 20, true);
        this.animations.add('ok', [9,10,11], 20, true);
        this.animations.add('miss', [12,13,14], 20, true);

        boostMsg = this.addChild(new Phaser.BitmapText(game, 0, 10, 'boxy_bold', 'null', 16));
        boostMsg.anchor.set(0.5, 0);

        this.hide();
    }

    BonusText.prototype = Object.create(Phaser.Sprite.prototype);
    BonusText.prototype.constructor = BonusText;
    
    BonusText.prototype.play = function (key, duration) {
        var durString = Math.floor(duration/100)/10;
        if (durString % 1 === 0) durString += '.0';
        durString = '+' + durString + ' SEC BOOST';
        boostMsg.text = durString;
        this.renderable = true;
        this.animations.play(key);
    };
    
    BonusText.prototype.hide = function () {
        this.animations.stop();
        this.renderable = false;
    };



    return BonusText;

});