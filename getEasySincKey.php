<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

require_once(realpath(__DIR__) . '/db/db_connect.php');
require_once(realpath(__DIR__) . '/utils.php');

$sid = session_id();//for php5	
$__session = $_SESSION;
session_write_close();

$encrypted = $_POST['encrypted'];

$encrypted = urldecode($encrypted);
$encrypted = str_replace("@@p@@", "+", $encrypted);


$return_data = array();
$return_data['encrypted_data'] = getEncryptedDataError(md5(time() . rand(0, 10000) . $sid), $sid);

require_once(realpath(__DIR__) . '/db_utils.php');

if($text)
{
	
	$key = pack("H*", $__session['sync_key_b_1']);
	$iv = pack("H*", $__session['sync_iv_b_1']);
	
	$_encrypted = $encrypted;
	
	//Now we receive the encrypted from the post, we should decode it from base64,
	$encrypted = base64_decode($encrypted);
	$decode_str = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $encrypted, MCRYPT_MODE_CBC, $iv);
	
	$data_mas = explode('@', $decode_str);
	
	$packet_key = trim($data_mas[0]);
	$to_user = trim($data_mas[1]);
	$key_s_a_72 = trim($data_mas[2]);
	$_sid = trim($data_mas[3]);
	
	if($_sid == $sid)
	{
		$user_id = getZUserIdBySid($sid);	
		
		if($packet_key != '' && $user_id > 0 && $to_user > 0 && $key_s_a_72 != '')
		{		
		
			$list_mas = getListFriendsByUserId($user_id);
			
			$count_list_mas = count($list_mas);
			
			//$return_data['count_list_mas'] = $count_list_mas;
			
			$user_isset_in_friend = false;
			
			for($k = 0; $k < $count_list_mas; $k++)
			{
				if($list_mas[$k]['user_id'] == $to_user)
				{
					$user_isset_in_friend = true;
				
				
				}
			
			
			}
			
			if($user_isset_in_friend)
			{
				//$return_data['user_isset_in_friend'] = 1;
			
				$easysinc_key = getEasySincKey($user_id, $to_user);	

				$easysinc_key = str_replace("+", "@@p@@", $easysinc_key);
				$easysinc_key = str_replace(" ", "@@pr@@", $easysinc_key);						
				
				$easysinc_key = urlencode($easysinc_key);		
				
				$data_req_mas = array();
				
				$data_req_mas['easysinc_key'] = $easysinc_key;
				$data_req_mas['packet_key'] = $packet_key;
				
				$data_req_str = json_encode($data_req_mas);
				
				$data_return = $data_req_str;
				
				$data_return = str_replace("+", "@@p@@", $data_return);
				$data_return = str_replace(" ", "@@pr@@", $data_return);
				
				$data_return = urlencode($data_return);	
				
				$data_return_str = htmlspecialchars($data_return);//Данные, которые мы вернем после логина (список друзей)

				//Теперь шифруем возвращаемые данные симметричным ключем key_s_a_1, который нам передала машина А
				
				include("crypto/cryptojs-aes.php");		
				
				$crypttext = htmlentities(cryptoJsAesEncrypt($key_s_a_72, $data_return_str));
											
				$crypttext = urlencode($crypttext);				
					
				$return_data['encrypted_data'] = $crypttext;		
			
			
			}
		
		
		
		}	
	
	}
	

	

}

echo json_encode($return_data);

?>