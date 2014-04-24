<?php

require_once '../vendor/google/Google_Client.php'; // include the required calss files for google login
require_once '../vendor/google/contrib/Google_PlusService.php';
require_once '../vendor/google/contrib/Google_Oauth2Service.php';

$response = array();

$response['provider'] = 'gplus';
$response['url_login'] = '';
$response['url_logout'] = '/gplus-auth-redirect.php?logout';

$response['access_token'] = '';
$response['id'] = '';
$response['displayname'] = 'Guest';
$response['email'] = '';
$response['profile_image'] = '';

session_start();
$client = new Google_Client();
$client->setApplicationName("Fun Quizes");
$client->setScopes(array('https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/plus.login')); // set scope during user login
$client->setClientId('XXXXXXX.apps.googleusercontent.com');
$client->setClientSecret('XXXXXXX');
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



    $response['access_token'] = $_SESSION['access_token'];
    $response['id'] = $me['id'];
    $response['displayname'] = $me['displayName'];
    $response['email'] = $email;
    $response['profile_image'] = 'https://plus.google.com/s2/photos/profile/' . $me['id'] . '?sz=100';
} else {
    $authUrl = $client->createAuthUrl();
    $response['url_login'] = $authUrl;
}

if (isset($me)) {
    $_SESSION['gplusuer'] = $me; // start the session
}
?>
<?php

echo json_encode($response, JSON_UNESCAPED_SLASHES);
?>
