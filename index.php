<?php
session_start();
header('Content-Type: text/html; utf-8; charset=UTF-8');

//require_once(realpath(__DIR__) . '/db/db_connect.php');
//require_once(realpath(__DIR__) . '/utils.php');

$sid = session_id();//for php5	
$__session = $_SESSION;
session_write_close();

?>
<html>
<title id="title">Криптограм</title>
<head>

	<meta http-equiv="content-type" content="text/html; charset=utf-8">

	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	
	<script src="js/jquery-1.6.1.min.js"></script>

	<script type="text/javascript" src="jshash-2.2/md5.js"></script>
	
    <script src="jsencrypt-master/bin/jsencrypt.js"></script>
	
	<script type="text/javascript" src="js/aes.js"></script>	
	<script type="text/javascript" src="js/aes-json-format.js"></script>	
	
	<link rel="stylesheet" href="http://fontawesome.io/assets/font-awesome/css/font-awesome.css">
	 <script src="https://use.fonticons.com/ffe176a3.js"></script>
	 
	<link rel="stylesheet" href="css/theme_default_new.css"> 
	
	<script type="text/javascript" src="js/cryptogram.js"></script>
	
	
</head>
<body id="body">



	<div id="tmp_d"></div>
	<div id="tmp_p"></div>

	<div style="position:relative">
			
		<div id="login_boxs" style="display:block; margin-top:5px">
		
			<center>
			
				<div style="width:318px; ">
				
					<table border=0 width=100%>
						<tr>
						<td align="left">
							<span class="btn" id="type_login">Войти</span>
						</td>
						<td align="right">
						
							<span class="btn" id="type_new">Новый User</span>
						
						</td>
					</tr>
					</table>	
				
				
					<div id="login_box" align="center">
					
						<div style=" width:170px; height:170px;" align="left">
							Имя:<br>
							<input type="text" name="chat_login_user_name" id="chat_login_user_name" style='width:170px'>
							Секретное слово:<br>
							<input type="password" name="chat_login_user_secret" id="chat_login_user_secret" style='width:170px'>
							<br>
							<center style="display:none; padding-top:5px" id="box_secret_preloader"><div class="preloader_friend">&nbsp;</div></center>
							<div id="secret_dop" style="display:none; margin-top:5px">
							
								<div class="server_ok">
									<b>Сервер подтвержден. <br>Cоединение установлено. <br> Введите пароль.</b>
								</div>
								
								Пароль:<br>
								
								<input type="password" name="chat_login_user_password" id="chat_login_user_password" style='width:170px'>
								<br>							
							
							</div>
							<div align="center" style="padding-top:10px">
								<div id="send_login" class="btn">Соединить</div>
								<div id="send_login2" class="btn" style="display: none">Вход</div>		
							</div>
						</div>
					</div>
					
					<div id="new_box" align="center">
					
						<div style=" width:170px; height:170px;" align="left">
							Имя:<br>
							<input type="text" name="chat_new_user_name" id="chat_new_user_name" style='width:170px'>
							<br>
							Секретное слово:<br>
							<input type="text" name="chat_new_word_secret" id="chat_new_word_secret" style='width:170px'>
							<br>	
							<div id="pass_dop" style="display:none; margin-top:5px">	
								<span style="color:#ff0000">Пароль:</span><br>
								<input type="password" name="chat_new_user_password" id="chat_new_user_password" style='width:170px'>
								<br>
								<span style="color:#ff0000">Повтор пароля:</span><br>
								<input type="password" name="chat_new2_user_password" id="chat_new2_user_password" style='width:170px'>							
								<br>
							</div>	
							<div align="center" style="padding-top:10px">
								<div id="send_new" class="btn">Создать</div>
								<div id="send_new2" class="btn" style="display: none">Регистрация</div>		
							</div>
						</div>
					</div>					
				
				
				</div>
				
				<div id='list_friend' style='diaplsy:none'></div>
			
			</center>
		
		</div>
		

		
		<script>
		
			//overflow:hidden;
		
			$(document).ready(function(){
			

			
			
			});
		
	
		
		</script>
		
		<center>
		
			<div id="box_box">
		
				<div id="menu_box" align="left">
				
					<table width=100% height=100% cellpadding="0" cellspacing="0">
					<tr>
						<td>
							<div class="menu_el" act='1' el_name='cont' style='color:#000'>Контакты</div>
						</td>
						<td>
							<div class="menu_el" act='0' el_name='search' style='color:#668B8B'>Поиск</div>
						</td>
						<td>
							<div><a class="menu_a_el" href="http://криптограм.впрограмме.рф/" target="_blank">?</a></div>
						</td>							
						<td align="right" width="50%">
							&nbsp;
							
							<span id="user_name_box">111</span>
						</td>								
					
			
					</tr>
					</table>			
				
				
				</div>	

				<?php

					$test_text = rand(10, 100000);
				

				?>	
				
				
			
				<div id="con_box" style="position:relative; z-index:10">
				
					<div id="con_abs_box" >
					
						<table width=100% height="100%" cellpadding="0" cellspacing="0" border=0>
						<tr>
							<td width="318px" valign="top">
								
								<div id="data_msg_box">
								
									<table width="100%" height="500px" style="max-height:500px" cellpadding="0" cellspacing="0">
									<tr height="40px">
										<td valign="top">
										
											<table width="100%" height="100%" cellpadding="0" cellspacing="0">
											<tr>
												<td width="20px" align="center" class="online_td" id="online_td_msg" user_id="0"></td>
												<td>
													<div id="data_user_msg" style="padding-left:5px; font-weight:bolder">
												
														<div id="data_user_msg_name"></div>
														
												
													</div>													
												</td>
												<td width="100px" align="right" id="crypto_line_state">
												
													
												
												</td>
											</tr>
											</table>	
										
									
										</td>
									</tr>									
									<tr>
										<td valign="bottom" id="data_list_msg">
																	
										</td>
									</tr>
									<tr id="tr_msg_reply" style="display:none; height:120px">
										<td valign="top" >
											<div id="top_msg_reply" align="right">
												<table width="100%" cellpadding="0" cellspacing="0">
												<tr>
													<td style="padding-left:10px">
														<span style="color:#1C5C78;">Replays</span>
													</td>
													<td align="right">
														<i class="fa fa-times" aria-hidden="true" style="color:#1C5C78; cursor:pointer" id="msg_reply_close"></i></div>	
													</td>
												</tr>
												</table>	
											<div id="box_msg_reply"></div>							
										</td>
									</tr>									
									<tr height="55px" style="height:55px; max-height:200px; padding-top:5px">
										<td valign="bottom" style="position:relative">
										
											<div style="position:absolute; top:-20px; left:10px; font-size:13px; color:#808080; display:none" id="pencil"><i class="fa fa-pencil" aria-hidden="true"></i>....</div>
										
											<textarea style="width:100%; height:50px; resize:vertical; max-height:200px" placeholder="Текст сообщения" maxlength="500" id="data_text_msg"><?php echo $test_text; ?></textarea>
											
										
										</td>
									</tr>
									<tr height="35px">
										<td valign="top" align="right" style="padding-right:2px; position:relative">
										
											<div style="position:absolute; top:10px; left:10px; display:none" id="msg_edit_panel"><i class="fa fa-times" aria-hidden="true" style="color:#ff0000; cursor:pointer" id="msg_del"></i> <i class="fa fa-reply" aria-hidden="true" style="color:#1C5C78; cursor:pointer; display:none" id="msg_reply"></i></div>
											<span class="btn" id="msg_send" style="margin-top:5px">Отправить</span>
										
										</td>
									</tr>	
									<tr>
										<td valign="top" align="right" style="padding-right:2px">
										
											&nbsp;
										</td>
									</tr>										
									</table>
									

								
								</div>
															
								
							</td>						
							<td width="318px" valign="top">
								
								<div id="data_con_search_box">
																									
									<div id="div_con_search" align="left" >
										<table cellpadding="0" cellspacing="0">
										<tr>
											<td>
												<i class="fa fa-search" aria-hidden="true" style="font-size:20px"></i>
											</td>
											<td align="left" style="padding-left:5px">
												<input type="text" style="width:270px; border: 0px solid; outline: none;" placeholder="Поиск в моих контактах" id="user_con_search">
											</td>
										</tr>
										</table>
										
									</div>														
								
								</div>										
								
								<div id="data_contacts_box">
								
									Получение списка контактов...
								
								</div>
															
								
							</td>
							<td width="318px" valign="top">
							
							
								<div id="data_search_box">							
										
									<div id="div_search" align="left" >
										<table cellpadding="0" cellspacing="0">
										<tr>
											<td>
												<i class="fa fa-search" aria-hidden="true" style="font-size:20px"></i>
											</td>
											<td align="left" style="padding-left:5px">
												<input type="text" style="width:270px; border: 0px solid; outline: none;" placeholder="Поиск пользователей" id="user_search">
											</td>
										</tr>
										</table>
										
									</div>	

									<div id="data_search" align="left">
										
									</div>								
													
								
								</div>						
							
							</td>
							<td width="318px" valign="top" style="padding:5px">
								
								<div id="data_settings_box">	

									Ссылка для блокировки аккаунта. Скопируйте ее и сохраните где-нибудь. Если по каким-то причинам вы потеряете доступ к своему аккаунту Вы сможете заблокировать доступ к нему по этой ссылке:

									<input id="s_user_block_link" style="width:100%; border:1px solid #1C5C78; color:#ff0000; padding:2px">
									
									<div style="border-top: 0px solid #1C5C78; padding-top:5px; margin-top:0px">
									
										<table width="100%">
										<tr>
										<td width="20px">

											<input type="checkbox" name="sound_ok" id="sound_ok">
										
										</td>
										<td>
											Звуковые оповещения

										</td>
										</tr>
										<tr>
										<td width="20px">

											<input type="checkbox" name="log_on" id="log_on">
										
										</td>
										<td>
											Log (Для разработчиков)

										</td>
										</tr>										
										</table>	
									<div>		
									
									<div style="border-top: 1px solid #1C5C78; padding-top:5px; margin-top:5px">
										Секретное слово:<br>
										<input type="text" name="s_chat_new_word_secret" id="s_chat_new_word_secret" style='width:170px'>
										<br>							
										<span >Пароль:</span><br>
										<input type="password" name="s_chat_new_user_password" id="s_chat_new_user_password" style='width:170px'>
										<br>
										<span >Повтор пароля:</span><br>
										<input type="password" name="s_chat_new2_user_password" id="s_chat_new2_user_password" style='width:170px'>							
										<br>
							
										<div align="center" style="padding-top:10px">
											<div id="s_send_new" class="btn">Сохранить</div>
										</div>	
										
										<div style="margin-top:0px" align="center">
										
											<a href="http://криптограм.впрограмме.рф" target="_blank"><img src="http://криптограм.впрограмме.рф/crypto/images/logos/crypt-logo-8.gif" width="200px" ></a>
										
										</div>
										
									</div>		
								
								</div>	
								<div id="data_settings_status">													
												
									Получение настроек...												
								
								</div>									
								
							</td>							
							<td>

								&nbsp;
								
							</td>	
						</tr>
						</table>
					
					</div>
				
				
				</div>
				
			</div>
		
		</center>		
		

	
		<br><br><br><br>
		
		<div id="data_list_msg_abs_box" style="position:absolute; top:70; left:230; border:1px solid #808080; width:312px; height:500px; left:-800px"></div>
		<div id="queue_box" style="border:1px solid #0000ff; padding:5px; position:absolute; top:-500px; left:-800px; width:500px"></div>
		<div id="queue_atoms_box" style="border:1px solid #000; padding:5px; position:absolute; top:-600px; left: -800px; width:500px"></div>
		<div id="log_box" style="display:none; border:1px solid #808080; padding:5px; position:absolute; top:600px; width:98%; background-color:#fff"></div>
	
		<div style="position:absolute; top:0; left:100; display:none;" id="demons_state" _play="1"><span class="btn" >Остановить</span> После перезапуска старт лога будет через минуту<br>Так же логи видны из консоли Javascrupt разработчика.<br> Для работы с этой консолью нажмите Ctrl-Shift + J<br> и перейдите во вкладку Console</div>
		
		
		<video src="sound/add_friend.mp3" onclick="this.play();" id="sound_new_msg_play" style="display:none"></video>
		<video src="sound/add_friend.mp3" onclick="this.play();" id="sound_add_friend_play" style="display:none"></video>
		<video src="sound/init.wav" onclick="this.play();" id="sound_init_play" style="display:none"></video>
		
		<input type="hidden" value="<?php echo $sid; ?>" id="sid">
		
	</div>


   
</body>
</html>