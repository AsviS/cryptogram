<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

require_once(realpath(__DIR__) . '/db/db_connect.php');
require_once(realpath(__DIR__) . '/utils.php');
require_once(realpath(__DIR__) . '/db_utils.php');

$sid = session_id();//for php5	
$__session = $_SESSION;
session_write_close();

clearData();

$encrypted = $_POST['encrypted'];

$return_data = array();
$return_data['encrypted_data'] = getEncryptedDataError(md5(time() . rand(0, 10000) . $sid), $sid);



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
		$crypto_line = $data_send_mas['crypto_line'];	//Тип шифрования, которым мы будем передавать сообщение		
		$key_s_a_72 = $data_send_mas['key_s_a_72'];//Этим ключем зашифруем обратку
		$to_user = $data_send_mas['to_user'];	
		$type_send = $data_send_mas['type_send'];
		$count_atoms = $data_send_mas['count_atoms'];
		
		
		$encrypt_sync_key_by_public_key_data = "";
		$dead_time = "";
		
		if($crypto_line == 1)
		{
			$encrypt_sync_key_by_public_key_data = $data_send_mas['encrypt_sync_key_by_public_key_data'];	
			$dead_time = $data_send_mas['dead_time'];
		}
			
		
		$user_id = getZUserIdBySid($sid);	
		
		setOnline($user_id);
		
		$link_id = getZLinkIdByUsers($user_id, $to_user);
		
		if($sid_b == $sid && $packet_key != '' && $to_user > 0 && $link_id > 0)
		{
			//Достали данные из под синхронного ключа
			//Добавим в други если юзер есть и мы для него не заблочены.. заблоченность потом проветим
						
			$query_insert = "";
			$query_insert .= "insert into z_msgs ";
			$query_insert .= "(packet_key, user_from, user_to, encrypt_sync_key_data, type_send, count_atoms, datetime, time, dead_time, crypto_line) values ";
			$query_insert .= "('" . mysql_real_escape_string($packet_key) . "', '" . mysql_real_escape_string($user_id) . "', '" . mysql_real_escape_string($to_user) . "', '" . mysql_real_escape_string($encrypt_sync_key_by_public_key_data) . "', '" . mysql_real_escape_string($type_send) . "', '" . mysql_real_escape_string($count_atoms) . "', now(), '" . mysql_real_escape_string(time()) . "', '" . mysql_real_escape_string($dead_time) . "', '" . mysql_real_escape_string($crypto_line) . "');";	
			
			$text->my_sql_query = $query_insert;
			$text->my_sql_execute();	

			$insert_id = $text->my_sql_insert_id();		
			
			if($insert_id > 0)
			{
				$data_mas = array();			

				$data_mas['packet_key'] = $packet_key;
				//$data_mas['dead_time'] = $dead_time;
				
				$data_return_str = json_encode($data_mas);				
				
				$data_return_str = str_replace("+", "@@p@@", $data_return_str);
				$data_return_str = str_replace(" ", "@@pr@@", $data_return_str);
				
				$data_return_str = urlencode($data_return_str);				
							
				//Теперь шифруем возвращаемые данные симметричным ключем key_s_a_72, который нам передала машина А
							
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