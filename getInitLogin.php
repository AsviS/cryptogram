<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

require_once(realpath(__DIR__) . '/utils.php');

$sid = session_id();//for php5	

$packet_key = $_POST['packet_key'];//7a400526b9957d752de4e5b0dda82a5f
$pubkeyA_1 = $_POST['pubkeyA_1'];
$user_name_md5 = $_POST['user_name_md5'];
$user_secret_md5 = $_POST['user_secret_md5'];
$_sid = $_POST['sid'];


$pubkeyA_1 = urldecode($pubkeyA_1);
$pubkeyA_1 = str_replace("@@p@@", "+", $pubkeyA_1);
$pubkeyA_1 = str_replace("@@pr@@", " ", $pubkeyA_1);

$return_data = array();
$return_data['encrypted_data'] = getEncryptedDataError($packet_key, $sid);

//=========== time ================

$return_data['time_ok'] = -1;

$getInitLogin_time_max = 5;
$getInitLogin_time_ok = true;

if($_SESSION['getInitLogin.php'] > 0)
{
	//Мы уже стучались к этому файлу
	
	if(($_SESSION['getInitLogin.php'] + $getInitLogin_time_max) > time())
	{
		$getInitLogin_time_ok = false;
		$return_data['time_ok'] = $getInitLogin_time_max;
	}
		

}

$_SESSION['getInitLogin.php'] = time();

//=========== time ================

if($_sid == $sid && $getInitLogin_time_ok)
{
	//Легкая проверка на sid пройдена
	
	require_once(realpath(__DIR__) . '/db/db_connect.php');
	require_once(realpath(__DIR__) . '/db_utils.php');

	if($text)
	{
		//Получаем секретное слово юзера по md5 его имени
		
		$obj_data_mas = array();
		
		$text->my_sql_query='select id, user_name, word_secret from z_users';
		$text->my_sql_execute();			
		while ($res = mysql_fetch_object($text->my_sql_res)) 
		{
			$obj_data_mas[] = (array) $res;	
			
		}		
		
		$count_obj_data_mas = count($obj_data_mas);			
		
		for($k = 0; $k < $count_obj_data_mas; $k++)
		{	
		
			$user_name_md5_db = md5($obj_data_mas[$k]['user_name']);
			$word_secret_md5_db = $obj_data_mas[$k]['word_secret'];
						
			if($user_name_md5_db == $user_name_md5 && $word_secret_md5_db == $user_secret_md5)
			{
				//Мы нашли нашего юзера	
				
				$key = md5($packet_key . rand(0, 10000) . $sid . $packet_key);
				$iv =  $sid;
				
				$_SESSION['sync_key_b_1'] = $key;
				$_SESSION['sync_iv_b_1'] = $iv;
				
				$data_for_crypt_str = $packet_key . '@@Connect@@' . $key;
				
				//Шифруем данные		
				
				$_SESSION['pubkeyA_1'] = $pubkeyA_1;
				
				$pk  = openssl_get_publickey($pubkeyA_1);
				openssl_public_encrypt($data_for_crypt_str, $encrypted, $pk);
				$data_key_crypt = chunk_split(base64_encode($encrypted));					

				$data_key_crypt = str_replace("+", "@@p@@", $data_key_crypt);
				
				$encrypted_data_urlencode = urlencode($data_key_crypt);
				
				$return_data['encrypted_data'] = $encrypted_data_urlencode;			
							
				
			}	
		
		}

	
	
	}
	
	
	

}

echo json_encode($return_data);

?>