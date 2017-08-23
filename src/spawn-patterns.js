define([], function () { 
    'use strict';

    var t = 'token',
        s = 'skull';

    var levels = [
        // L0
        {
            maxSpawns: 1,
            patterns: [
                {
                    lanes: [
                        [],
                        [t,t,t,t,t,t,t,t,t,t],
                        []
                    ]
                }
            ]
        },
        // L1
        {
            maxSpawns: 3,
            patterns: [
                {
                    lanes: [
                        [t,t,t,t,t,t,t,t,t,t],
                        [0,0,0,s,0,0,s],
                        [0,0,0,s,s,s,s]
                    ]
                },
                {
                    lanes: [
                        [0,0,0,s,0,0,s],
                        [0,0,0,s,s,s,s],
                        [t,t,t,t,t,t,t,t,t,t]
                    ]
                }
            ]
        },
        // L2
        {
            maxSpawns: 5,
            patterns: [
                {
                    lanes: [
                        [],
                        [t,t,t,0,0,0,s,s,0,0,0,t,t,t],
                        [0,0,0,0,0,t,t,t,t,0,0,0,0,0]
                    ]
                }
            ]
        }
    ];

    // Tally total tokens for each pattern.
    levels.forEach(function (level) {
        level.patterns.forEach(function (pattern) {
            pattern.tokenCount = 0;
            var lane,
                i;
            for (lane = 0; lane < pattern.lanes.length; lane++) {
                for (i = 0; i < pattern.lanes[lane].length; i++) {
                    if (pattern.lanes[lane][i] === t) {
                        pattern.tokenCount++;
                    }
                }
            }
            console.log(pattern.tokenCount);
        }, this);
    }, this);
    

    return levels;
});