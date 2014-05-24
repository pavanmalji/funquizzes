<?php

require_once 'vendor/Facebook/FacebookRedirectLoginHelper.php';
require_once 'vendor/Facebook/FacebookSession.php';
require_once 'vendor/Facebook/FacebookSDKException.php';
require_once 'vendor/Facebook/FacebookRequestException.php';
require_once 'vendor/Facebook/FacebookAuthorizationException.php';
require_once 'vendor/Facebook/FacebookRequest.php';
require_once 'vendor/Facebook/FacebookResponse.php';
require_once 'vendor/Facebook/GraphObject.php';
require_once 'vendor/Facebook/GraphUser.php';

require_once 'utils/apperyio.php';

$fbhelper = new Facebook\FacebookRedirectLoginHelper('http://funquizzes.azurewebsites.net/fb-auth-redirect.php', '1484060245157304', 'e17d5c01256c0711d77bd24292ef37ca');

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
} else {
    try {
        $session = $fbhelper->getSessionFromRedirect();
    } catch (Facebook\FacebookRequestException $ex) {
        // When Facebook returns an error
        var_dump('Ex1 : ' . $ex);
    } catch (\Exception $ex) {
        // When validation fails or other local issues
        var_dump('Ex2 : ' . $ex);
    }
    
    if (isset($session)) {
        // Logged in.
        // Get the GraphUser object for the current user:
        try {
            $user_profile = (new Facebook\FacebookRequest(
                    $session, 'GET', '/me'
                  ))->execute()->getGraphObject();
            
            if (isset($user_profile)) {
                $_SESSION['fb'] = $user_profile;

                $_SESSION['apperysession'] = json_decode($apperyclient->get_session(), true)['sessionToken'];
                
                $user = array(
                    'id' => $user_profile->getProperty('id'),
                    'name' => $user_profile->getProperty('name'),
                    'given_name' => $user_profile->getProperty('first_name'),
                    'family_name' => $user_profile->getProperty('last_name'),
                    'email' => $user_profile->getProperty('email'),
                    'picture' => 'https://graph.facebook.com/' . $user_profile->getProperty('id') . '/picture?type=large',
                    'link' => $user_profile->getProperty('link'),
                    'gender' => $user_profile->getProperty('gender')
                );
                            
                $apperyuserid = $apperyclient->set_user($user, 'fb', $_SESSION['apperysession']);
                
                $_SESSION['apperyuserid'] = $apperyuserid;

                $_SESSION['user'] = json_decode($apperyclient->set_user_status($_SESSION['apperyuserid'], true, $_SESSION['apperysession']), true);
            }
        } catch (Facebook\FacebookRequestException $e) {
            // The Graph API returned an error
            var_dump('Ex3 : ' . $e);
        } catch (\Exception $e) {
            // Some other error occurred
            var_dump('Ex4 : ' . $e);
        }
    }
}

header('Location: http://funquizzes.azurewebsites.net');

?>