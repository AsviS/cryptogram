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
		$key_s_a_5 = $data_send_mas['key_s_a_5'];//Этим ключем зашифруем обратку
		
		$packet_key_msg = $data_send_mas['packet_key_msg'];	
		$number_atom = $data_send_mas['number_atom'];		
		$count_atoms = $data_send_mas['count_atoms'];		
		$to_user = $data_send_mas['to_user'];		
		$data_atom_encoding = $data_send_mas['data_atom_encoding'];	
		$crypto_line_int = $data_send_mas['crypto_line_int'];	//Сквозным ли шифруем или нет
		
		
		$user_id = getZUserIdBySid($sid);	
		
		setOnline($user_id);
		
		if($sid_b == $sid && $user_id > 0 && $packet_key_msg != "")
		{
			//Достали данные из под синхронного ключа
			//Добавим в други если юзер есть и мы для него не заблочены.. заблоченность потом проветим
			
			$parent_msg_id = getIdMsgByPacketKey($packet_key_msg);
			
			if($parent_msg_id > 0)
			{
				$query_insert = "";
				$query_insert .= "insert into z_atoms ";
				$query_insert .= "(parent_msg_id, datetime, time, body, number_atom) values ";
				$query_insert .= "('" . mysql_real_escape_string($parent_msg_id) . "', now(), '" . time() . "', '" . mysql_real_escape_string($data_atom_encoding) . "', '" . mysql_real_escape_string($number_atom) . "');";	
				
				$text->my_sql_query = $query_insert;
				$text->my_sql_execute();	

				$insert_id = $text->my_sql_insert_id();		
				
				if($insert_id > 0)
				{
					$data_mas = array();					

					$data_mas['packet_key'] = $packet_key;
					
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

}

echo json_encode($return_data);

?>