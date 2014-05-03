<?php

require_once 'apperyio.php';

$apperyclient = new apperyio();

session_start();

$response = '';
 
if(isset($_SESSION['user'])) {
    if(isset($_GET['activequizzes'])) {
        $response = $apperyclient->get_active_quizzes($_SESSION['apperysession']);
    }
}

print($response);

?>
