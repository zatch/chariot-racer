define([], function () { 
    'use strict';

    return [
        // L0
        [
            [
                [],
                [1,1,1,1,1,1,1,1,1,1],
                []
            ]
        ],
        // L1
        [
            [
                [1,1,1,1,1,1,1,1,1,1],
                [0,0,0,2,0,0,2],
                [0,0,0,2,2,2,2]
            ],
            [
                [0,0,0,2,0,0,2],
                [0,0,0,2,2,2,2],
                [1,1,1,1,1,1,1,1,1,1]
            ]
        ],
        // L2
        [
            [
                [],
                [1,1,1,0,0,0,2,2,0,0,0,1,1,1],
                [0,0,0,0,0,1,1,1,1,0,0,0,0,0]
            ]
        ]
    ];
});