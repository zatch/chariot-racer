define([
    'phaser',
    'mute-button'
], function (Phaser, MuteButton) { 
    'use strict';

    // Shortcuts
    var game,

        stats,
        aStats,

        bg,
        bannerText,

        playBtn,
        challengeBtn,
        challengeAnchor,
        creditsBtn,

        music;

    return {
        // Intro
        init: function (data) {
            game = this.game;

            stats = {
                totalMeters: 0,
                totalTokens: 0,
                totalPowerUps: 0,
                totalBoostTime: 0,
                farthestLevel: 0
            };
            Phaser.Utils.extend(true, stats, data);

            stats = {
                totalMeters:    {label: 'DISTANCE TRAVELED . . . . . ',val: Math.floor(stats.totalMeters),          unit: 'm'},
                totalTokens:    {label: 'TOKENS COLLECTED . . . . . ', val: Math.floor(stats.totalTokens),          unit: ''},
                totalPowerUps:  {label: 'POWER-UP BOOSTS . . . . . ',  val: Math.floor(stats.totalPowerUps),        unit: ''},
                totalBoostTime: {label: 'TOTAL BOOST TIME . . . . . ', val: Math.floor(stats.totalBoostTime/100)/10,unit: 's'},
                farthestLevel:  {label: 'LEVEL REACHED . . . . . ',    val: Math.floor(stats.farthestLevel+1),        unit: ''}
            };
            if (stats.totalBoostTime %1 === 0) stats.totalBoostTime += '.0';

            aStats = [stats.totalMeters, stats.totalTokens, stats.totalPowerUps, stats.totalBoostTime, stats.farthestLevel];
            console.log(aStats);
        },
        
        // Main
        create: function () {
            // Button SFX
            game.sound.add('menu-back');

            // Background
            bg = game.add.sprite(0, 80, 'menu-bg-2');
            bg.x = game.width / 2 - bg.width / 2;

            bg.label = bg.addChild(new Phaser.BitmapText(
                game, 
                bg.width/2,
                30,
                'boxy_bold',
                'GAME OVER',
                16,
                'center'
            ));
            bg.label.anchor.set(0.5);

            var statX = bg.width / 2 + 64,
                statY = 144,
                lineHeight = 48;
            for (var lcv = 0; lcv < aStats.length; lcv++) {
                aStats[lcv].labelText = bg.addChild(new Phaser.BitmapText(
                    game, 
                    statX,
                    statY,
                    'boxy_bold',
                    aStats[lcv].label,
                    16
                ));
                aStats[lcv].labelText.anchor.set(1, 1);

                aStats[lcv].valText = bg.addChild(new Phaser.BitmapText(
                    game, 
                    statX,
                    statY+2,
                    'boxy_bold',
                    aStats[lcv].val+aStats[lcv].unit,
                    32
                ));
                aStats[lcv].valText.anchor.set(0, 1);

                statY += lineHeight;
            }

            // Challenge a Friend button
            challengeBtn = bg.addChild(new Phaser.Button(game, 264, 390, 'menu-btn3', this.onChallengeBtnClicked));
            challengeBtn.anchor.set(0.5, 0);
            challengeBtn.label = challengeBtn.addChild(new Phaser.BitmapText(
                game, 
                0,
                26,
                'boxy_bold',
                'CHALLENGE A FRIEND',
                16
            ));
            challengeBtn.label.anchor.set(0.5);
            challengeBtn.animations.add('selected', [0,1,0], 20);

            // Play Again button
            playBtn = bg.addChild(new Phaser.Button(game, bg.width-200, 390, 'menu-btn2', this.onPlayBtnClicked));
            playBtn.anchor.set(0.5, 0);
            playBtn.label = playBtn.addChild(new Phaser.BitmapText(
                game, 
                0,
                26,
                'boxy_bold',
                'PLAY AGAIN',
                16
            ));
            playBtn.label.anchor.set(0.5);
            playBtn.animations.add('selected', [0,1,0], 20);

            // Credits button
            creditsBtn = game.add.button(game.width/2, game.height, 'credits-btn', this.onCreditsBtnClicked);
            creditsBtn.anchor.set(0.5, 1);
            creditsBtn.animations.add('selected', [0,1,0], 20);

            // Mute button
            game.add.existing(new MuteButton(game));

            // Music
            music = game.add.audio('menu-music', 0.5, true);
            music.play();

            var mailto = 'mailto:' +
                         '?subject=I made it ' + stats.totalMeters.val + ' meters in Chariot Racer. Can you beat my score?' +
                         '&body=I made it ' + stats.totalMeters.val + ' meters in Chariot Racer. Try to top my score!' +
                         '%0D%0A' +
                         '%0D%0A' +
                         'https://shirepharma.sharepoint.com/sites/PresidentsClub/2017/Chariot%2520Racer/index.aspx' +
                         '%0D%0A' +
                         '%0D%0A' +
                         'Will you accept the Emperor\'s challenge?';

            challengeAnchor = document.createElement('a');
            challengeAnchor.href=mailto;
            challengeAnchor.target='_top';
            challengeAnchor.width=challengeBtn.width;
            challengeAnchor.height=challengeBtn.height;
            challengeAnchor.setAttribute('style','display:block;position:absolute;background-color:rgba(255,255,255,0);top:'+((challengeBtn.y+80)*game.scale.scaleFactorInversed.y)+'px;left:'+((challengeBtn.x-31)*game.scale.scaleFactorInversed.x)+'px;width:'+(challengeBtn.width*game.scale.scaleFactorInversed.x)+'px;height:'+(challengeBtn.height*game.scale.scaleFactorInversed.y)+'px;');
            document.body.appendChild(challengeAnchor);

            game.scale.onSizeChange.add(function() {
                challengeAnchor.setAttribute('style','display:block;position:absolute;background-color:rgba(255,255,255,0);top:'+((challengeBtn.y+80)*game.scale.scaleFactorInversed.y)+'px;left:'+((challengeBtn.x-31)*game.scale.scaleFactorInversed.x)+'px;width:'+(challengeBtn.width*game.scale.scaleFactorInversed.x)+'px;height:'+(challengeBtn.height*game.scale.scaleFactorInversed.y)+'px;');
            }, this);
        },

        shutdown: function () {
            challengeAnchor.parentNode.removeChild(challengeAnchor);
        },

        onChallengeBtnClicked: function() {
            game.sound.play('menu-select');

            challengeBtn.animations.play('selected').onComplete.addOnce(function() {
                var mailto = 'mailto:' +
                             '?subject=I made it ' + stats.totalMeters.val + ' meters in Chariot Racer. Can you beat my score?' +
                             '&body=I made it ' + stats.totalMeters.val + ' meters in Chariot Racer. Try to top my score!' +
                             '%0D%0A' +
                             '%0D%0A' +
                             'https://shirepharma.sharepoint.com/sites/PresidentsClub/2017/Chariot%2520Racer/index.aspx' +
                             '%0D%0A' +
                             '%0D%0A' +
                             'Will you accept the Emperor\'s challenge?';
                window.location.href = mailto;
            }, this);
        },

        onPlayBtnClicked: function() {
            game.sound.play('menu-select');

            playBtn.animations.play('selected').onComplete.addOnce(function() {
                music.stop();
                this.game.stateTransition.to('Menu', true, false);
            }, this);
        },

        onCreditsBtnClicked: function() {
            game.sound.play('menu-select');

            creditsBtn.animations.play('selected').onComplete.addOnce(function() {
                music.stop();
                this.game.stateTransition.to('Credits', true, false, {backState: 'GameOver', backData: stats});
            }, this);
        }
    };
});