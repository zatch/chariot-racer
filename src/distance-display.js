define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function DistanceDisplay (_game, x, y) {

        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'blank');

        this.distance = '0';
        game.add.tileSprite(game.width/4, 0, 200,20, 'hud-bg');
        var positioning = this.positioning(this.distance);

        this.distanceText = game.add.bitmapText( positioning, 1, 'boxy_bold', '0m', 12);
        this.addChild(this.distanceText);
    }


    DistanceDisplay.prototype = Object.create(Phaser.Sprite.prototype);
    DistanceDisplay.prototype.positioning = function(val){
        val = Math.floor(val).toString().length;
        var pos = (game.width/3)-( (val-1)*7);
        return pos;
    };
    DistanceDisplay.prototype.constructor = DistanceDisplay;

    DistanceDisplay.prototype.updateDisplay = function (val) {
        this.distance = val;
        this.distanceText.position.x = this.positioning(val);
        this.distanceText.text =Math.floor(this.distance) + "m";
    };

    return DistanceDisplay;
});