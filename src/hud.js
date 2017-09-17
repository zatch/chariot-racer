define([
    'phaser'
], function (Phaser) {
    'use strict';

    // Shortcuts
    var game,

        distanceDisplay,

        boostMeter,
        boostMeterMaxWidth = 120,
        boostMeterStepWidth = 2,
        boostMeterSteps = boostMeterMaxWidth / boostMeterStepWidth,

        bonusText,
        boostMsg,

        levelText,
        levelNumberMsg,
        levelNameMsg,

        debugText,
        debugProps;

    function HUD(_game, x, y){
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'hud-frame', 0);
        this.anchor.set(0.5, 0);

        // Distance display
        distanceDisplay = new Phaser.BitmapText(game, this.width/-4, 12, 'boxy_bold', '0m', 16);
        distanceDisplay.anchor.set(0.5, 0);
        this.addChild(distanceDisplay);

        // Boost meter
        boostMeter = new Phaser.TileSprite(game, 38, 12, 0, 20, 'boost-meter-fill');
        this.addChild(boostMeter);
        this.updateBoostMeter(0);

        // Bonus text
        bonusText = new Phaser.Sprite(game, 0, 128, 'bonus-text');
        bonusText.anchor.set(0.5);
        bonusText.animations.add('perfect', [0,1,2], 20, true);
        bonusText.animations.add('great', [3,4,5], 20, true);
        bonusText.animations.add('good', [6,7,8], 20, true);
        bonusText.animations.add('ok', [9,10,11], 20, true);
        bonusText.animations.add('miss', [12,13,14], 20, true);

        boostMsg = bonusText.addChild(new Phaser.BitmapText(game, 0, 10, 'boxy_bold', 'null', 16));
        boostMsg.anchor.set(0.5, 0);

        this.hideBonusText();
        this.addChild(bonusText);

        // Level text
        levelText = new Phaser.Sprite(game, 0, 96, 'menu-banner-1');
        levelText.anchor.set(0.5, 0);

        levelNumberMsg = levelText.addChild(new Phaser.BitmapText(game, 0, 16, 'boxy_bold', 'null', 24));
        levelNumberMsg.anchor.set(0.5, 0);

        levelNameMsg = levelText.addChild(new Phaser.BitmapText(game, 0, 48, 'boxy_bold', 'null', 16));
        levelNameMsg.anchor.set(0.5, 0);
        
        this.hideLevelText();
        this.addChild(levelText);

        // Debug text
        if (game.debugMode) {
            debugProps = {
                level: '',
                currentSpawn: '',
                maxSpawns: '',
                patternName: '',
                currentSet: '',
                maxSets: ''
            };

            game.stage.children.forEach( function(child) {
                if (child.refID && child.refID === 'debug-text') {
                    debugText = child;
                }
            }, this) ;

            debugText = debugText ? debugText : new Phaser.BitmapText(game, 8, game.height-8, 'boxy_bold', '', 16);
            debugText.anchor.set(0, 1);
            debugText.refID = 'debug-text';
            game.stage.addChild(debugText);
        }
    }

    HUD.prototype = Object.create(Phaser.Sprite.prototype);
    HUD.prototype.constructor = HUD;

    HUD.prototype.updateDistanceDisplay = function (meters) {
        distanceDisplay.text = Math.floor(meters) + 'm';
    };

    HUD.prototype.updateBoostMeter = function (percentage) {
        boostMeter.width = Math.floor(boostMeterSteps * percentage) * boostMeterStepWidth;
    };

    HUD.prototype.showBonusText = function (percentage, duration) {
        // Select animation to play.
        if(percentage===1){
            bonusText.animations.play('perfect');
        } else if(percentage>0.8){
            bonusText.animations.play('great');
        } else if(percentage>0.4){
            bonusText.animations.play('good');
        } else if(percentage>0) {
            bonusText.animations.play('ok');
        } else {
            bonusText.animations.play('miss');
        }

        // Set boost duration text.
        var durString;
        if (duration > 0) {
            durString = Math.floor(duration/100)/10;
            if (durString % 1 === 0) durString += '.0';
            durString = '+' + durString + ' SEC BOOST';
        }
        else {
            durString = 'NO BONUS';
        }
        boostMsg.text = durString;

        // Allow rendering.
        bonusText.renderable = true;
    };
    
    HUD.prototype.hideBonusText = function () {
        bonusText.animations.stop();
        bonusText.renderable = false;
    };
    
    HUD.prototype.showLevelText = function (level, name) {
        // Allow rendering.
        var msg = 'Level ' + level;
        name = name ? name : 'nameless level';
        levelNumberMsg.text = msg.toUpperCase();
        levelNameMsg.text = name.toUpperCase();
        levelText.renderable = true;
    };
    
    HUD.prototype.hideLevelText = function () {
        levelText.renderable = false;
    };

    HUD.prototype.updateDebugText = function (props) {
        if (game.debugMode) {
            Phaser.Utils.extend(true, debugProps, props);
            var debugString = 'Level: ' + debugProps.level + 
                              ' (' + debugProps.currentSpawn + 
                              '/' + debugProps.maxSpawns + ')\n' + 

                              'Pattern: ' + debugProps.patternName + 
                              ' (' + debugProps.currentSet + 
                              '/' + debugProps.maxSets + ')';

            debugText.text = debugString.toUpperCase();
        }
    };

    return HUD;

});