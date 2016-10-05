<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

require_once(realpath(__DIR__) . '/db/db_connect.php');
require_once(realpath(__DIR__) . '/utils.php');

$sid = session_id();//for php5	

$packet_key = $_POST['packet_key'];
$pubkeyA_2 = $_POST['pubkeyA_2'];
$user_name_md5 = $_POST['user_name_md5'];
$word_secret_md5 = $_POST['word_secret_md5'];
$user_password_md5 = $_POST['user_password_md5'];
$_sid = $_POST['sid'];

$pubkeyA_2 = urldecode($pubkeyA_2);
$pubkeyA_2 = str_replace("@@p@@", "+", $pubkeyA_2);
$pubkeyA_2 = str_replace("@@pr@@", " ", $pubkeyA_2);

$return_data = array();
$return_data['encrypted_data'] = getEncryptedDataError($packet_key, $sid);

require_once(realpath(__DIR__) . '/db_utils.php');

if($text && $_sid == $sid && $user_name_md5 != "" && $word_secret_md5 != "")
{
	//Легкая проверка на sid пройдена
	
	$obj_data_mas = array();
	
	$text->my_sql_query='select id, user_name from z_users';
	$text->my_sql_execute();			
	while ($res = mysql_fetch_object($text->my_sql_res)) 
	{
		$obj_data_mas[] = (array) $res;	
		
	}		
	
	$count_obj_data_mas = count($obj_data_mas);			
	
	$user_isset = false;
	
	for($k = 0; $k < $count_obj_data_mas; $k++)
	{						
		if($user_name_md5 == md5($obj_data_mas[$k]['user_name']))
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

	}	
	
	$key = md5($packet_key . rand(0, 10000) . $sid . $packet_key);
	$iv =  $sid;
	
	$_SESSION['sync_key_b_2'] = $key;
	$_SESSION['sync_iv_b_2'] = $iv;
	
	$data_for_crypt_str = $packet_key . '@@' . $state . '@@' . $key;	
	
	
	//Шифруем данные		
			
	$pk  = openssl_get_publickey($pubkeyA_2);
	openssl_public_encrypt($data_for_crypt_str, $encrypted, $pk);
	$data_key_crypt = chunk_split(base64_encode($encrypted));					

	$data_key_crypt = str_replace("+", "@@p@@", $data_key_crypt);
	
	$encrypted_data_urlencode = urlencode($data_key_crypt);
	
	$return_data['encrypted_data'] = $encrypted_data_urlencode;			
	
}

echo json_encode($return_data);

?>