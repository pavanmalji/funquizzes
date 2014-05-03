<?php

require_once '../vendor/google/Google_Client.php';

$guest = array(
                '_id' => '000000000000000000000000',
                'name' => 'Guest',
                'online' => false
            );

session_start();
$response = '';
        
if (isset($_GET['gplus'])) {
    if (isset($_GET['authurls'])) {
        $client = new Google_Client();
        $client->setApplicationName("Fun Quizes");
        $client->setScopes(array('https://www.googleapis.com/auth/userinfo.profile')); // set scope during user login
        $client->setClientId('529800480931-4olm7fomvrvn7evr8b71ksrdbguqamn3.apps.googleusercontent.com');
        $client->setClientSecret('rCODRuDRanlQQUle_zDUySRH');
        $client->setRedirectUri('http://funquizzes.azurewebsites.net/gplus-auth-redirect.php');
        $client->setApprovalPrompt('auto');
        
        $gplusauthurls = array(
                                'provider' => 'gplus',
                                'login' => $client->createAuthUrl(),
                                'logout' => '/gplus-auth-redirect.php?logout'
                             );
         
        $response = json_encode($gplusauthurls, JSON_UNESCAPED_SLASHES);
    }
}

if(isset($_GET['user'])) {
    if(isset($_SESSION['user'])) {
        $response = json_encode($_SESSION['user'], JSON_UNESCAPED_SLASHES);
    } else {
        $response = json_encode($guest);
    }
}

print($response);

?>
