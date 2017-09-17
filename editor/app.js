var app = angular.module('app',['ngMaterial','ngDragDrop'])
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
        $scope.dragged = false;
        $scope.dragging = function(){
            console.log('start');
            $scope.dragged =! $scope.dragged;
        };
        $scope.toggles = {
            pattern:{}
        };
        $scope.toggle = function(what,ident){
            $scope.toggles[what][ident] =!$scope.toggles[what][ident];
        };
        $scope.tools = [
            {name:'eraser',     icon:'eraser',      hotkey:'E'},
            {name:'grabber',    icon:'hand-rock-o', hotkey:'V'},
            {name:'random',     icon:'random',      hotkey:'R'},
            {name:'wheel',      icon:false,         hotkey:'1'},
            {name:'scaffolding',icon:false,         hotkey:'2'},
            {name:'rock',       icon:false,         hotkey:'3'},
            {name:'token',      icon:false,         hotkey:'T'},
            {name:'power-up',   icon:false,         hotkey:'G'}
        ];
        $scope.activeTool = '';
        $scope.setTool = function(what){
            $scope.activeTool = what;
        };
        angular.element(document).bind('keydown', function (e) {
            if(e.target.nodeName.toLowerCase() === 'input'){
                if (_keyCodes[e.which] === 'enter') {
                    e.target.blur();
                }
                return;
            }
            if (e.ctrlKey || e.metaKey) {
                switch (String.fromCharCode(e.which).toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        e.stopPropagation();
                        $scope.save();
                        break;
                    case 'z':
                        e.preventDefault();
                        e.stopPropagation();
                        $scope.history.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        e.stopPropagation();
                        $scope.history.redo();
                        break;
                }
            }
            else{
                switch (_keyCodes[e.which]) {
                    case 'e':
                        $scope.setTool('eraser');
                        break;
                    case 'v':
                        $scope.setTool('grabber');
                        break;
                    case 'r':
                        $scope.setTool('random');
                        break;
                    case '1':
                        $scope.setTool('wheel');
                        break;
                    case '2':
                        $scope.setTool('scaffolding');
                        break;
                    case '3':
                        $scope.setTool('rock');
                        break;
                    case 't':
                        $scope.setTool('token');
                        break;
                    case 'g':
                        $scope.setTool('power-up');
                        break;
                    case 'escape':
                        $scope.setTool('');
                        break;
                    case 'enter':
                        angular.element($scope).focus();
                        break;
                }
                $scope.$apply(); // hack the UI to update now!
            }
            
        });

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
                level.patterns.splice(index, 0, {sets:[],enabled:true});
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
        $scope.sort = {

        };
        $scope.history = {
            _log: [],
            index: -1,
            log: function(action, props) {
                $scope.history._log.splice($scope.history.index+1, $scope.history._log.length);
                $scope.history._log.push({
                    action: action,
                    props: props
                });
                $scope.history.index = $scope.history._log.length-1;
            },
            undo: function() {
                if ($scope.history.index >= 0) {
                    var change = $scope.history._log[$scope.history.index];
                    switch(change.action) {
                        case 'draw':
                            $scope.update.drawStart();
                            $scope.update.draw(change.props.lane, 
                                               change.props.index, 
                                               change.props.fromTool, 
                                               true);
                            $scope.update.drawEnd();
                            $scope.history.index--;
                            $scope.$apply(); // hack the UI to update now!
                            break;
                    }
                }
            },
            redo: function() {
                if ($scope.history.index < $scope.history._log.length-1) {
                    var change = $scope.history._log[$scope.history.index+1];
                    switch(change.action) {
                        case 'draw':
                            $scope.update.drawStart();
                            $scope.update.draw(change.props.lane, 
                                               change.props.index, 
                                               change.props.toTool, 
                                               true);
                            $scope.update.drawEnd();
                            $scope.history.index++;
                            $scope.$apply(); // hack the UI to update now!
                            break;
                    }
                }
            }
        };
        $scope.update = {
            drawStart: function(e) {
                if (!!e) e.preventDefault();
                $scope.isDrawing = true;
            },
            drawEnd: function() {
                $scope.isDrawing = false;
            },
            draw:function(lane, index, tool, fromHistory){
                if ($scope.isDrawing) {
                    fromHistory = !!fromHistory ? fromHistory : false;
                    tool = !!tool ? tool : $scope.activeTool;
                    if (tool === 'random') {
                        switch (Math.floor(Math.random() * 3) + 1) {
                            case 1:
                                tool = 'wheel';
                                break;
                            case 2:
                                tool = 'scaffolding';
                                break;
                            case 3:
                                tool = 'rock';
                                break;
                        }
                    }
                    
                    if (!fromHistory) {
                        var historyProps = {
                            lane: lane,
                            index: index,
                            fromTool: lane.slice()[index],
                            toTool: tool
                        };
                        if (historyProps.fromTool === 0) {
                            historyProps.fromTool = 'eraser';
                        }
                        else {
                            historyProps.fromTool = historyProps.fromTool.key;
                        }
                        $scope.history.log('draw', historyProps);
                    }

                    var setter = 0;
                    switch (tool){
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

var _keyCodes={3:"break",8:"backspace / delete",9:"tab",12:"clear",13:"enter",16:"shift",17:"ctrl",18:"alt",19:"pause/break",20:"caps lock",27:"escape",28:"conversion",29:"non-conversion",32:"spacebar",33:"page up",34:"page down",35:"end",36:"home ",37:"left arrow ",38:"up arrow ",39:"right arrow",40:"down arrow ",41:"select",42:"print",43:"execute",44:"Print Screen",45:"insert ",46:"delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",58:":",59:"semicolon (firefox), equals",60:"<",61:"equals (firefox)",63:"ß",64:"@ (firefox)",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",91:"Windows Key / Left ⌘ / Chromebook Search key",92:"right window key ",93:"Windows Menu / Right ⌘",96:"numpad 0 ",97:"numpad 1 ",98:"numpad 2 ",99:"numpad 3 ",100:"numpad 4 ",101:"numpad 5 ",102:"numpad 6 ",103:"numpad 7 ",104:"numpad 8 ",105:"numpad 9 ",106:"multiply ",107:"add",108:"numpad period (firefox)",109:"subtract ",110:"decimal point",111:"divide ",112:"f1 ",113:"f2 ",114:"f3 ",115:"f4 ",116:"f5 ",117:"f6 ",118:"f7 ",119:"f8 ",120:"f9 ",121:"f10",122:"f11",123:"f12",124:"f13",125:"f14",126:"f15",127:"f16",128:"f17",129:"f18",130:"f19",131:"f20",132:"f21",133:"f22",134:"f23",135:"f24",144:"num lock ",145:"scroll lock",160:"^",161:"!",163:"#",164:"$",165:"ù",166:"page backward",167:"page forward",169:"closing paren (AZERTY)",170:"*",171:"~ + * key",173:"minus (firefox), mute/unmute",174:"decrease volume level",175:"increase volume level",176:"next",177:"previous",178:"stop",179:"play/pause",180:"e-mail",181:"mute/unmute (firefox)",182:"decrease volume level (firefox)",183:"increase volume level (firefox)",186:"semi-colon / ñ",187:"equal sign ",188:"comma",189:"dash ",190:"period ",191:"forward slash / ç",192:"grave accent / ñ / æ",193:"?, / or °",194:"numpad period (chrome)",219:"open bracket ",220:"back slash ",221:"close bracket / å",222:"single quote / ø",223:"`",224:"left or right ⌘ key (firefox)",225:"altgr",226:"< /git >",230:"GNOME Compose Key",231:"ç",233:"XF86Forward",234:"XF86Back",240:"alphanumeric",242:"hiragana/katakana",243:"half-width/full-width",244:"kanji",255:"toggle touchpad"};