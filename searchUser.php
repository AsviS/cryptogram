<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

require_once(realpath(__DIR__) . '/db/db_connect.php');
require_once(realpath(__DIR__) . '/utils.php');
require_once(realpath(__DIR__) . '/db_utils.php');

$sid = session_id();//for php5	
$__session = $_SESSION;
session_write_close();


$search_val_md5 = $_POST['search_val_md5'];
$_sid = $_POST['sid'];

$user_id = getZUserIdBySid($sid);

$return_data = array();
$return_data['sid'] = 'error';

$users = array();

$return_data['users'] = $users;



if($text && $_sid == $sid && $search_val_md5 != "")
{
	$return_data['sid'] = $sid;
	
	$obj_data_mas = array();
	
	$text->my_sql_query='select id, user_name from z_users where 1';
	$text->my_sql_execute();			
	while ($res = mysql_fetch_object($text->my_sql_res)) 
	{
		$obj_data_mas[] = (array) $res;	
		
	}	

	$count_obj_data_mas = count($obj_data_mas);	
	
	for($k = 0; $k < $count_obj_data_mas; $k++)
	{
		$user_name_md5_db = md5($obj_data_mas[$k]['user_name']);
					
		if($user_name_md5_db == $search_val_md5)
		{
			$is_friend = 0;
			
			if($user_id > 0)
			{
				$link_id = getZLinkIdByUsers($user_id, $obj_data_mas[$k]['id']);
				
				if($link_id > 0)
				{
					//Связь есть - чел нам или друг или в черном списке
					
					$is_friend = 1;
					
				}
			
			}
			else
				$is_friend = 3;
		
			$add = $obj_data_mas[$k];
			$add['is_friend'] = $is_friend;
		
			$users[] = $add;
		}	
			
	}
	
	$return_data['users'] = $users;
	//$return_data['user_id'] = $user_id;

}

echo json_encode($return_data);

?>