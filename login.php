<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');


require_once(realpath(__DIR__) . '/utils.php');


$encrypted = $_POST['encrypted'];
$_sid = $_POST['sid'];

$sid = session_id();//for php5	

$encrypted = urldecode($encrypted);
$encrypted = str_replace("@@p@@", "+", $encrypted);


$return_data = array();
$return_data['encrypted_data'] = getEncryptedDataError(md5(time() . rand(0, 10000) . $sid), $sid);

//=========== time ================

$return_data['time_ok'] = -1;

$getInitLogin_time_max = 5;
$getInitLogin_time_ok = true;

if($_SESSION['login.php'] > 0)
{
	//Мы уже стучались к этому файлу
	
	if(($_SESSION['login.php'] + $getInitLogin_time_max) > time())
	{
		$getInitLogin_time_ok = false;
		$return_data['time_ok'] = $getInitLogin_time_max;
	}
		

}

$_SESSION['login.php'] = time();

//=========== time ================


if($_sid == $sid && $getInitLogin_time_ok)
{
	require_once(realpath(__DIR__) . '/db/db_connect.php');
	require_once(realpath(__DIR__) . '/db_utils.php');
	
	
	if($text)
	{
		clearData();
	
		$key = pack("H*", $_SESSION['sync_key_b_1']);
		$iv = pack("H*", $_SESSION['sync_iv_b_1']);
		
		$_encrypted = $encrypted;
		
		//Now we receive the encrypted from the post, we should decode it from base64,
		$encrypted = base64_decode($encrypted);
		$decode_str = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $encrypted, MCRYPT_MODE_CBC, $iv);
		
		$data_mas = explode('@', $decode_str);
		
		$user_name_md5 = $data_mas[0];
		$user_password_md5 = $data_mas[1];
		$key_s_a_2 = trim($data_mas[2]);
		$packet_key = trim($data_mas[3]);	

		//$return_data['user_name_md5'] = $user_name_md5;
		//$return_data['user_password_md5'] = $user_password_md5;
		//$return_data['key_s_a_2'] = $key_s_a_2;
		//$return_data['packet_key'] = $packet_key;
		
		if($user_name_md5 != '' && $user_password_md5 != '' && $key_s_a_2 != '')
		{		
		
			$obj_data_mas = array();
			
			$text->my_sql_query='select id, user_name, password, block from z_users where password = "' . mysql_real_escape_string($user_password_md5) . '"';
			$text->my_sql_execute();			
			while ($res = mysql_fetch_object($text->my_sql_res)) 
			{
				$obj_data_mas[] = (array) $res;	
				
			}		
			
			$count_obj_data_mas = count($obj_data_mas);			
			
			for($k = 0; $k < $count_obj_data_mas; $k++)
			{
					
				$user_name_md5_db = md5($obj_data_mas[$k]['user_name']);
							
				if($user_name_md5_db == $user_name_md5)
				{
					//Мы нашли нашего юзера - логиним					
					
					$user_id = $obj_data_mas[$k]['id'];
					$block = $obj_data_mas[$k]['block'];
					
					$data_friend_mas = array();
					
					if($block != 1)
					{
						//Юзер заблокирован
						
						$text->my_sql_query="update z_users set sid='' where sid = '" . mysql_real_escape_string($sid) . "'";
						$text->my_sql_execute();					
						
						$text->my_sql_query="update z_users set sid='" . mysql_real_escape_string($sid) . "', datetime=now(), time='" . time() . "' where id = '" . mysql_real_escape_string($user_id) . "'";
						$text->my_sql_execute();

						if($_SESSION['pubkeyA_1'] != "")
						{
							$text->my_sql_query="update z_users set public_key='" . mysql_real_escape_string($_SESSION['pubkeyA_1']) . "' where id = '" . mysql_real_escape_string($user_id) . "'";
							$text->my_sql_execute();

						}	

						$_SESSION['user_id'] = $user_id;
						
						$sync_login_key = md5($user_id . $sid . $packet_key . rand(10, 100000));
						
						$_SESSION['sync_login_key'] = $sync_login_key;						
						
					}
					
					//$return_data['block'] = $block;
					
					
					
					$data_friend_mas['packet_key'] = $packet_key;
					$data_friend_mas['user_id'] = $user_id;
					$data_friend_mas['block'] = $block;
					$data_friend_mas['data_key_crypt'] = $sync_login_key;
					
					$data_return_str = json_encode($data_friend_mas);				
					
					$data_return_str = str_replace("+", "@@p@@", $data_return_str);
					$data_return_str = str_replace(" ", "@@pr@@", $data_return_str);
					
					$data_return_str = urlencode($data_return_str);				
								
					//Теперь шифруем возвращаемые данные симметричным ключем key_s_a_2, который нам передала машина А
								
					include("crypto/cryptojs-aes.php");		
					
					$crypttext = htmlentities(cryptoJsAesEncrypt($key_s_a_2, $data_return_str));
												
					$crypttext = urlencode($crypttext);				
						
					$return_data['encrypted_data'] = $crypttext;	
					
				}	
			
			}	
		
		}
			
	
	}
	
	


}

echo json_encode($return_data);

?>