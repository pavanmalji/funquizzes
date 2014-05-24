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
        
        if(count($existUser) > 0) {
            return $existUser[0]['_id'];
        }
      
        $data = array(
            'username' => $user['id'],
            'password' => substr( md5(rand()), 0, 7),
            'provider' => $provider,
            'online' => false,
            'acl' => array('*' => array('read' => true, 'write' => true))
        );
        
        $postdata = array_merge($user, $data);
        $newUser = json_decode(self::do_post("https://api.appery.io/rest/1/db/users", $postdata), true);
        
        return $newUser['_id'];     
    }
    
    function get_active_quizzes($sessiontoken) {
        $where = array ('active' => true);
        return self::do_get('https://api.appery.io/rest/1/db/collections/Quizzes/?where=' . urlencode(json_encode($where, JSON_UNESCAPED_SLASHES)), $sessiontoken);
    }
    
    function join_quiz($userId, $quiz, $sessiontoken) {
        $data = array(
            'userId' => $userId,
            'quizId' => $quiz['_id']
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
        $postdata = array('userAnswers' => $quizuserdata['userAnswers']);
        return self::do_post('https://api.appery.io/rest/1/db/collections/QuizzesUsers/' . $quizuserdata['_id'], $postdata, $sessiontoken, 'PUT');
    }
    
    function add_question_answer($userId, $questionanswer, $sessiontoken) {
        $postdata = array_merge(array('userId' => $userId), $questionanswer);
        return self::do_post('https://api.appery.io/rest/1/db/collections/QuestionsAnswers/', $postdata, $sessiontoken, 'POST');
    }
    
    function get_questions_answers($userId, $sessiontoken) {
        $where = array ('userId' => $userId);
        return self::do_get('https://api.appery.io/rest/1/db/collections/QuestionsAnswers/?where=' . urlencode(json_encode($where, JSON_UNESCAPED_SLASHES)), $sessiontoken);
    }
    
    function create_quiz($userId, $quiz, $sessiontoken) {
        $postdata = array_merge(array('quizmaster' => $userId), $quiz);
        return self::do_post('https://api.appery.io/rest/1/db/collections/Quizzes/', $postdata, $sessiontoken, 'POST');
    }
}
    
?>
