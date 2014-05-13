<?php

require_once 'apperyio.php';

$apperyclient = new apperyio();

session_start();

$response = null;
 
if(isset($_SESSION['user'])) {
    if(isset($_GET['activequizzes'])) {
        $response = $apperyclient->get_active_quizzes($_SESSION['apperysession']);
    } else if(isset($_POST['joinquiz'])) {
        $response = $apperyclient->join_quiz($_SESSION['user']['_id'], $_POST['quiz'], $_SESSION['apperysession']);
    } else if(isset($_POST['saveuseranswer'])) {
        $response = $apperyclient->save_user_answer($_POST['quizUserData'], $_SESSION['apperysession']);
    } else if(isset($_POST['addquestionanswer'])) {
        $response = $apperyclient->add_question_answer($_POST['questionAnswer'], $_SESSION['apperysession']);
    } 
}
print($response);
?>