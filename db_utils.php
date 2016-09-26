<?php


function getPencilMas($user_id)
{
	global $text;
	
	$obj_data_mas = array();
	
	$time = time();

	$time_pencil_min = $time - 10;//10 секунд назад - уже устаревший карандаш - трем
	
	$text->my_sql_query="update z_user_friends set pencil='0' where pencil<'" . mysql_real_escape_string($time_pencil_min) . "'";
	$text->my_sql_execute();
	
	//Остальные выгружаем
	
	$select = 'select user_ch_id as user_id from z_user_friends where pencil > 0 and block != "1" and user_id="' . mysql_real_escape_string($user_id) . '" order by id desc';
	$text->my_sql_query = $select;
	$text->my_sql_execute();			
	while ($res = mysql_fetch_object($text->my_sql_res)) 
	{
		$obj_data_mas[] = (array) $res;	
		
	}	
	
	return $obj_data_mas;
	
}

function getLogByUserId($user_id)
{
	global $text;
	
	$select = 'select log_on from z_users where id="' . mysql_real_escape_string($user_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	return $res->log_on;		
	

}

function getSoundByUserId($user_id)
{
	global $text;
	
	$select = 'select sound_on from z_users where id="' . mysql_real_escape_string($user_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	return $res->sound_on;		
	

}

function getBlockLinkByUserId($user_id)
{
	global $text;
	
	$select = 'select user_block_hash from z_users where id="' . mysql_real_escape_string($user_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	$user_block_hash = $res->user_block_hash;			
	
	
	return 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/userBlock.php?user_id=' . $user_id . '&user_block_hash=' . $user_block_hash;

}

function getUserNotCryptoLineData($user_id, $get_user_id, $from = 0, $count = 10)
{
	global $text;
	
	$obj_data_mas = array();
	$return_mas = array();
	
	if($user_id > 0 && $get_user_id > 0)
	{
		$select = 'select id, packet_key, time, count_atoms, status, type_send, user_from, user_to from z_msgs where crypto_line = "0" and status >= 0 and user_from="' . mysql_real_escape_string($user_id) . '" and user_to="' . mysql_real_escape_string($get_user_id) . '" order by id desc';
		$text->my_sql_query = $select;
		$text->my_sql_execute();			
		while ($res = mysql_fetch_object($text->my_sql_res)) 
		{
			$obj_data_mas[] = (array) $res;	
			
		}	
		
		$select = 'select id, packet_key, time, count_atoms, status, type_send, user_from, user_to from z_msgs where crypto_line = "0" and status >= 1 and user_from="' . mysql_real_escape_string($get_user_id) . '" and user_to="' . mysql_real_escape_string($user_id) . '" order by id desc';
		$text->my_sql_query = $select;
		$text->my_sql_execute();			
		while ($res = mysql_fetch_object($text->my_sql_res)) 
		{
			$obj_data_mas[] = (array) $res;	
			
		}			
		
		$count_obj_data_mas = count($obj_data_mas);		
		
		for($k = 0; $k < $count_obj_data_mas; $k++)
		{
			//Получаем атомы
			
			$atoms_mas = array();
			
			$select = 'select * from z_atoms where parent_msg_id="' . mysql_real_escape_string($obj_data_mas[$k]['id']) . '" order by number_atom';
			$text->my_sql_query = $select;
			$text->my_sql_execute();			
			while ($res = mysql_fetch_object($text->my_sql_res)) 
			{
				$atoms_mas[] = (array) $res;	
			}	

			
			$obj_data_mas[$k]['atoms_mas'] = $atoms_mas;	

			$sync_key = getEasySincKey($obj_data_mas[$k]['user_from'], $obj_data_mas[$k]['user_to']);
			
			$obj_data_mas[$k]['sync_key'] = $sync_key;	
			
		}		
	
	}
	
	//$obj_data_mas['user_id'] = $user_id;
	//$obj_data_mas['get_user_id'] = $get_user_id;
	
	return $obj_data_mas;

}

function getListEventsAddToFriend($user_id)
{
	global $text;
	
	$return_mas = array();
	$obj_data_mas = array();
	
	//У кого мы в подписке, но не прочитано еще
	
	$select = 'select user_id from z_user_friends where block != "1" and look="0" and user_ch_id="' . mysql_real_escape_string($user_id) . '" order by id desc';
	$text->my_sql_query = $select;
	$text->my_sql_execute();			
	while ($res = mysql_fetch_object($text->my_sql_res)) 
	{
		$obj_data_mas[] = (array) $res;	
		
	}	
	
	$count_obj_data_mas = count($obj_data_mas);
	
	//Теперь смотрим есть ли юзер у нас
	
	for($k = 0; $k < $count_obj_data_mas; $k++)
	{	
		
		$select = 'select id from z_user_friends where block !="1" and user_id="' . mysql_real_escape_string($user_id) . '" and user_ch_id="' . mysql_real_escape_string($obj_data_mas[$k]['user_id']) . '"';
		$text->my_sql_query = $select;
		$text->my_sql_execute();
		$res = mysql_fetch_object($text->my_sql_res);
		$id = $res->id;		

		if($id > 0)
		{
		
		}
		else
		{
			$obj_data_mas[$k]['name'] = getUserNameById($obj_data_mas[$k]['user_id']);
			$obj_data_mas[$k]['online'] = getUserOnlineById($obj_data_mas[$k]['user_id']);	
		
			$return_mas[] = $obj_data_mas[$k];
		
		}
		
			
		
		
	
	}
	
	return $return_mas;
}

function getAbout($user_id, $about_number)
{
	global $text;
	
	if($about_number > 0)
	{
		$field_name = 'about_' . $about_number;
	
		$select = 'select about_' . $about_number . ' as about from z_users where id = "' . mysql_real_escape_string($user_id) . '"';
		$text->my_sql_query = $select;
		$text->my_sql_execute();
		$res = mysql_fetch_object($text->my_sql_res);
		$about = $res->about;		
	
		if($about == 0)
		{
			
			$text->my_sql_query="update z_users set about_" . $about_number . "='1' where id = '" . mysql_real_escape_string($user_id) . "'";
			$text->my_sql_execute();				
			
			return 'need';
		}
	}
	
	

}

function clearData()
{
	global $text;
	
	$time = time();
	
	$obj_data_mas = array();
	
	$select = 'select id from z_msgs where crypto_line = "1" and dead_time < "' . mysql_real_escape_string($time) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();			
	while ($res = mysql_fetch_object($text->my_sql_res)) 
	{
		$obj_data_mas[] = (array) $res;	
		
	}	
	
	$count_obj_data_mas = count($obj_data_mas);
	
	//Не удаляем, а ситаем.. чтобы остался каркас.
	//Просто если сообщение удалить - то его статус потом не поменять (например на прочитанный).
	
	for($k = 0; $k < $count_obj_data_mas; $k++)
	{
	
		$text->my_sql_query="update z_atoms set body='' where parent_msg_id = '" . mysql_real_escape_string($obj_data_mas[$k]['id']) . "'";
		$text->my_sql_execute();	

		$text->my_sql_query="update z_msgs set encrypt_sync_key_data='' where id = '" . mysql_real_escape_string($obj_data_mas[$k]['id']) . "'";
		$text->my_sql_execute();	


		
	}	
	
	
	

	

}

function setAtomStatus($atom_id, $status = 0)
{
	global $text;

	$text->my_sql_query="update z_atoms set status='" . mysql_real_escape_string($status) . "' where id = '" . mysql_real_escape_string($atom_id) . "'";
	$text->my_sql_execute();		
	
}

function getAtomsFreeByMsgId($msg_id, $count_atoms = 1)
{
	global $text;

	$obj_data_mas = array();
	
	$select = 'select * from z_atoms where status = "0" and parent_msg_id="' . mysql_real_escape_string($msg_id) . '" LIMIT 0,' . $count_atoms;
	$text->my_sql_query = $select;
	$text->my_sql_execute();			
	while ($res = mysql_fetch_object($text->my_sql_res)) 
	{
		$obj_data_mas[] = (array) $res;	
		
	}	

	return $obj_data_mas;
}

function getMessages($user_id, $status = 0, $status_next = 1, $user_to = 1)
{
	global $text;
	
	if($user_to == 1)
		$user_act = 'user_to';
	else
		$user_act = 'user_from';

	$obj_data_mas = array();
	
	$select = 'select * from z_msgs where status = "' . mysql_real_escape_string($status) . '" and ' . $user_act . '="' . mysql_real_escape_string($user_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();			
	while ($res = mysql_fetch_object($text->my_sql_res)) 
	{
		$obj_data_mas[] = (array) $res;	
		
	}	
	
	$text->my_sql_query="update z_msgs set status='" . mysql_real_escape_string($status_next) . "' where status = '" . mysql_real_escape_string($status) . "' and " . $user_act . " = '" . mysql_real_escape_string($user_id) . "'";
	$text->my_sql_execute();		

	return $obj_data_mas;	
	
}

function getIdMsgByPacketKey($packet_key)
{
	global $text;
	
	$select = 'select id from z_msgs where packet_key="' . mysql_real_escape_string($packet_key) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	return $res->id;	

}

function getEasySincKey($from_user, $to_user)
{
	global $text;
	
	$select = 'select password from z_users where id="' . mysql_real_escape_string($from_user) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	$password_from = $res->password;	

	$select = 'select password from z_users where id="' . mysql_real_escape_string($to_user) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	$password_to = $res->password;		

	return md5($password_from . $password_to);
	
	
}

function getPublicKey($user_id)
{
	global $text;
	
	$select = 'select public_key from z_users where id="' . mysql_real_escape_string($user_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	return $res->public_key;	

}

function getBlockByLinkId($id)
{
	global $text;
	
	$select = 'select block from z_user_friends where id="' . mysql_real_escape_string($id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	return $res->block;	
	
}

function setOnline($user_id)
{
	global $text;
	
	$text->my_sql_query="update z_users set datetime=now(), time='" . time() . "' where id = '" . mysql_real_escape_string($user_id) . "'";
	$text->my_sql_execute();		

}

function getSessionByUserId($user_id)
{
	global $text;
	
	$select = 'select sid from z_users where id="' . mysql_real_escape_string($user_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	return $res->sid;		

}

function getUserOnlineById($user_id)
{
	global $text;
	
	$time = time();

	$time_dead = $time - 60 * 2;//Все кто активен был ранее 2-х минут - в online
	
	$select = 'select time as _time, sid from z_users where id="' . mysql_real_escape_string($user_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	$_time = $res->_time;
	$sid = $res->sid;
	
	if($sid != "")
	{
		if($_time < $time_dead)
			return 0;
		else 
			return 1;			
	
	}
	else
		return 0;
	

	
	
}


function getListNotFriendsByUserId($user_id, $not_look = 'all')
{
	global $text;
	
	$obj_data_mas = array();
	$return_mas = array();
	
	//Список юзеров, у кого мы в подписоне
	
	$look_str = '';
	
	if($not_look == 'not_look')
		$look_str = ' look="0" and ';
	
	$select = 'select user_id from z_user_friends where ' . $look_str . ' block != "1" and user_ch_id="' . mysql_real_escape_string($user_id) . '" order by id desc';
	$text->my_sql_query = $select;
	$text->my_sql_execute();			
	while ($res = mysql_fetch_object($text->my_sql_res)) 
	{
		$obj_data_mas[] = (array) $res;	
		
	}	
	
	if($not_look == 'not_look')
	{
		$text->my_sql_query="update z_user_friends set look='1' where user_ch_id = '" . mysql_real_escape_string($user_id) . "'";
		$text->my_sql_execute();		
	
	}
	
	
	
	$count_obj_data_mas = count($obj_data_mas);
	
	//Теперь смотрим есть ли юзер у нас
	
	for($k = 0; $k < $count_obj_data_mas; $k++)
	{	
		
		$select = 'select id from z_user_friends where block !="1" and user_id="' . mysql_real_escape_string($user_id) . '" and user_ch_id="' . mysql_real_escape_string($obj_data_mas[$k]['user_id']) . '"';
		$text->my_sql_query = $select;
		$text->my_sql_execute();
		$res = mysql_fetch_object($text->my_sql_res);
		$id = $res->id;		

		if($id > 0)
		{
		
		}
		else
		{
			$obj_data_mas[$k]['name'] = getUserNameById($obj_data_mas[$k]['user_id']);
			$obj_data_mas[$k]['online'] = getUserOnlineById($obj_data_mas[$k]['user_id']);	
		
			$return_mas[] = $obj_data_mas[$k];
		
		}
		
			
		
		
	
	}

	return $return_mas;
}


function getListFriendsByUserId($user_id)
{
	global $text;
	
	$obj_data_mas = array();
	
	$select = 'select user_ch_id as user_id from z_user_friends where block != "1" and user_id="' . mysql_real_escape_string($user_id) . '" order by id desc';
	$text->my_sql_query = $select;
	$text->my_sql_execute();			
	while ($res = mysql_fetch_object($text->my_sql_res)) 
	{
		$obj_data_mas[] = (array) $res;	
		
	}	
	
	$count_obj_data_mas = count($obj_data_mas);
	
	for($k = 0; $k < $count_obj_data_mas; $k++)
	{
		$obj_data_mas[$k]['name'] = getUserNameById($obj_data_mas[$k]['user_id']);
		$obj_data_mas[$k]['online'] = getUserOnlineById($obj_data_mas[$k]['user_id']);
		
		$obj_data_mas[$k]['in_friend'] = 0;
		
		$select = 'select id from z_user_friends where block !="1" and user_id="' . mysql_real_escape_string($obj_data_mas[$k]['user_id']) . '" and user_ch_id="' . mysql_real_escape_string($user_id) . '"';
		$text->my_sql_query = $select;
		$text->my_sql_execute();
		$res = mysql_fetch_object($text->my_sql_res);
		$id = $res->id;		

		if($id > 0)
			$obj_data_mas[$k]['in_friend'] = 1;
		
		
	
	}

	return $obj_data_mas;
}

function getUserNameById($user_id)
{
	global $text;
	
	$select = 'select user_name from z_users where id="' . mysql_real_escape_string($user_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	return $res->user_name;	
	
}

function getZUserIdBySid($sid)
{
	global $text;
		
	$select = 'select id from z_users where sid="' . mysql_real_escape_string($sid) . '" and block != 1';//
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	$id = $res->id;	
	
	return $id;

}

function userIssetByIdAndNameMd5($user_id, $user_name_md5)
{
	global $text;
	
	$isset = false;
	
	$obj_data_mas = array();
	
	$text->my_sql_query='select id, user_name from z_users where id="' . mysql_real_escape_string($user_id) . '"';
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	$user_name = $res->user_name;	
	
	if($user_name != "")
	{
		$user_name_md5_db = md5($user_name);
					
		if($user_name_md5_db == $user_name_md5)		
		{
					
			$isset = true;

		}	
	
	}		
	
	return $isset;

}

function getUserInFriendById($user_id, $user_ch_id)
{
	global $text;
	
	$select = 'select id from z_user_friends where block="0" and user_id="' . mysql_real_escape_string($user_id) . '" and user_ch_id="' . mysql_real_escape_string($user_ch_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	$id = $res->id;	

	return $id;

}

function getZLinkIdByUsers($user_id, $user_ch_id)
{
	global $text;
	
	$select = 'select id from z_user_friends where user_id="' . mysql_real_escape_string($user_id) . '" and user_ch_id="' . mysql_real_escape_string($user_ch_id) . '"';
	$text->my_sql_query = $select;
	$text->my_sql_execute();
	$res = mysql_fetch_object($text->my_sql_res);
	$id = $res->id;	

	return $id;

}




?>