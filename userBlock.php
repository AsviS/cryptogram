<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

require_once(realpath(__DIR__) . '/utils.php');


//=========== time ================

$return_data['time_ok'] = -1;

$getInitLogin_time_max = 5;
$getInitLogin_time_ok = true;

if($_SESSION['userBlock.php'] > 0)
{
	//Мы уже стучались к этому файлу
	
	if(($_SESSION['userBlock.php'] + $getInitLogin_time_max) > time())
	{
		$getInitLogin_time_ok = false;
		
	}
		

}

$_SESSION['userBlock.php'] = time();

//=========== time ================

//http://a98867w4.bget.ru/all/s_radoid/crypto/userBlock.php?user_id=1&user_block_hash=de0ef5709973a51bfed618332db7aa04

$sid = session_id();//for php5	
$__session = $_SESSION;
session_write_close();

$user_id = $_GET['user_id'];
$user_block_hash = $_GET['user_block_hash'];

if($user_id > 0 && $user_block_hash !="" && $getInitLogin_time_ok)
{
	require_once(realpath(__DIR__) . '/db/db_connect.php');
	require_once(realpath(__DIR__) . '/db_utils.php');
		
	if($text)
	{		
		$select = 'select user_name from z_users where id="' . mysql_real_escape_string($user_id) . '" and user_block_hash="' . mysql_real_escape_string($user_block_hash) . '"';
		$text->my_sql_query = $select;
		$text->my_sql_execute();
		$res = mysql_fetch_object($text->my_sql_res);
		$user_name = $res->user_name;		
		
		if($user_name != "")
		{
			$text->my_sql_query="update z_users set block='1' where id = '" . mysql_real_escape_string($user_id) . "'";
			$text->my_sql_execute();
			
			echo 'Пользователь ' . $user_name . ' заблокирован';		
		
		}
	

	
	}
	


}

if(!$getInitLogin_time_ok)
{
	echo 'В целях безопасности последующее обращение к системе возможно через ' . $getInitLogin_time_max . ' секунд';

}


?>