define([], function () { 
    'use strict';

    var t = {key: 'token', type: 'token'},
        p = {key: 'power-up', type: 'power-up'},
        s = {key: 'scaffolding', type: 'obstacle'},
        w = {key: 'wheel', type: 'obstacle'},
        r = {key: 'rock', type: 'obstacle'};

    var levels = [
        // L0
        {
            maxSpawns: 1,
            patterns: [
                {
                    sets: [
                        {
                            lanes: [
                                [0,0,0,0,0,0,0,t,t,t,t,t],
                                [t,t,t,t,t,0,0,0,0,0,0,0,0,0,t,t,t,t,t],
                                []
                            ]
                        },
                        {
                            lanes: [
                                [s,w,r,s,r],
                                [t,t,t,t,t],
                                [r,s,s,r,w]
                            ]
                        },
                        {
                            lanes: [
                                [],
                                [t,t,t,t,t,0,0,0,p],
                                []
                            ]
                        }
                    ]
                }
            ]
        }/*,
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
        }*/
    ];

    // Tally total tokens for each pattern.
    levels.forEach(function (level) {
        level.patterns.forEach(function (pattern) {
            pattern.tokenCount = 0;
            pattern.sets.forEach(function (set) {
                var lane,
                    i;
                for (lane = 0; lane < set.lanes.length; lane++) {
                    for (i = 0; i < set.lanes[lane].length; i++) {
                        if (set.lanes[lane][i] === t || set.lanes[lane][i] === p) {
                            pattern.tokenCount++;
                        }
                    }
                }
            }, this);
        }, this);
    }, this);
    

    return levels;
});