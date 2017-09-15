var app = angular.module('app',['ngMaterial'])
    .controller('mainCtrl',['$scope','$http',function($scope,$http){
        $scope.save = function(){
            var levels = $scope.levels;
            // Tally total tokens for each pattern.
            levels.forEach(function (level) {
                level.patterns.forEach(function (pattern) {
                    pattern.tokenCount = 0;
                    pattern.sets.forEach(function (set) {
                        var lane,
                            i;
                        for (lane = 0; lane < set.lanes.length; lane++) {
                            for (i = 0; i < set.lanes[lane].length; i++) {
                                if (set.lanes[lane][i].key === 'token' || set.lanes[lane][i].key === 'power-up') {
                                    pattern.tokenCount++;
                                }
                            }
                        }
                    }, this);
                }, this);
            }, this);
            

            $http.post('writer.php',{levels:levels});
        };
        $scope.levels = levels;
        $scope.isDrawing = false;
        $scope.setLength = function(setArray){
            var ind = setArray.map(function(a){return a.length;}).indexOf(Math.max.apply(Math, setArray.map(function(a){return a.length;})));
            var handle = [];
            angular.forEach(setArray,function(lane,k){
                if(typeof  handle[k] === 'undefined'){
                    handle.push([]);
                }
                for(var i =0;i<setArray[ind].length;i++){

                    if(typeof lane[i] !== 'undefined'){

                        handle[k].push(lane[i])
                    } else {
                        handle[k].push(0);
                    }
                }

            });
            console.log(handle);
            return handle;
        };
        $scope.tools = [
            {name:'eraser',icon:'eraser'},
            {name:'wheel',icon:false},
            {name:'scaffolding',icon:false},
            {name:'rock',icon:false},
            {name:'token',icon:false},
            {name:'power-up',icon:false}
        ];
        $scope.activeTool = 'eraser';
        $scope.setTool = function(what){
            $scope.activeTool = what;
        };
        $scope.add = {
            set:function(parent_parent){
                var lanes = [[],[],[]];
                for (var lcv = 0; lcv < 20; lcv++) {
                    lanes[0].push(0);
                    lanes[1].push(0);
                    lanes[2].push(0);
                }
                $scope.levels[parent_parent].patterns[0].sets.push({lanes:lanes});
            },
            level:function(){
                $scope.levels.push({maxSpawns:1,patterns:[{sets:[{lanes:[[0][0][0]]}]}]});
            }
        };
        $scope.delete ={
            set:function(parent_parent){
                $scope.levels[parent_parent].patterns[0].sets.pop();
            }
        };
        $scope.update = {
            drawStart: function(e) {
                e.preventDefault();
                $scope.isDrawing = true;
            },
            drawEnd: function() {
                $scope.isDrawing = false;
            },
            draw:function(parent_parent_parent,parent_parent,parent, ind){
                if ($scope.isDrawing) {
                console.log('trying to draw');
                    var setter = 0;
                    switch ($scope.activeTool){
                        case 'eraser': setter = 0;
                        break;
                        case 'token':setter={key:'token',type:'token'};
                        break;
                        case 'power-up':setter={key:'power-up',type:'power-up'};
                        break;
                        case 'scaffolding':setter={key:'scaffolding',type:'obstacle'};
                        break;
                        case 'wheel':setter={key:'wheel',type:'obstacle'};
                        break;
                        case 'rock':setter={key:'rock',type:'obstacle'};
                        break;

                    }
                    $scope.levels[parent_parent_parent].patterns[0].sets[parent_parent].lanes[parent][ind] = setter;
                }
            },
            size:function(parent_parent_parent,parent_parent){

                $scope.levels[parent_parent_parent].patterns[0].sets[parent_parent].lanes[0].push(0);
                $scope.levels[parent_parent_parent].patterns[0].sets[parent_parent].lanes[1].push(0);
                $scope.levels[parent_parent_parent].patterns[0].sets[parent_parent].lanes[2].push(0);
            }
        }
    }]);