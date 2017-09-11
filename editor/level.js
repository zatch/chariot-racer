var t = {key: 'token', type: 'token'},
    p = {key: 'power-up', type: 'power-up'},
    s = {key: 'scaffolding', type: 'obstacle'},
    w = {key: 'wheel', type: 'obstacle'},
    r = {key: 'rock', type: 'obstacle'};
var levels = [
    {
        maxSpawns: 1,
        tokenCount:2,
        patterns: [
            {
                sets: [
                    {
                        lanes: [
                            [],
                            [t,t,t,t,t],
                            []
                        ]
                    },
                    {
                        lanes: [
                            [],
                            [t,t,t,t,t],
                            []
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
    },
    {
        maxSpawns: 2,
        tokenCount:2,
        patterns: [
            {
                sets: [
                    {
                        lanes: [
                            [0,0,0,0,0,0,0,t,t,t,t,t],
                            [t,t,t,t,t,0,0,0,0,0,0,s,w,r,s,r],
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
    }
];