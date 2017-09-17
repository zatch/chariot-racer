app.directive('move',function($mdDialog){
    return{
        restrict:'E',
        scope:{
            levels:'@'

        },
        template:'<div layout-padding><h2>Select</h2>' +
        '<md-select ng-model="mover">' +
        '<md-option value="{{k.level}}"  ng-repeat="k in dropdown track by $index">{{$index}}</md-option>' +
        '</md-select><md-button ng-click="move()">ok</md-button><md-button ng-click="cancel()">cancel</md-button></div>',
        link:function(scope){
            scope.dropdown=[];
            for(var i=0; i<scope.levels;i++){
                scope.dropdown.push({level:i});
            }
            scope.move = function(){
                $mdDialog.hide(scope.mover);
            };
            scope.cancel = function(){
                $mdDialog.cancel();
            }

        }
    }
});