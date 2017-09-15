<?php
/**
 * Created by PhpStorm.
 * User: Stefan
 * Date: 9/10/2017
 * Time: 7:21 PM
 * @property layout uni
 */

error_reporting(E_ALL);
ini_set('display_errors',1);
define('datapath',dirname(__DIR__).'/src/level-data.js');

$catch = file_get_contents('php://input');
$input = json_decode($catch,true);
$answer = ['error'=>'Configuration error of call'];
header('Content-Type: application/json');
if(isset($input['function'])){
    switch ($input['function']){
        case 'write': $answer = api::write($input['data']);
        break;
        case 'read': $answer = api::read();
        break;
    }
    echo json_encode($answer);
}

// AMD module

class api{

    private static function amd($where='before'){
        if($where=='before'){
            return 'define([], function () { "use strict"; return ';
        } else {
            return ';});';
        }
    }
    static function write($input){
        $trim = self::equalize('remove',$input);

        $outputString = self::amd().json_encode($trim).self::amd('after');
        file_put_contents(datapath,$outputString);
        return ['error'=>false];
    }

    static function read(){
        $file = file_get_contents(datapath);
        $data = json_decode(substr($file,mb_strlen(self::amd())-1,mb_strlen(self::amd('after'))*-1),true);
        $data = self::equalize('add',$data);

        return ['error'=>false,'data'=>$data];
    }
    private static function equalize($direction,$data){
        foreach($data as $l=>$level){
            foreach($level['patterns'] as $p => $pattern){
                foreach($pattern['sets'] as $s => $set){
                    foreach ($set['lanes'] as $la=>$lane){

                        switch ($direction){
                            case 'add':
                                if(count($lane)<20){
                                    for($i=20;$i>count($lane);$i--){
                                        array_push($data[$l]['patterns'][$p]['sets'][$s]['lanes'][$la],0);
                                    }
                                }
                                break;
                            case 'remove':

                                for ($k = count($lane)-1;$k>=0;$k--){
                                    if($lane[$k]===0){
                                        unset($data[$l]['patterns'][$p]['sets'][$s]['lanes'][$la][$k]);
                                    } else {
                                        break;
                                    }

                                }
                                break;
                        }

                    }
                }
            }
        }
        return $data;
    }
}

