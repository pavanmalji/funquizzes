<?php

class apperyio {
    
    private function do_get($url, $sessiontoken=NULL) {
        $ch = curl_init();
        $timeout = 5;
        
        $httpheaders = array();
        array_push($httpheaders, 'X-Appery-Database-Id: XXXXXXXX');
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
        array_push($httpheaders, 'X-Appery-Database-Id: XXXXXXXXXX');
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
        return self::do_get('https://api.appery.io/rest/1/db/collections/Quizes/?where=' . urlencode(json_encode($where, JSON_UNESCAPED_SLASHES)), $sessiontoken);
    }
}

?> 
