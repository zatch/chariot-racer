define([], function () { 
    'use strict';

    var t = 'token',
        s = 'skull';

    var levels = [
        // L0
        {
            maxSpawns: 1,
            patterns: [
                [
                    [],
                    [t,t,t,t,t,t,t,t,t,t],
                    []
                ]
            ]
        },
        // L1
        {
            maxSpawns: 3,
            patterns: [
                [
                    [t,t,t,t,t,t,t,t,t,t],
                    [0,0,0,s,0,0,s],
                    [0,0,0,s,s,s,s]
                ],
                [
                    [0,0,0,s,0,0,s],
                    [0,0,0,s,s,s,s],
                    [t,t,t,t,t,t,t,t,t,t]
                ]
            ]
        },
        // L2
        {
            maxSpawns: 5,
            patterns: [
                [
                    [],
                    [t,t,t,0,0,0,s,s,0,0,0,t,t,t],
                    [0,0,0,0,0,t,t,t,t,0,0,0,0,0]
                ]
            ]
        }
    ];

    return levels;
});