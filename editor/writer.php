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

$outputstring = ''
.'define([], function () { '
.'"use strict";'
.'return '
.json_encode($input['levels'])
.';});';


file_put_contents(dirname(__DIR__).'/src/level-data.js',$outputstring);
echo json_encode($input['levels']);
