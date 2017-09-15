var app = angular.module('app',['ngMaterial'])
    .controller('mainCtrl',['$scope','$http',function($scope,$http){

        $scope.save = function(){
            $http.post('api.php',{function:'write',data:$scope.levels});
        };
        $http.post('api.php',{function:'read'}).then(function(res){
            if(res.data.error){
                alert(data.error);
            } else {
                $scope.levels = res.data.data;
            }

        });

        $scope.levels = [];
        $scope.isDrawing = false;
        $scope.toggles = {
            pattern:{}
        };
        $scope.toggle = function(what,ident){
            $scope.toggles[what][ident] =!$scope.toggles[what][ident];
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
            set:function(pattern, index){
                var lanes = [[],[],[]];
                for (var lcv = 0; lcv < 20; lcv++) {
                    lanes[0].push(0);
                    lanes[1].push(0);
                    lanes[2].push(0);
                }

                pattern.sets.splice(index, 0, {lanes:lanes});
            },
            pattern:function(level, index){
                level.patterns.splice(index, 0, {sets:[]});
                $scope.add.set(level.patterns[index], 0);
            },
            level:function(levels, index){
                levels.splice(index, 0, {maxSpawns:1, patterns:[]});
                $scope.add.pattern(levels[index], 0);
            }
        };
        $scope.delete ={
            set:function(pattern, index){
                pattern.sets.splice(index, 1);
            },
            pattern:function(level, index){
                level.patterns.splice(index, 1);
            },
            level:function(levels, index){
                levels.splice(index, 1);
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
            draw:function(lane, index){
                if ($scope.isDrawing) {
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
                    lane[index] = setter;
                }
            }
        };
    }]);