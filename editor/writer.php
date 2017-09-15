<?php
/**
 * Created by PhpStorm.
 * User: Stefan
 * Date: 9/10/2017
 * Time: 7:21 PM
 * @property layout uni
 */
$catch = file_get_contents('php://input');
$input = json_decode($catch,true);

$outputstring = '';
foreach ($input['levels'] as $i=>$level){
    $tokenCount = 0;
    foreach ($level['patterns'][0]['sets'] as $set){
        foreach($set['lanes'] as $lane){
            foreach($lane as $value){
                if(isset($value['key'])&& ( $value['key']=='token' || $value['key']=='power-up')){
                    $tokenCount++;
                }
            }
        }
    }
    $input['levels'][$i]['tokenCount']=$tokenCount;
}
// $outputstring = 'var levels = '.json_encode($input['levels']);
$outputstring = ''
.'define([], function () { '
.'"use strict";'
.'return '
.json_encode($input['levels'])
.';});';


file_put_contents(dirname(__DIR__).'/src/level-data.js',$outputstring);
echo json_encode($input['levels']);
