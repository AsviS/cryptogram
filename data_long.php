<?php
session_start();
set_time_limit(45);
ini_set('max_execution_time',45);
header('Content-Type: text/html; utf-8; charset=UTF-8');

$max_s = 45;

$start = microtime(true);

require_once(realpath(__DIR__) . '/db/db_connect.php');
require_once(realpath(__DIR__) . '/utils.php');
require_once(realpath(__DIR__) . '/db_utils.php');

$sid = session_id();//for php5	
$__session = $_SESSION;
session_write_close();

clearData();

$packet_key = $_POST['packet_key'];
$encrypted = $_POST['encrypted'];
$_sid = $_POST['sid'];



$encrypted = urldecode($encrypted);
$encrypted = str_replace("@@p@@", "+", $encrypted);
$encrypted = str_replace("@@pr@@", " ", $encrypted);


$return_data = array();
$return_data['encrypted_data'] = getEncryptedDataError($packet_key, $sid);
$return_data['reload'] = '0';	

if($text && $_sid == $sid)
{
	
	$key = pack("H*", $__session['sync_key_b_1']);
	$iv = pack("H*", $__session['sync_iv_b_1']);
	
	$_encrypted = $encrypted;
	
	//Now we receive the encrypted from the post, we should decode it from base64,
	$encrypted = base64_decode($encrypted);
	$decode_str = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $encrypted, MCRYPT_MODE_CBC, $iv);
	
	$data_mas = explode('@', $decode_str);
	
	$packet_id = trim($data_mas[0]);
	$key_s_a_72 = trim($data_mas[1]);
	
	$user_id = getZUserIdBySid($sid);

	//$return_data['packet_id'] = $packet_id;
	//$return_data['to_user'] = $to_user;
	//$return_data['key_s_a_72'] = $key_s_a_72;
	//$return_data['user_id'] = $user_id;
	
	$while_data = array();
	$pencil_data = array();
	$list_add_to_friend = array();
	
	
	if($packet_id > 0 && $user_id > 0 && $key_s_a_72 != '')
	{		
	
		//============================================================
		//============================================================	

		$max_time = $max_s;

			$t_k = 0;
			$t_k_max = $max_s;
			
			$while = true;
			
			while($while)
			{
			
				$data_isset = false;

				
				//Смотрим - нет ли для нас чего...
				
				//Для начала - смотрим нет ли у нас нового сообщения (получим асинхронный ключик, выплюнем для расшифровки браузеру)
				
				$obj_data_mas = getMessages($user_id, 0, 1);				
				
				$count_obj_data_mas = count($obj_data_mas);
				
				for($k = 0; $k < $count_obj_data_mas; $k++)
				{
					$add = array();
					
					$add['type'] = 'msg_0';
					$add['packet_key'] = $obj_data_mas[$k]['packet_key'];//packet_key cсообщения
					$add['crypto_line'] = $obj_data_mas[$k]['crypto_line'];
					$add['time'] = $obj_data_mas[$k]['time'];
					$add['count_atoms'] = $obj_data_mas[$k]['count_atoms'];
					$add['user_from_id'] = $obj_data_mas[$k]['user_from'];
					$add['user_from_name'] = getUserNameById($obj_data_mas[$k]['user_from']);
					$add['type_send'] = $obj_data_mas[$k]['type_send'];
			
					if($obj_data_mas[$k]['crypto_line'] == 1)
					{
						$encrypt_sync_key_data = $obj_data_mas[$k]['encrypt_sync_key_data'];
						
						$encrypt_sync_key_data = str_replace("+", "@@p@@", $encrypt_sync_key_data);
						$encrypt_sync_key_data = str_replace(" ", "@@pr@@", $encrypt_sync_key_data);
						
						$encrypt_sync_key_data = urlencode($encrypt_sync_key_data);				
				
						$add['encrypt_sync_key_data'] = $encrypt_sync_key_data;							
					
					}
					else
					{
						$add['easysync_key_data'] = getEasySincKey($obj_data_mas[$k]['user_from'], $user_id);	
					
					
					}		
			
					
					$while_data[] = $add;
					
					$data_isset = true;
				
				}
				
				//================================================================================
				//================================================================================
				
					//Получаем значек карандашика если нам писали последние 10 секунд.. все остальное стираем
					
					$pencil_data = getPencilMas($user_id);//Получим всех кто мне пишет сейчас
					
					$count_obj_data_mas = count($pencil_data);
					
					if($count_obj_data_mas > 0)
					{			
						//Отметим эти связи, чтобы повторно их сейчас не передать и не устроить карусель с ajax запросами
						
						for($k = 0; $k < $count_obj_data_mas; $k++)
						{
						
							$text->my_sql_query="update z_user_friends set pencil='0' where user_id='" . mysql_real_escape_string($user_id) . "' and user_ch_id='" . mysql_real_escape_string($pencil_data[$k]['user_id']) . "'";
							$text->my_sql_execute();
						
						
						}
					
						$data_isset = true;
					}
					

					
					
					
					
				
				//================================================================================
				//================================================================================
				
				
				//Получение непрочитанных несквозных сообщений для мигалки
				
				$obj_data_mas = getMessages($user_id, 1, 5);	//Возможно нужно не в 5 а в 6 перевести
				
				$count_obj_data_mas = count($obj_data_mas);
				
				for($k = 0; $k < $count_obj_data_mas; $k++)
				{
					$add = array();
					
					$add['type'] = 'not_line';
					$add['obj_data_mas'] = $obj_data_mas;	
					
					$while_data[] = $add;
					
					$data_isset = true;
				
				}	
				
				//================================================================================
				
				$obj_data_post_meta_mas = getMessages($user_id, 2, 3);	

				//Получим сообщения, метаданные которых уже получены юзером
				//Полученные метаданные означает, что юзер получил синхронный ключ, которым он будет расшифровывать данные сообщения
				//Пожалуй отправим ему один из атомов сообщения, пометив его (атом) как отправленный
				//Когда юзер получит все атомы - он переведет сообщение в статус полученное..

				$count_atom_return  = 2;
				
				$count_obj_data_post_meta_mas = count($obj_data_post_meta_mas);
				
				for($k = 0; $k < $count_obj_data_post_meta_mas; $k++)
				{
					$data_atoms_mas = getAtomsFreeByMsgId($obj_data_post_meta_mas[$k]['id'], $count_atom_return);
				
					$count_data_atoms_mas = count($data_atoms_mas);
				
					for($at = 0; $at < $count_data_atoms_mas; $at++)
					{
						//Пометим атом как то, что мы его отправляем.. чтобы повторно его не выгребли из базы
						
						setAtomStatus($data_atoms_mas[$at]['id'], '1');
						
						$add = array();
						
						$add['type'] = 'atom_0';
						$add['user_from_id'] = $obj_data_post_meta_mas[$k]['user_from'];
						$add['crypto_line'] = $obj_data_post_meta_mas[$k]['crypto_line'];
						$add['session_user_id'] = $obj_data_post_meta_mas[$k]['session_msg'];		
						$add['msg_packet_key'] = $obj_data_post_meta_mas[$k]['packet_key'];//packet_key сообщения
						$add['number_atom'] = $data_atoms_mas[$at]['number_atom'];
						$add['body'] = $data_atoms_mas[$at]['body'];						
				
			
						
						$while_data[] = $add;	

						$data_isset = true;	
					
					
					}
				
				

				
				}
				
				//================================================================================
				//================================================================================
				
				//Смотрим полученные сообщения
				
				$obj_data_mas = getMessages($user_id, 4, 5, 'from');				
				
				$count_obj_data_mas = count($obj_data_mas);
				
				for($k = 0; $k < $count_obj_data_mas; $k++)
				{
					$add = array();
					
					$add['type'] = 'msg_4';
					$add['packet_key'] = $obj_data_mas[$k]['packet_key'];//packet_key cсообщения
					$add['time'] = $obj_data_mas[$k]['time'];
					$add['count_atoms'] = $obj_data_mas[$k]['count_atoms'];
					$add['user_from_id'] = $obj_data_mas[$k]['user_from'];
					$add['user_from_name'] = getUserNameById($obj_data_mas[$k]['user_from']);
					$add['type_send'] = $obj_data_mas[$k]['type_send'];			
					
					$while_data[] = $add;
					
					$data_isset = true;
				
				}		

				//================================================================================
				//================================================================================
				
				//Смотрим прочитанные сообщения
				
				$obj_data_mas = getMessages($user_id, 6, 7, 'from');				
				
				$count_obj_data_mas = count($obj_data_mas);
				
				for($k = 0; $k < $count_obj_data_mas; $k++)
				{
					$add = array();
					
					$add['type'] = 'msg_6';
					$add['packet_key'] = $obj_data_mas[$k]['packet_key'];//packet_key cсообщения
					$add['time'] = $obj_data_mas[$k]['time'];
					$add['count_atoms'] = $obj_data_mas[$k]['count_atoms'];
					$add['user_from_id'] = $obj_data_mas[$k]['user_from'];
					$add['user_from_name'] = getUserNameById($obj_data_mas[$k]['user_from']);
					$add['type_send'] = $obj_data_mas[$k]['type_send'];
					
					$while_data[] = $add;
					
					$data_isset = true;
				
				}

				//================================================================================
				//================================================================================
				
				//Смотрим события по добавлению в други
				
				
				$list_add_to_friend = getListNotFriendsByUserId($user_id, 'not_look');				
				
				$count_list_add_to_friend = count($list_add_to_friend);			
				
				
				if($count_list_add_to_friend > 0)
				{
					//Пометим, что типа прочитали	
				
					$data_isset = true;
					
				}
					
				
				
				if($data_isset)
					break;
				
				//================================================================================
				//================================================================================
			
				//echo 't_k=' . $t_k . '<br>';
			
				$t_k++;	
				
				if($t_k > $t_k_max)
				{			
				
					//echo 'STOP t_k_max <br>';
					
					$while = false;
					break;
				}			
			
					
				$delta = ( microtime(true) - $start );	
				//echo 'while_delta=' . $delta . '<br>';
				
				if($delta > $max_time)
				{			
				
				
					//echo 'STOP max_time <br>';
					
					$while = false;
					break;
				}						
				
			
				sleep(1);					
				
				
			}			

			
		$delta = ( microtime(true) - $start );	
		//echo 'end_delta=' . $delta . '<br>';				
		//============================================================
		//============================================================	
	
		
		setOnline($user_id);	
	
		$data_req_mas = array();
		
		$list_mas = getListFriendsByUserId($user_id);
		
		$data_req_mas['user_id'] = $user_id;
		$data_req_mas['list_mas'] = $list_mas;
		$data_req_mas['packet_id'] = $packet_id;
		$data_req_mas['while_data'] = $while_data;
		$data_req_mas['pencil_data'] = $pencil_data;
		$data_req_mas['list_add_to_friend'] = $list_add_to_friend;
		
		$data_req_str = json_encode($data_req_mas);
		
		$data_return = $data_req_str;
		
		$data_return = str_replace("+", "@@p@@", $data_return);
		$data_return = str_replace(" ", "@@pr@@", $data_return);
		
		$data_return = urlencode($data_return);	
		
		$data_return_str = htmlspecialchars($data_return);//Данные, которые мы вернем после логина (список друзей)

		//Теперь шифруем возвращаемые данные симметричным ключем key_s_a_1, который нам передала машина А
		
		include("crypto/cryptojs-aes.php");		
		
		$crypttext = htmlentities(cryptoJsAesEncrypt($key_s_a_72, $data_return_str));
									
		$crypttext = urlencode($crypttext);				
			
		$return_data['encrypted_data'] = $crypttext;	
		//$data_req_mas['while_data_test'] = $while_data;	
	
	
	
	}
	else
	{
		//Что-то не так.. перезагрузим браузер клиента
		
		//================================================================================
		//================================================================================

			//Если мы не залогинены или сессия другая - мы опрашиваем лонгпул с некорректными входными данными (значит мы должны перезагрузиться)
			//Такой случай бывает когда мы где-то в другом месте залогинились или еще какая хуйня
			
			$return_data['reload'] = '1';	
			
		
		//================================================================================
		//================================================================================		
	
	
	}
	

}

echo json_encode($return_data);

?>