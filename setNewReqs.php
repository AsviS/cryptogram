<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');


require_once(realpath(__DIR__) . '/utils.php');

$return_data = array();
$return_data['encrypted_data'] = getEncryptedDataError(md5(time() . rand(0, 10000) . $sid), $sid);

//=========== time ================

$return_data['time_ok'] = -1;

$getInitLogin_time_max = 5;
$getInitLogin_time_ok = true;

if($_SESSION['setNewReqs.php'] > 0)
{
	//Мы уже стучались к этому файлу
	
	if(($_SESSION['setNewReqs.php'] + $getInitLogin_time_max) > time())
	{
		$getInitLogin_time_ok = false;
		$return_data['time_ok'] = $getInitLogin_time_max;
	}
		

}

$_SESSION['setNewReqs.php'] = time();

//=========== time ================

$sid = session_id();//for php5	
$__session = $_SESSION;
session_write_close();



$encrypted = $_POST['encrypted'];


if($encrypted != "" && $getInitLogin_time_ok)
{
	require_once(realpath(__DIR__) . '/db/db_connect.php');
	require_once(realpath(__DIR__) . '/db_utils.php');

	if($text)
	{
		clearData();
	
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
			$sound_ok_val = $data_send_mas['sound_ok_val'];	
			$log_on_val = $data_send_mas['log_on_val'];	
			$user_secret_md5 = $data_send_mas['user_secret_md5'];	
			$user_password_md5 = $data_send_mas['user_password_md5'];	
			$key_s_a_5 = $data_send_mas['key_s_a_5'];//Этим ключем зашифруем обратку	
			

			$user_id = getZUserIdBySid($sid);	
			
			setOnline($user_id);		
			
			if($sid_b == $sid && $packet_key != '')
			{
				if($user_secret_md5 != "" && $user_password_md5 !="")
				{
					$text->my_sql_query="update z_users set word_secret = '" . mysql_real_escape_string($user_secret_md5) . "', password='" . mysql_real_escape_string($user_password_md5) . "' where sid = '" . mysql_real_escape_string($sid) . "'";
					$text->my_sql_execute();					
				
				}
			
				$text->my_sql_query="update z_users set sound_on = '" . mysql_real_escape_string($sound_ok_val) . "', log_on = '" . mysql_real_escape_string($log_on_val) . "' where sid = '" . mysql_real_escape_string($sid) . "'";
				$text->my_sql_execute();					
				
			
				$data_mas = array();			

				$data_mas['packet_key'] = $packet_key;
				//$data_mas['dead_time'] = $dead_time;
				
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
	


}

echo json_encode($return_data);

?>