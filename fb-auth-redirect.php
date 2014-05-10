<?php
use vendor\Facebook\FacebookSession;
use vendor\Facebook\FacebookRequest;
use vendor\Facebook\GraphUser;
use vendor\Facebook\FacebookRequestException;

FacebookSession::setDefaultApplication('1484060245157304','e17d5c01256c0711d77bd24292ef37ca');

http://funquizzes.azurewebsites.net/fb-auth-redirect.php

$helper = new FacebookRedirectLoginHelper($redirect_url);
try {
    $session = $helper->getSessionFromRedirect();
} catch(FacebookRequestException $ex) {
    // When Facebook returns an error
} catch(\Exception $ex) {
    // When validation fails or other local issues
}
if ($session) {
  // Logged in.
}


// Use one of the helper classes to get a FacebookSession object.
//   FacebookRedirectLoginHelper
//   FacebookCanvasLoginHelper
//   FacebookJavaScriptLoginHelper
// or create a FacebookSession with a valid access token:
$session = new FacebookSession('access-token-here');

// Get the GraphUser object for the current user:

try {
  $me = (new FacebookRequest(
    $session, 'GET', '/me'
  ))->execute()->getGraphObject(GraphUser::className());
  echo $me->getName();
} catch (FacebookRequestException $e) {
  // The Graph API returned an error
} catch (\Exception $e) {
  // Some other error occurred
}

?>


