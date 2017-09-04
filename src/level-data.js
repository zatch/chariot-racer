define([], function () { 
    'use strict';

    var t = 'token',
        s = 'scaffolding',
        w = 'wheel',
        r = 'rock';

    var levels = [
        // L0
        {
            maxSpawns: 1,
            patterns: [
                {
                    lanes: [
                        [s,0,0,w,0,0,r],
                        [t,t,t,t,t,0,0,0,0,0,0,t,t,t,t,t,0,0,0,0,0,0,t,t,t,t,t,t,t,t,t,t],
                        []
                    ]
                }
            ]
        },
        // L1
        {
            maxSpawns: 2,
            patterns: [
                {
                    lanes: [
                        [t,t,t,t,t,0,0,0,t,t,t,t,t],
                        [0,s,0,s,0,s,0,s],
                        [0,0,0,0,0,0,0,0,0,s,0,s,0,s,0,s]
                    ]
                },
                {
                    lanes: [
                        [0,0,0,0,0,0,0,0,0,s,0,s,0,s,0,s],
                        [0,s,0,s,0,s,0,s],
                        [t,t,t,t,t,0,0,0,t,t,t,t,t]
                    ]
                }
            ]
        },
        // L2
        {
            maxSpawns: 3,
            patterns: [
                {
                    lanes: [
                        [],
                        [t,t,t,t,t,0,0,0,0,0,0,s,s,s,0,0,0,0,0,0,t,t,t,t,t],
                        [0,0,0,0,0,0,0,0,0,0,t,t,t,t,t]
                    ]
                },
                {
                    lanes: [
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,t,t,t,t,t],
                        [0,0,0,0,0,0,0,0,0,t,t,t,t,t,0,0,0,0,0,0,0,0,0,0,0,0,0,t,t,t,t,t],
                        [t,t,t,t,t,0,0,0,0,0,0,0,0,0,0,0,0,0,s,0,s,0,s,0,0,0,0,0,0,0,0,0,0,0,0,0,t,t,t,t,t]
                    ]
                },
                {
                    lanes: [
                        [s,s,s,s,s,s,s,s,s,s,s,0,0,0,0,0,0,0,0,t,t,t,t,t],
                        [0,0,0,0,0,t,t,t,t,t,0,0,0,0,0,0,0,0,0,0,0,0,0,0,s,s,s,s,s,s],
                        [s,s,s,s,s,s,s]
                    ]
                }
            ]
        },
        // L3
        {
            maxSpawns: 3,
            patterns: [
                {
                    lanes: [
                        [t,t,t,0,0,0,0,0,0,s,s,0,0,0,0,0,0,0,0,0,t,t,t,0,0,0,0,0,0,s,s,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,s,s,0,0,0,t,t,t,0,0,0,0,0,0,0,0,0,0,0,0,s,s,0,0,0,t,t,t],
                        [0,0,0,0,0,0,0,0,0,t,t,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,t,t,0,0,0,0,0,0]
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
        }, this);
    }, this);
    

    return levels;
});