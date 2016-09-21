<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

require_once(realpath(__DIR__) . '/db/db_connect.php');
require_once(realpath(__DIR__) . '/utils.php');

$sid = session_id();//for php5	
$__session = $_SESSION;
session_write_close();

$packet_key = $_POST['packet_key'];//7a400526b9957d752de4e5b0dda82a5f
$encrypted = $_POST['encrypted'];
$_sid = $_POST['sid'];

$encrypted = urldecode($encrypted);
$encrypted = str_replace("@@p@@", "+", $encrypted);



$return_data = array();
$return_data['encrypted_data'] = getEncryptedDataError($packet_key, $sid);

require_once(realpath(__DIR__) . '/db_utils.php');

if($text && $_sid == $sid)
{
	
	$key = pack("H*", $__session['sync_key_b_2']);
	$iv = pack("H*", $__session['sync_iv_b_2']);
	
	$_encrypted = $encrypted;
	
	//Now we receive the encrypted from the post, we should decode it from base64,
	$encrypted = base64_decode($encrypted);
	$decode_str = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $encrypted, MCRYPT_MODE_CBC, $iv);
	
	$data_mas = explode('@', $decode_str);
	
	$user_name = $data_mas[0];
	$word_secret_md5 = $data_mas[1];
	$user_password_md5 = $data_mas[2];
	$key_s_a_2 = trim($data_mas[3]);

	
	if($user_name != '' && $word_secret_md5 != "" && $user_password_md5 != '' && $key_s_a_2 != '')
	{		
	
		$obj_data_mas = array();
		
		$text->my_sql_query='select id, user_name, word_secret from z_users';
		$text->my_sql_execute();			
		while ($res = mysql_fetch_object($text->my_sql_res)) 
		{
			$obj_data_mas[] = (array) $res;	
			
		}		
		
		$count_obj_data_mas = count($obj_data_mas);			
		
		$user_isset = false;
		
		for($k = 0; $k < $count_obj_data_mas; $k++)
		{						
			if($user_name == $obj_data_mas[$k]['user_name'])
			{
				//Мы нашли нашего юзера	
				
				$user_isset = true;
				
			}

		}		

		if($user_isset)
			$state = 'isset';
		else
		{
			$state = 'not_isset';
		
			
			//Логиним юзера
			
			$text->my_sql_query="update z_users set sid='' where sid = '" . mysql_real_escape_string($sid) . "'";
			$text->my_sql_execute();			
			
			$user_block_hash = md5(time() . rand(0, 10000) . $sid);
			
			$query_insert = "";
			$query_insert .= "insert into z_users ";
			$query_insert .= "(user_name, word_secret, password, sid, user_block_hash, datetime, time) values ";
			$query_insert .= "('" . mysql_real_escape_string($user_name) . "', '" . mysql_real_escape_string($word_secret_md5) . "', '" . mysql_real_escape_string($user_password_md5) . "', '" . mysql_real_escape_string($sid) . "', '" . mysql_real_escape_string($user_block_hash) . "', now(), '" . mysql_real_escape_string(time()) . "');";	
			
			$text->my_sql_query = $query_insert;
			$text->my_sql_execute();	

			$insert_id = $text->my_sql_insert_id();		
			
			if($insert_id > 0)
			{
				$state = 'reg';			
				
			
			}		


		}	
		
		$data_return = $state . "@@@" . $packet_key;
		
		$data_return = str_replace("+", "@@p@@", $data_return);
		$data_return = str_replace(" ", "@@pr@@", $data_return);
		
		$data_return = urlencode($data_return);	
		
		$data_return_str = htmlspecialchars($data_return);//Данные, которые мы вернем после логина (список друзей)

		//Теперь шифруем возвращаемые данные симметричным ключем key_s_a_2, который нам передала машина А
		
		include("crypto/cryptojs-aes.php");		
		
		$crypttext = htmlentities(cryptoJsAesEncrypt($key_s_a_2, $data_return_str));
									
		$crypttext = urlencode($crypttext);				
			
		$return_data['encrypted_data'] = $crypttext;			


	
	}
	

}

echo json_encode($return_data);

?>