<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

require_once(realpath(__DIR__) . '/db/db_connect.php');

$_sid = $_POST['sid'];

$sid = session_id();//for php5	



if($text && $_sid == $sid)
{
	$text->my_sql_query="update z_users set sid='', public_key='', time=0, datetime='now()' where sid = '" . mysql_real_escape_string($sid) . "'";
	$text->my_sql_execute();	

	$_SESSION['user_id'] = '';
	$_SESSION['pubkeyA_1'] = '';
	$_SESSION['sync_login_key'] = '';
	$_SESSION['sync_key_b_1'] = '';
	$_SESSION['sync_iv_b_1'] = '';
	
	
	
}
	
	

session_write_close();	

?>