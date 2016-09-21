<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

require_once(realpath(__DIR__) . '/db/db_connect.php');
require_once(realpath(__DIR__) . '/utils.php');

$sid = session_id();//for php5	
$__session = $_SESSION;
session_write_close();

$encrypted = $_POST['encrypted'];

$return_data = array();
$return_data['encrypted_data'] = getEncryptedDataError(md5(time() . rand(0, 10000) . $sid), $sid);


require_once(realpath(__DIR__) . '/db_utils.php');

if($text && $encrypted != "")
{
	
	$encrypted = urldecode($encrypted);
	$encrypted = str_replace("@@p@@", "+", $encrypted);		

	
	$key = pack("H*", $__session['sync_login_key']);
	$iv = pack("H*", $sid);
	
	//Now we receive the encrypted from the post, we should decode it from base64,
	$encrypted = base64_decode($encrypted);
	$decode_str = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $encrypted, MCRYPT_MODE_CBC, $iv);
	

	
	$data_mas = explode('@', $decode_str);
	
	$data_send_str = $data_mas[0];
	
	$data_send_str = urldecode($data_send_str);
	$data_send_str = str_replace("@@p@@", "+", $data_send_str);	



	if($data_send_str != "")
	{	
			
		//$return_data['data_send_str'] = $data_send_str;		
			
		$data_send_mas = json_decode($data_send_str, true);
	
		$sid_b = $data_send_mas['sid'];		
		$packet_key = $data_send_mas['packet_key'];	
		$key_s_a_5 = $data_send_mas['key_s_a_5'];//Этим ключем зашифруем обратку
			
		$user_id = getZUserIdBySid($sid);	
		
		setOnline($user_id);
		
		if($sid_b == $sid && $user_id > 0 )
		{
			//Достали данные из под синхронного ключа
			//Добавим в други если юзер есть и мы для него не заблочены.. заблоченность потом проветим
			
			
			$list_mas = getListFriendsByUserId($user_id);
			$list_2_mas = getListNotFriendsByUserId($user_id);
			
			$data_mas = array();
			
			$data_mas['list_mas'] = $list_mas;	
			$data_mas['list_2_mas'] = $list_2_mas;	
			$data_mas['packet_key'] = $packet_key;
			//$data_mas['user_id'] = $user_id;
			
			$data_return_str = json_encode($data_mas);		
			
			
			$data_return_str = str_replace("+", "@@p@@", $data_return_str);
			$data_return_str = str_replace(" ", "@@pr@@", $data_return_str);
			
			$data_return_str = urlencode($data_return_str);				
						
			//Теперь шифруем возвращаемые данные симметричным ключем key_s_a_5, который нам передала машина А
						
			include("crypto/cryptojs-aes.php");		
			
			$crypttext = htmlentities(cryptoJsAesEncrypt($key_s_a_5, $data_return_str));
										
			$crypttext = urlencode($crypttext);				
				
			$return_data['encrypted_data'] = $crypttext;	
			
		
		}
	
	}	

}

echo json_encode($return_data);

?>