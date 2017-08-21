define([], function () { 
    'use strict';
    var t = 'token',
        x = 'skull';
    return [
        {
            level:0,
            combine:false,
            pattern:[
                [],
                [x,x,x,x,x,x,x,x,x,x],
                []
            ]
        },
        {
            level:1,
            combine:true,
            pattern:[
                [x,x,x,x,x,x,x,x,x,x],
                [0,0,0,t,0,0,t],
                [0,0,0,t,t,t,t]
            ]
        },{
            level:1,
            combine:true,
            pattern:[
                [0,0,0,t,0,0,t],
                [0,0,0,t,t,t,t],
                [x,x,x,x,x,x,x,x,x,x]
            ]
        },{
            level:2,
            combine:false,
            pattern:[
                [],
                [x,x,x,0,0,0,t,t,0,0,0,x,x,x],
                [0,0,0,0,0,x,x,x,x,0,0,0,0,0]
            ]
        },{
            level:2,
            combine:false,
            pattern:[
                [0,0,0,0,t,t,x,x,t,t,0,0,t,0],
                [x,x,x,0,0,0,t,t,0,0,0,x,x,x],
                [0,0,0,0,0,x,x,x,x,0,0,0,0,0]
            ]
        },{
            level:3,
            combine:true,
            pattern:[
                [t,t,t,0,0,0,0,0],
                [x,x,x,0,0,0,t,t,0,0,0,x,x,x],
                [0,0,0,0,0,x,x,x,x,0,0,0,0,0]
            ]
        },{
            level:3,
            combine:true,
            pattern:[
                [0,0,0,0,0,0,0,0,x,x,x,0,0],
                [x,x,x,0,0,0,0,t,0,0,0,x,x,x],
                [0,0,0,0,0,x,t,t,t,0,0,0,0,0]
            ]
        }

    ];
});