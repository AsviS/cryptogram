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
		$msg_packet_key = $data_send_mas['msg_packet_key'];	
		$user_from_id = $data_send_mas['user_from_id'];	
		$msg_set_status = $data_send_mas['status'];	
		$key_s_a_5 = $data_send_mas['key_s_a_5'];//Этим ключем зашифруем обратку

		$user_id = getZUserIdBySid($sid);	
		
		setOnline($user_id);			

		
		if($sid_b == $sid && $user_id > 0 && $packet_key != "" && $msg_packet_key != "")
		{
			
		
			//Достали данные из под синхронного ключа
			
			if($msg_set_status == 'meta_load')
			{
				//meta данные сообщения получены юзером. Он получил синхронный ключ, которым мы будем отправлять сообшение.. он готов к приему атомов
			
				$text->my_sql_query="update z_msgs set status='2' where packet_key='" . mysql_real_escape_string($msg_packet_key) . "' and user_from = '" . mysql_real_escape_string($user_from_id) . "'";
				$text->my_sql_execute();				
			
			}
			
			if($msg_set_status == 'to_look_1')
			{
				//Сообщение доставлено.. прочитанность отдельно дойдет
				//А может мы уже пометили как прочитанно7 - если да - то не будем помечать доставленность
			
				$select = "select status from z_msgs where packet_key='" . mysql_real_escape_string($msg_packet_key) . "' and user_from = '" . mysql_real_escape_string($user_from_id) . "'";
				$text->my_sql_query = $select;
				$text->my_sql_execute();
				$res = mysql_fetch_object($text->my_sql_res);
				$status = $res->status;				
			
				if($status >= 4)
				{
					//Ничего не делаем - у нас постстатус уже есть.. или 5 (прочитано) или еще какой.. может ошибки или еще что
				
				}
				else
				{
					$text->my_sql_query="update z_msgs set status='4' where packet_key='" . mysql_real_escape_string($msg_packet_key) . "' and user_from = '" . mysql_real_escape_string($user_from_id) . "'";
					$text->my_sql_execute();					
				
				}
			
			
			
			}			
			
			if($msg_set_status == 'to_look_2')
			{
				//Сообщение не просто доставлено.. оно еще и прочитано				
			
				$text->my_sql_query="update z_msgs set status='6' where packet_key='" . mysql_real_escape_string($msg_packet_key) . "' and user_from = '" . mysql_real_escape_string($user_from_id) . "'";
				$text->my_sql_execute();
			
			
			}					
			
			if($msg_set_status == 'to_look_3')
			{
				//прочитано				
			
				$text->my_sql_query="update z_msgs set status='7' where packet_key='" . mysql_real_escape_string($msg_packet_key) . "' and user_from = '" . mysql_real_escape_string($user_from_id) . "'";
				$text->my_sql_execute();
			
			
			}				
		
			$data_mas = array();
			

			$data_mas['packet_key'] = $packet_key;
			$data_mas['msg_packet_key'] = $msg_packet_key;
			
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