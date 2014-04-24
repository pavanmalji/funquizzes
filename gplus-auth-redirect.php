<?php
require_once 'vendor/google/Google_Client.php'; // include the required calss files for google login
require_once 'vendor/google/contrib/Google_PlusService.php';
require_once 'vendor/google/contrib/Google_Oauth2Service.php';
session_start();
$client = new Google_Client();
$client->setApplicationName("Fun Quizes");
$client->setScopes(array('https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/plus.login')); // set scope during user login
$client->setClientId('XXXXXXX.apps.googleusercontent.com');
$client->setClientSecret('XXXXXXXX');
$client->setRedirectUri('http://funquizzes.azurewebsites.net/gplus-auth-redirect.php');
// $client->setDeveloperKey('XXXXXXXXXXXXXXXX'); // Developer key
$plus = new Google_PlusService($client);
$oauth2 = new Google_Oauth2Service($client); // Call the OAuth2 class for get email address
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
    $me = $plus->people->get('me');
    $optParams = array('maxResults' => 100);
    $activities = $plus->activities->listActivities('me', 'public', $optParams);
    // The access token may have been updated lazily.
    $_SESSION['access_token'] = $client->getAccessToken();
    $email = filter_var($user['email'], FILTER_SANITIZE_EMAIL); // get the USER EMAIL ADDRESS using OAuth2
} else {
    $authUrl = $client->createAuthUrl();
}

if (isset($me)) {
    $_SESSION['gplusuer'] = $me; // start the session
}

if (isset($_GET['logout'])) {
    unset($_SESSION['access_token']);
    unset($_SESSION['gplusuer']);
    session_destroy();
    header('Location: https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://' . $_SERVER['HTTP_HOST']);
}

header('Location: http://' . $_SERVER['HTTP_HOST']);

?>


