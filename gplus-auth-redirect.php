<?php
require_once 'vendor/google/Google_Client.php'; // include the required calss files for google login
require_once 'vendor/google/contrib/Google_Oauth2Service.php';
require_once 'utils/apperyio.php';


$client = new Google_Client();
$client->setApplicationName("Fun Quizes");
$client->setScopes(array('https://www.googleapis.com/auth/userinfo.profile')); // set scope during user login
$client->setClientId('529800480931.apps.googleusercontent.com');
$client->setClientSecret('rCODRuDRanlQQUle_zDUySRH');
$client->setRedirectUri('http://funquizzes.azurewebsites.net/gplus-auth-redirect.php');
$client->setApprovalPrompt('auto');
$oauth2 = new Google_Oauth2Service($client); // Call the OAuth2 class for get email address

$apperyclient = new apperyio();

session_start();

if (isset($_GET['logout'])) {
    
    $apperyclient->set_user_status($_SESSION['apperyuserid'], false, $_SESSION['apperysession']);
    $apperyclient->destroy_session($_SESSION['apperysession']);
    
    unset($_SESSION['access_token']);
    unset($_SESSION['gplusuer']);
    unset($_SESSION['apperysession']);
    unset($_SESSION['apperyuserid']);
    unset($_SESSION['user']);
    
    session_destroy();
    
    // header('Location: https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://' . $_SERVER['HTTP_HOST']);
} else {
    if (isset($_GET['code'])) {
        $client->authenticate(); // Authenticate
        $_SESSION['access_token'] = $client->getAccessToken(); // get the access token here
        header('Location: http://' . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF']);
    }

    if (isset($_SESSION['access_token'])) {
        $client->setAccessToken($_SESSION['access_token']);
    }

    if ($client->getAccessToken()) {
        $user = $oauth2->userinfo->get();
        $_SESSION['access_token'] = $client->getAccessToken();
    }

    if (isset($user)) {
        $_SESSION['gplusuer'] = $user;

        $_SESSION['apperysession'] = json_decode($apperyclient->get_session(), true)['sessionToken'];

        $apperyuserid = $apperyclient->set_user($user, 'gplus', $_SESSION['apperysession']);
        $_SESSION['apperyuserid'] = $apperyuserid;

        $_SESSION['user'] = json_decode($apperyclient->set_user_status($_SESSION['apperyuserid'], true, $_SESSION['apperysession']), true);
    }
}

header('Location: http://funquizzes.azurewebsites.net');

?>


