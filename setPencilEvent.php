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
	$encrypted = str_replace("@@pr@@", " ", $encrypted);

	
	$key = pack("H*", $__session['sync_login_key']);
	$iv = pack("H*", $sid);
	
	//Now we receive the encrypted from the post, we should decode it from base64,
	$encrypted = base64_decode($encrypted);
	$decode_str = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $encrypted, MCRYPT_MODE_CBC, $iv);
	

	
	$data_mas = explode('@', $decode_str);
	
	$data_send_str = $data_mas[0];
	
	$data_send_str = urldecode($data_send_str);
	$data_send_str = str_replace("@@p@@", "+", $data_send_str);	
	$data_send_str = str_replace("@@pr@@", " ", $data_send_str);
	
	if($data_send_str != "")
	{	
			
		//$return_data['data_send_str'] = $data_send_str;		
			
		$data_send_mas = json_decode($data_send_str, true);
	
		$sid_b = $data_send_mas['sid'];		
		$packet_key = $data_send_mas['packet_key'];	
		$user_to_id = $data_send_mas['user_id_act'];	

		$user_id = getZUserIdBySid($sid);	
		

		
		if($sid_b == $sid && $user_id > 0 && $packet_key != "" && $user_to_id > 0)
		{			
			$text->my_sql_query="update z_user_friends set pencil='" . time() . "' where user_id='" . mysql_real_escape_string($user_to_id) . "' and user_ch_id = '" . mysql_real_escape_string($user_id) . "'";
			$text->my_sql_execute();
			
		
		}
	
	}	
	
	

}

echo json_encode($return_data);

?>