<?php

require_once 'apperyio.php';

header('Content-Type: application/json');

$apperyclient = new apperyio();

session_start();

$response = null;
 
if(isset($_SESSION['user'])) {
    if(isset($_GET['allquizzes'])) {
        $limit = (isset($_GET['limit'])) ? $_GET['limit'] : 5;
        $skip = (isset($_GET['skip'])) ? $_GET['skip'] : 0;
        $response = $apperyclient->get_all_quizzes($limit, $skip, $_SESSION['apperysession']);
    } else if(isset($_GET['quizusers'])) {
        $response = $apperyclient->get_quiz_users($_GET['quizid'], $_SESSION['apperysession']);
    } else if(isset($_GET['activequizzes'])) {
        $limit = (isset($_GET['limit'])) ? $_GET['limit'] : 5;
        $skip = (isset($_GET['skip'])) ? $_GET['skip'] : 0;
        $response = $apperyclient->get_active_quizzes($limit, $skip, $_SESSION['apperysession']);
    } else if(isset($_POST['joinquiz'])) {
        $response = $apperyclient->join_quiz($_SESSION['user'], $_POST['quiz'], $_SESSION['apperysession']);
    } else if(isset($_POST['saveuseranswer'])) {
        $response = $apperyclient->save_user_answer($_POST['quizUserData'], $_SESSION['apperysession']);
    } else if(isset($_POST['addquestionanswer'])) {
        $response = $apperyclient->add_question_answer($_SESSION['user']['_id'], $_POST['questionAnswer'], $_SESSION['apperysession']);
    } else if(isset($_GET['questionsanswers'])) {
        $limit = (isset($_GET['limit'])) ? $_GET['limit'] : 5;
        $skip = (isset($_GET['skip'])) ? $_GET['skip'] : 0;
        $response = $apperyclient->get_questions_answers($limit, $skip, $_SESSION['user']['_id'], $_SESSION['apperysession']);
    } else if(isset($_POST['createquiz'])) {
        $response = $apperyclient->create_quiz($_SESSION['user']['_id'], $_POST['quiz'], $_SESSION['apperysession']);
    } if(isset($_GET['comments'])) {
        $limit = (isset($_GET['limit'])) ? $_GET['limit'] : 5;
        $skip = (isset($_GET['skip'])) ? $_GET['skip'] : 0;
        $response = $apperyclient->get_comments($limit, $skip, $_SESSION['apperysession']);
    } else if(isset($_POST['addcomment'])) {
        $response = $apperyclient->add_comment($_SESSION['user'], $_POST['comment'], $_SESSION['apperysession']);
    } else if(isset($_GET['createdquizzes'])) {
        $limit = (isset($_GET['limit'])) ? $_GET['limit'] : 5;
        $skip = (isset($_GET['skip'])) ? $_GET['skip'] : 0;
        $response = $apperyclient->get_created_quizzes($limit, $skip, $_SESSION['user']['_id'], $_SESSION['apperysession']);
    } else if(isset($_POST['updatequiz'])) {
        $response = $apperyclient->update_quiz($_POST['quiz'], $_SESSION['apperysession']);
    }
}
print($response);
?>