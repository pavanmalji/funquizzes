<?php
class apperyio {
    
    private function do_get($url, $sessiontoken=NULL) {
        $ch = curl_init();
        $timeout = 5;
        
        $httpheaders = array();
        array_push($httpheaders, 'X-Appery-Database-Id: 5239bcf9e4b038f7ef2db97b');
        if(!is_null($sessiontoken)) {
            array_push($httpheaders, 'X-Appery-Session-Token: '.$sessiontoken);
        }
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpheaders);
        
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

        $data = curl_exec($ch);

        if($data === false){
            die('GET Error: "' . curl_error($ch) . '" *** Code: ' . curl_errno($ch));
        }

        curl_close($ch);
        return $data;
    }
    
    private function do_post($url, $postdata, $sessiontoken=NULL, $verb='POST') {
        $ch = curl_init();
        $timeout = 5;
        
        $httpheaders = array();
        array_push($httpheaders, 'X-Appery-Database-Id: 5239bcf9e4b038f7ef2db97b');
        array_push($httpheaders, 'Content-Type: application/json');
        if(!is_null($sessiontoken)) {
            array_push($httpheaders, 'X-Appery-Session-Token: '.$sessiontoken);
        }
        
        if(strcmp($verb, 'POST') == 0) {
            curl_setopt($ch, CURLOPT_POST, true);
        } else {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $verb);
        }
        
        curl_setopt($ch, CURLOPT_URL, $url);
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpheaders);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postdata, JSON_UNESCAPED_SLASHES));

        $data = curl_exec($ch);

        if($data === false){
            die($verb. ' Error: "' . curl_error($ch) . '" *** Code: ' . curl_errno($ch));
        }

        curl_close($ch);
        
        return $data;
    }
    
    private function user_exists($where, $sessiontoken) {
        return self::do_get('https://api.appery.io/rest/1/db/users/?where=' . urlencode(json_encode($where, JSON_UNESCAPED_SLASHES)), $sessiontoken);
    }
    
    function get_session() {
        return self::do_get('https://api.appery.io/rest/1/db/login?username=' . urlencode('superadmin') . '&password='. urlencode('anisha@123'));
    }
    
    function destroy_session($sessiontoken) {
        return self::do_get('https://api.appery.io/rest/1/db/logout', $sessiontoken);
    }
    
    function is_user_online($userid, $sessiontoken) {
        
    }
    
    function set_user_status($userid, $status, $sessiontoken) {
        $postdata = array(
                            'online' => $status
                        );
        
        return self::do_post('https://api.appery.io/rest/1/db/users/' . $userid, $postdata, $sessiontoken, 'PUT');
    }
        
    function set_user($user, $provider, $sessiontoken) {
        $where = array ('username' => $user['id']);
        $existUser = json_decode(self::user_exists($where, $sessiontoken), true);
        $url = 'https://api.appery.io/rest/1/db/users';
        $verb = 'POST';
        
        if(count($existUser) > 0) {
            $url = $url . "/" . $existUser[0]['_id'];
            $verb = 'PUT';
        } else {
            $data = array(
                'username' => $user['id'],
                'password' => substr( md5(rand()), 0, 7),
                'provider' => $provider,
                'online' => false,
                'acl' => array('*' => array('read' => true, 'write' => true))
            );
        }
        
        $postdata = (isset($data) ? array_merge($user, $data) : $user);
            
        $newUser = json_decode(self::do_post($url, $postdata, $sessiontoken, $verb), true);
        return $newUser['_id'];
    }
    
    function get_all_quizzes($limit, $skip, $sessiontoken) {
        return self::do_get('https://api.appery.io/rest/1/db/collections/Quizzes/?limit=' . urlencode($limit) . '&skip=' . urlencode($skip) . '&sort=' . urlencode('-_createdAt'), $sessiontoken);
    }
    
    function get_quiz_users($quizid, $sessiontoken) {
        $where = array ('quizId' => $quizid);
        return self::do_get('https://api.appery.io/rest/1/db/collections/QuizzesUsers/?sort=' . urlencode('-correct') . '&where=' . urlencode(json_encode($where, JSON_UNESCAPED_SLASHES)), $sessiontoken);
    }
    
    
    function get_active_quizzes($limit, $skip, $sessiontoken) {
        $where = array ('active' => true);
        return self::do_get('https://api.appery.io/rest/1/db/collections/Quizzes/?limit=' . urlencode($limit) . '&skip=' . urlencode($skip) . '&sort=' . urlencode('-_createdAt') . '&where=' . urlencode(json_encode($where, JSON_UNESCAPED_SLASHES)), $sessiontoken);
    }
    
    function get_created_quizzes($limit, $skip, $userId, $sessiontoken) {
        $where = array ('userId' => $userId);
        return self::do_get('https://api.appery.io/rest/1/db/collections/Quizzes/?limit=' . urlencode($limit) . '&skip=' . urlencode($skip) . '&sort=' . urlencode('-_createdAt') . '&where=' . urlencode(json_encode($where, JSON_UNESCAPED_SLASHES)), $sessiontoken);
    }
    
    function join_quiz($user, $quiz, $sessiontoken) {
        $data = array(
            'userId' => $user['_id'],
            'quizId' => $quiz['_id'],
            'total' => count($quiz['questionids']),
            'correct' => 0,
            'wrong' => 0,
            'userInfo' => array('name' => $user['name'], 
                                                'picture' => $user['picture'], 
                                                'link' => $user['link']
                            )
        );
        
        $quizdata = array(json_decode(self::do_post('https://api.appery.io/rest/1/db/collections/QuizzesUsers/', $data, $sessiontoken)));
        
        $or = array();
        
        foreach ($quiz['questionids'] as $value) {
            array_push($or, array('_id' => $value));
        }
        
        $where = json_encode(array('$or' => $or), JSON_UNESCAPED_SLASHES);
        
        array_push($quizdata, json_decode(self::do_get('https://api.appery.io/rest/1/db/collections/QuestionsAnswers/?where=' . urlencode($where), $sessiontoken)));
        
        return json_encode($quizdata, JSON_UNESCAPED_SLASHES);
    }
    
    function save_user_answer($quizuserdata, $sessiontoken) {
        $postdata = array(
                        'userAnswers' => $quizuserdata['userAnswers'],
                        'correct' => $quizuserdata['correct'],
                        'wrong' => $quizuserdata['wrong']
                    );
        return self::do_post('https://api.appery.io/rest/1/db/collections/QuizzesUsers/' . $quizuserdata['_id'], $postdata, $sessiontoken, 'PUT');
    }
    
    function add_question_answer($userId, $questionanswer, $sessiontoken) {
        $postdata = array_merge(array('userId' => $userId), $questionanswer);
        return self::do_post('https://api.appery.io/rest/1/db/collections/QuestionsAnswers/', $postdata, $sessiontoken, 'POST');
    }
    
    function get_questions_answers($limit, $skip, $userId, $sessiontoken) {
        $where = array ('userId' => $userId);
        return self::do_get('https://api.appery.io/rest/1/db/collections/QuestionsAnswers/?limit=' . urlencode($limit) . '&skip=' . urlencode($skip) . '&sort=' . urlencode('-_createdAt'). '&where=' . urlencode(json_encode($where, JSON_UNESCAPED_SLASHES)), $sessiontoken);
    }
    
    function create_quiz($userId, $quiz, $sessiontoken) {
        $postdata = array_merge(array('userId' => $userId, 'active' => false, 'pin' => substr( md5(rand()), 0, 4)), $quiz);
        return self::do_post('https://api.appery.io/rest/1/db/collections/Quizzes/', $postdata, $sessiontoken, 'POST');
    }
    
    function get_comments($limit, $skip, $sessiontoken) {
        return self::do_get('https://api.appery.io/rest/1/db/collections/Comments/?limit=' . urlencode($limit) . '&skip=' . urlencode($skip) . '&sort=' . urlencode('-_createdAt'), $sessiontoken);
    }
    
    function add_comment($user, $comment, $sessiontoken) {
        $postdata = array(  'userId' => $user['_id'], 
                            'comment' => $comment, 
                            'userInfo' => array('name' => $user['name'], 
                                                'picture' => $user['picture'], 
                                                'link' => $user['link']
                                                )
                        );
        
        return self::do_post('https://api.appery.io/rest/1/db/collections/Comments/', $postdata, $sessiontoken, 'POST');
    }
    
    function update_quiz($quiz, $sessiontoken) {
        $postdata = array(
                        'pin' => md5($quiz['pin']),
                        'active' => $quiz['active']
                    );
                        
        return self::do_post('https://api.appery.io/rest/1/db/collections/Quizzes/' . $quiz['_id'], $postdata, $sessiontoken, 'PUT');
    }
}
    
?>
