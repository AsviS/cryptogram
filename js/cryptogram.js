		var user_id;
		var packet_id = 1;
		var pubkeyA_1;
		var _KeysA_1;
		var msgs_mas = new Object();
		var queueEvents = new Array();
		var queueAtoms = new Array();		
		var sync_key_b_1 = '';
		var sync_key_b_2 = '';
		var data_key_crypt = '';
		var count_symbol_in_atom = 500;
		var one_time_dead = 160;//Сколько живет один атом максимально (сообщение из одного атома)
		var time_delta_int = 0;//Дельта с сервером. На сервере возвратили time() - браузер;
		var about_1 = "";
		
		var key_k = 0;
		
		var event_user_add = false;
		var event_new_msg = false;
		var event_load_msg = false;
		
		//Периодичность Демонов
		var event_time = 1000;
		var queue_time = 1000;
		var long_pool_time = 1000 * 60;		
		
		var data_list_msg_h = 360;
		
		
		//Инструменты
		
		var debag_on = true; //Дебаг
		
		var log_display = debag_on;//Включает/отключает лог операций для дебага
		var demon_init = true;//Временное отключение демонов (для дебага верстки и т.п. что б не мешали постоянные TimeIntervalы)
		
		var tools_log = debag_on;//Видимость блока с логами
		var tools_queue_msg = debag_on;
		var tools_queue_atom = debag_on;
		var tools_con_msgs = false;
		
		var menu_state = '';
		var focus_g = 1;		
			
		
		var sid = '';
		
		function writer()
		{
			if(key_k > 3)
			{
				//Отправим событие на сервер
				
				var data_list_msg = $('#data_list_msg');
				
				var user_id_act = parseInt($('.abs_msg_con', data_list_msg).attr('user_id'));//Активный пользователь (ему мы сейчас отправим сообщение)						
				
				if(user_id > 0 && user_id_act > 0)
				{
					var st_packet_id = getNextAutoIncrementId();
				
					var st_packet_key = getUnicKeyPacket(st_packet_id);					
									
					var send_data = new Object();
					send_data['sid'] = sid;
					send_data['packet_key'] = st_packet_key;
					send_data['user_id_act'] = user_id_act;
					
					var st_send_str = JSON.stringify( send_data );
					
					st_send_str = st_send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
					st_send_str = st_send_str.replaceAll(' ', '@@pr@@');	
					st_send_str = encodeURIComponent(st_send_str);//Кодируем для URL						
					
					var st_data_str = st_send_str + '@';	

					if(data_key_crypt != '')
					{
						log('data_key_crypt=' + data_key_crypt);//loger...	
					
						var encrypted = getEncryptedStr(st_data_str, data_key_crypt);				
						
						log('encrypted=' + encrypted);//loger...	
						
						//Сейчас у сообщения статус 1, т.к. при создании оно было 0, после отправки метаинформации сервер перевел ее в 1
						//Мы должны переставить его в статус 2, чтобы сервер начал нам отдавать его атомы
						
						
						
						$.ajax({						
						type: 'POST',
						url: 'setPencilEvent.php',
						data: 'encrypted=' + encrypted,
						async: true,
						success: function(msg){
						
							log('setPencilEvent msg=' + msg);//loger...				

										
						}});		
										
						
					
					}
					else
						log('Нет ключа - необходимо авторизоваться');//loger...								
				
				}
				
				
			
					

			
			
			}
			
			key_k = 0;
		
		}	
		
		function soundGo(sound)
		{
			if($('#sound_ok').prop("checked"))		
				$("#sound_" + sound + "_play").click();
		
		}

		function setDebag(debug)
		{
			log_display = debug['log_display'];			
			tools_log = debug['tools_log'];
			tools_queue_msg = debug['tools_queue_msg'];
			tools_queue_atom = debug['tools_queue_atom'];
			tools_con_msgs = debug['tools_con_msgs'];
			
			if(tools_log)
			{
				$('#log_box').css('display', 'block');
				$('#demons_state').css('display', 'block');
			}		
				
				
			if(tools_queue_msg)
				$('#queue_box').css({'left': '0', 'top': '500'});

			if(tools_queue_atom)
				$('#queue_atoms_box').css({'left': '0', 'top': '600'});

			if(tools_con_msgs)
				$('#data_list_msg_abs_box').css({'left': '230', 'top': '70'});				
		
		}
		
		
		function dump(arr,level) {
			var dumped_text = "";
			if(!level) level = 0;
			
			//The padding given at the beginning of the line.
			var level_padding = "";
			for(var j=0;j<level+1;j++) level_padding += "    ";
			
			if(typeof(arr) == 'object') { //Array/Hashes/Objects 
				for(var item in arr) {
					var value = arr[item];
					
					if(typeof(value) == 'object') { //If it is an array,
						dumped_text += level_padding + "'" + item + "' ...\n";
						dumped_text += dump(value,level+1);
					} else {
						dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
					}
				}
			} else { //Stings/Chars/Numbers etc.
				dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
			}
			return dumped_text;
		}		
		
		
		function getTimeBrowserSec()
		{
		
			var time_str = new Date().getTime() + '00000';
			return parseInt(time_str.substr(0,10));//время в секундах	
	
		}		
		
		function getLatCorrect(str)
		{
			var re = new RegExp(/^[a-zA-Z0-9_]+$/i);

			result = re.exec(str);
			if (result != null)
			{
				return true;
			}				
			else
				return false;


		}		
		
		function htmlspecialchars_decode(string, quote_style) {
		  var optTemp = 0,
			i = 0,
			noquotes = false;
		  if (typeof quote_style === 'undefined') {
			quote_style = 2;
		  }
		  string = string.toString()
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>');
		  var OPTS = {
			'ENT_NOQUOTES': 0,
			'ENT_HTML_QUOTE_SINGLE': 1,
			'ENT_HTML_QUOTE_DOUBLE': 2,
			'ENT_COMPAT': 2,
			'ENT_QUOTES': 3,
			'ENT_IGNORE': 4
		  };
		  if (quote_style === 0) {
			noquotes = true;
		  }
		  if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
			quote_style = [].concat(quote_style);
			for (i = 0; i < quote_style.length; i++) {
			  // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
			  if (OPTS[quote_style[i]] === 0) {
				noquotes = true;
			  } else if (OPTS[quote_style[i]]) {
				optTemp = optTemp | OPTS[quote_style[i]];
			  }
			}
			quote_style = optTemp;
		  }
		  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
			string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
			// string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
		  }
		  if (!noquotes) {
			string = string.replace(/&quot;/g, '"');
		  }
		  // Put this in last place to avoid escape being double-decoded
		  string = string.replace(/&amp;/g, '&');

		  return string;
		}
		
		
	   var generateKeys = function () 
	   {
			var startKeysA = new Array();		
	  
			var keySize = 1024;
			var crypt = new JSEncrypt({default_key_size: keySize});

			var dt = new Date();
			var time = -(dt.getTime());

			crypt.getKey();
			dt = new Date();
			time += (dt.getTime());
			$('#time-report').text('Generated in ' + time + ' ms');
			
			startKeysA['time-report'] = time;
			startKeysA['pubkey'] = crypt.getPublicKey();
			startKeysA['privkey'] = crypt.getPrivateKey();
			
			return startKeysA;
		};  		
		
		String.prototype.replaceAll = function(search, replace){
		  return this.split(search).join(replace);
		}		

		function getDataDecryptedArray(msg, key_s_a_72)
		{
			
			var getData_mas = jQuery.parseJSON(msg);	
			var encrypted_data = getData_mas['encrypted_data'];	
			
			encrypted_data = decodeURIComponent(encrypted_data);						
			encrypted_data = encrypted_data.replaceAll('&quot;', '"');	
								
			key_s_a_72 = key_s_a_72.toString();					
			
			var decrypted = CryptoJS.AES.decrypt(encrypted_data, key_s_a_72, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8);//дешифруем
			
			if(decrypted != "")
			{
				var length = decrypted.length;
			
				if(length > 3)
				{
					decrypted = decrypted.substr(1,(decrypted.length - 2));
				
				}
				
			
			}
			
			decrypted = htmlspecialchars_decode(decrypted);//спецсимволы
			decrypted = decrypted.replaceAll('\\/', '/');

			
			decrypted = decodeURIComponent(decrypted);
			
			decrypted = decrypted.replaceAll('@@p@@', '+');
			decrypted = decrypted.replaceAll('@@pr@@', ' ');	

			return jQuery.parseJSON(decrypted);		
		
		}
		

		
		function msgPaint(user_id, user_name)
		{
			log('msgPaint... user_id=' + user_id + ' / user_name=' + user_name);//loger...
			
					
			//Прорисуем сообщения, которых нет.. а пока что это те, которые нам шлют, т.к. которые мы шлем мы вроде отрисовываем при отсыле
			
			//Перебираем сообщения из массива и тех что нет - рисуем
			
			var list_data_list_msg = msgs_mas[user_id]['data_list_msg'];
			var count_list_data_list_msg = list_data_list_msg.length;
			
			createAbsIfNotExist(user_id, user_name);
			
			//var data_list_msg = $('#data_list_msg');
			var abs_msg_con = $('.abs_msg_con[user_id="' + user_id + '"]');
			
			log('count_list_data_list_msg=' + count_list_data_list_msg);//loger...	
			
			for(var k = 0; k < count_list_data_list_msg; k++)
			{
				var user_from = parseInt(list_data_list_msg[k]['user_from']);
				var msg_id = parseInt(list_data_list_msg[k]['msg_id']);
				var msg_packet_key = list_data_list_msg[k]['msg_packet_key'];
				var status = list_data_list_msg[k]['status'];
				var type_send = list_data_list_msg[k]['type_send'];
				var no_crypto_line_data = list_data_list_msg[k]['no_crypto_line_data'];

					var msg_paint_isset = false;				
					
					$('.msg_clss[msg_id=' + msg_id + ']', abs_msg_con).each(function(){
										
						msg_paint_isset = true;
					
					});	
					
					//На всякий случай проверим - не отрисовано ли сообщение с таким msg_packet_key.. ну это если глюги будут сделать

					if(!msg_paint_isset)
					{
						//Сообщение от юзера не отрисовано.. нужно нарисовать.. только куда7

						log('msg_id=' + msg_id + ' НЕ отрисовано');//loger...	
						log('msg_packet_key=' + msg_packet_key);//loger...	
						
						var time = parseInt(list_data_list_msg[k]['time']);//Время с сервера..
						
						var msg_time_conv_browser = time - time_delta_int;
						var time_now = getTimeBrowserSec();
						
						var d = msg_time_conv_browser - time_now;
						
						log('d=' + d);//loger...	
						
						log('time=' + time);//loger...	
						log('time_delta_int=' + time_delta_int);//loger...	
						log('msg_time_conv_browser=' + msg_time_conv_browser);//loger...	
						log('time_now=' + time_now);//loger...	
						
						//$('#general').before($('h1'));
						
						//Вставить сообщение нужно после максимально последнего по времени
						
						//Ищем сообщение, которое по времни больше чем наше.. если оно есть - вставим до него.. если нет - в конец
						
						var msg_older_isset = false;
						var older_msg_id = 0;
						
						$('.msg_clss', abs_msg_con).each(function(){
											
							var this_time = parseInt($(this).attr('time'));
							
							if(this_time > msg_time_conv_browser && !msg_older_isset)
							{
								//Нашли сообщение позже того, что мы хотим вставить.. вставим перед ним
								
								msg_older_isset = true;
								
								older_msg_id = parseInt($(this).attr('msg_id'));
							
							}
							
							
						
						});	
						
										
						var date = new Date(msg_time_conv_browser * 1000);
						var hours = date.getHours();
						var minutes = date.getMinutes();					
									
						var time_ = hours + ':' + minutes;

						
						
						var crypto_line_abs = '<div style="position:absolute; display:none; right:5px; top:5px; font-size:13; color:#808080" class="fa-paper-plane-abs"><i class="fa fa-paper-plane" style="font-size:13px; color:#ff0000" aria-hidden="true"></i></div>';							
						
						var send_abs = '';
						
						if(status == 0 && user_from != 0)
						{
							var time_abs = '<div style="position:absolute; right:25px; bottom:3px; font-size:13; color:#808080" _status="' + status + '" class="preload_msg_time">' + time_ + '</div>';
							
							send_abs = '<div style="position:absolute; right:5px; bottom:5px; font-size:13; color:#1C5C78" class="preload_msg_status_send"><i class="fa fa-clock-o" id="loader_' + msg_id + '" style="font-size:13px" aria-hidden="true"></i></div>';
							
							var new_msg_from_div = '<div class="msg_clss_in_l" style="background-color:#fff" align="left"><div style="color:#808080" class="preload_msg_data" msg_packet_key="' + msg_packet_key + '">Получение данных...</div>' + time_abs + send_abs + crypto_line_abs + '</div>';
							var new_msg_from_table = '<table width=100% cellpadding="0" cellspacing="0"><tr><td align="left">' + new_msg_from_div + '</td></tr></table>';						
						}
						else
						{	
							
							
							if(user_from == 1)
							{
								//Мы юзер, которому отправили
								
								var time_abs = '<div style="position:absolute; right:5px; bottom:3px; font-size:13; color:#808080" _status="' + status + '" class="preload_msg_time">' + time_ + '</div>';
								
								log('to_look_3=' + msg_packet_key + '/' + user_id);//loger...	
								
								setStatusMsg(msg_packet_key, user_id, 'to_look_3');	//Прочли типа
										
											
							
							}
							else
							{
								//Мы юзер, который отправлял
								
								var time_abs = '<div style="position:absolute; right:25px; bottom:3px; font-size:13; color:#808080" _status="' + status + '" class="preload_msg_time">' + time_ + '</div>';
							
								if(status == 5)
								{
									send_abs = '<div style="position:absolute; right:5px; bottom:5px; font-size:13; color:#1C5C78" class="preload_msg_status_send"><i class="fa fa-arrow-circle-o-left"  id="loader_' + msg_id + '" style="font-size:13px" aria-hidden="true"></i></div>';
								}
								else
								if(status == 6)
								{
									send_abs = '<div style="position:absolute; right:5px; bottom:5px; font-size:13; color:#1C5C78" class="preload_msg_status_send"><i class="fa fa-arrow-circle-o-left"  id="loader_' + msg_id + '" style="font-size:13px" aria-hidden="true"></i></div>';
								}
								else								
								if(status == 7)
								{
									send_abs = '<div style="position:absolute; right:5px; bottom:5px; font-size:13; color:#1C5C78" class="preload_msg_status_send"><i class="fa fa-arrow-circle-left"  id="loader_' + msg_id + '" style="font-size:13px" aria-hidden="true"></i></div>';							
								
								}
								else
								{
									send_abs = '<div style="position:absolute; right:5px; bottom:5px; font-size:13; color:#1C5C78" class="preload_msg_status_send"><i class="fa fa-server"  id="loader_' + msg_id + '" style="font-size:13px" aria-hidden="true"></i></div>';									
								
								}	

								
							
							}
						

							
							var con = '';//Соберем данные из атомов
							
							if(type_send == 'msg')
							{
								//Просто присовокупим содержание
								
								var atoms_mas = list_data_list_msg[k]['atoms_mas'];
								var sync_key = list_data_list_msg[k]['sync_key'];
													
								sync_key = sync_key.toString();		
								
								var key_p =  CryptoJS.enc.Hex.parse(sync_key);
								var iv =  CryptoJS.enc.Hex.parse(msg_packet_key);													

															
								
								for(var a = 0; a < atoms_mas.length; a++)
								{
									var decrypted = CryptoJS.AES.decrypt(atoms_mas[a]['body'], key_p, {iv: iv});	
									
									decrypted = UtfCorrect(decrypted.toString(CryptoJS.enc.Utf8));									
									
									//con += atoms_mas[a]['body'] + '/' + decrypted + '/' + key_p + '/' + iv;
									
									con += decrypted;
								
								}
							
							}
							
							if(user_from == 1)
							{
								var new_msg_from_div = '<div class="msg_clss_in_l" style="background-color:#fff" align="left"><div style="color:#808080" class="preload_msg_data" msg_packet_key="' + msg_packet_key + '">' + con + '</div>' + time_abs + send_abs + crypto_line_abs + '</div>';
								var new_msg_from_table = '<table width=100% cellpadding="0" cellspacing="0"><tr><td align="left">' + new_msg_from_div + '</td></tr></table>';								
							
							}
							else
							{
								var new_msg_from_div = '<div class="msg_clss_in" align="left"><div style="color:#808080" class="preload_msg_data" msg_packet_key="' + msg_packet_key + '">' + con + '</div>' + time_abs + send_abs + crypto_line_abs + '</div>';
								var new_msg_from_table = '<table width=100% cellpadding="0" cellspacing="0"><tr><td align="right">' + new_msg_from_div + '</td></tr></table>';									
							
							}
							
					
						
						
						}
						
						

																			
				
						var msg_box = '<div class="msg_clss msg_clss_to" no_crypto_line_data="' + no_crypto_line_data + '" is_from="' + user_from + '" msg_id="' + msg_id + '" packet_id="' + msg_id + '" msg_packet_key="' + msg_packet_key + '" time="' + msg_time_conv_browser + '" >' + new_msg_from_table + '</div>';
					
						log('msg_box 1 =' + msg_box);//loger...							
						
						
						//=================================
						//Сотрем текст типа Здесь будет переписка с пользователем, если сообщений нет
						
						var msgs_isset = false;
						
						$('.msg_clss', abs_msg_con).each(function(){
						
							msgs_isset = true;
						
						});
						
						if(!msgs_isset)
						{
							log('Сообщений нет - трем вступительную речь');//loger...	
						
							$(abs_msg_con).html('');
						}
							
						//=================================
						
						
						if(msg_older_isset)
						{
							$('.msg_clss[msg_id=' + older_msg_id + ']', abs_msg_con).before(msg_box);


						}	
						else
						{
						
							log(msg_box);//loger...	
							
							$(abs_msg_con).append(msg_box);
						
						}
						
						$('.msg_clss[msg_id=' + msg_id + ']').ready(function(){
						
							$('.msg_clss[msg_id=' + msg_id + ']').animate({
								opacity: 1
							  }, 300, function() {
								// Animation complete.
						
								
							  });	
						
						
						});	


						
						if(status == 0)
						{
							//Тут же запустим дополнительный механизм.. бывает на сервере сообщение переходит в состояние 3 (типа), но клиент атома не получает.. пакеты проябываются 
							//Если пакет не получен какое-то время - отправим переустановку статуса						
						
							window.interval_tmp = window.setTimeout(function(){
							
								//Возможно мы только залогинились и в очереди два сообщения - первое, которое ждет данных т.к. его дал while, а второе - загружается с несквозного списка..
								//У них одинаковый msg_packet_key. похерим тот, который ждет данные - мы все равно сейчас их дадим юзеру
							
								var count_msg_packet_key = 0;
							
								$('.preload_msg_data[msg_packet_key="' + msg_packet_key + '"]', abs_msg_con).each(function(){
								
									count_msg_packet_key++;
							
								
								});
							
								if(count_msg_packet_key > 1)
								{
									//У нас реал два сообщения - с одинаковым msg_packet_key
									//Одно трем.. то которое чего-то ждет, то, которое не из несквозных данных 
									
									$('.msg_clss[no_crypto_line_data=0][msg_packet_key="' + msg_packet_key + '"]', abs_msg_con).remove();
									
									log('У нас реал два сообщения - с одинаковым msg_packet_key=' + msg_packet_key + ' в abs_msg_con. Одно удаляем');
								
								}
								else
								{
									//Сообщение одно - чет оно недополучило данные - запросим заново...
									
									window.interval_tmp = window.setTimeout(function(){
									
										if($('.preload_msg_data[msg_packet_key="' + msg_packet_key + '"]').html() == 'Получение данных...')
										{
											//Вероятно битый Атом.. в sendAtomEasy такое бывает.. 
											//aes.js:10 Uncaught Error: Malformed UTF-8 data
											//при decrypted = decrypted.toString(CryptoJS.enc.Utf8);
											
											/*
											
												log('Данные атома не дошли - перепосыл на сервер в состояние готовности принять атом...');//loger...	
											
												alert('Данные атома не дошли - перепосыл на сервер в состояние готовности принять атом...!!!');
											
												setStatusMsg(msg_packet_key, user_id, 'meta_load');
											
											*/
											
											var msg_el = $('.msg_clss_to[msg_packet_key="' + msg_packet_key + '"]');

											$('.preload_msg_status_send', msg_el).html('<i class="fa fa-times" style="font-size:13px; color:#ff0000" aria-hidden="true">');	
										
											log('У нас вероятно битый атом msg_packet_key=' + msg_packet_key);
										
										}										
									
									}, 15000);
									
							
								
								}
							

								
							
							}, 5000);						
						
						}
						


					}
					else
						log('msg_id=' + msg_id + ' отрисовано');//loger...	
				
				
			

			
			
			
			
			}			
			
		
		
		}
		
		function setStatusMsg(msg_packet_key, user_from_id, status)
		{
			log('setStatusMsg... (' + msg_packet_key + ') status: ' + status);//loger...				
											
			var st_packet_id = getNextAutoIncrementId();
			
			log('st_packet_id=' + st_packet_id);//loger...		

			var st_packet_key = getUnicKeyPacket(st_packet_id);
			
			log('st_packet_key=' + st_packet_key);//loger...		
						
			var st_key_s_a_5 = getSKey(st_packet_id);
							
			st_key_s_a_5 = 	st_key_s_a_5.toString();		
							
			var send_data = new Object();
			send_data['sid'] = sid;
			send_data['packet_key'] = st_packet_key;
			send_data['msg_packet_key'] = msg_packet_key;
			send_data['user_from_id'] = user_from_id;
			send_data['status'] = status;
			send_data['key_s_a_5'] = st_key_s_a_5;//Передадим синхронный ключ для зашифровки длинных данных
			
			log('st_key_s_a_5 1=' + st_key_s_a_5);//loger...	
			
			var st_send_str = JSON.stringify( send_data );
			
			st_send_str = st_send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
			st_send_str = st_send_str.replaceAll(' ', '@@pr@@');	
			st_send_str = encodeURIComponent(st_send_str);//Кодируем для URL						
			
			var st_data_str = st_send_str + '@';	

			if(data_key_crypt != '')
			{
				log('data_key_crypt=' + data_key_crypt);//loger...	
			
				var encrypted = getEncryptedStr(st_data_str, data_key_crypt);				
				
				log('encrypted=' + encrypted);//loger...	
				
				//Сейчас у сообщения статус 1, т.к. при создании оно было 0, после отправки метаинформации сервер перевел ее в 1
				//Мы должны переставить его в статус 2, чтобы сервер начал нам отдавать его атомы
				
				$.ajax({						
				type: 'POST',
				url: 'setMsgStatus.php',
				data: 'encrypted=' + encrypted,
				async: true,
				success: function(msg){
				
					log('setMsgStatus msg=' + msg);//loger...	
					
					var getDecryptedData_mas = getDataDecryptedArray(msg, st_key_s_a_5);

					var _packet_key = getDecryptedData_mas['packet_key'];
					var reg_msg_packet_key = getDecryptedData_mas['msg_packet_key'];	
									
					log('reg_msg_packet_key msg=' + reg_msg_packet_key);//loger...	
									
					if(st_packet_key == _packet_key)
					{
						if(reg_msg_packet_key == msg_packet_key)
						{
							if(status == 'to_look_2')
							{
								$('.msg_clss_to[msg_packet_key="' + msg_packet_key + '"]').attr('state', 'to_look_2');
							
							}
							
							log('packet_key setMsgStatus "' + status + '" OK');//loger...	
						
						}
							
					
					}
					else
						log('packet_key setMsgStatus "' + status + '" ERROR');//loger...	

				

								
				}});		
								
				
			
			}
			else
				log('Нет ключа - необходимо авторизоваться');//loger...		
					
		
		}
		
		function longPoolInretval()
		{
			log('longPoolInretval...');//loger...			
	
			if(sync_key_b_1 != "")
			{			
				var packet_id = getNextAutoIncrementId();
				
				log('longPoolInretval packet_id=' + packet_id);//loger...					
				
				var packet_key = getUnicKeyPacket(packet_id);
				
				log('longPoolInretval packet_key=' + packet_key);//loger...									
			
			
				var key_s_a_72 = getSKey(packet_id);
			
				var data_str = packet_id + '@' + key_s_a_72 + '@';
				
				var encrypted = getEncryptedStr(data_str, sync_key_b_1);
				
				$.ajax({						
				type: 'POST',
				url: 'data_long.php',
				data: 'encrypted=' + encrypted + '&packet_key=' + packet_key + '&sid=' + sid,
				async: true,
				success: function(msg){
				
					log('data_long.php msg=' + msg);//loger...	
					
					
					var demons_state = $('#demons_state').attr('_play');
					
					if(demons_state == '1')
					{
						clearInterval(window.interval_long_pool);//Удаляем интервал
						
						window.interval_long_pool = window.setInterval(longPoolInretval, long_pool_time);//Создаем новый
						
						longPoolInretval();//Запускаем нас
					
					}	
					
					var getData_mas = jQuery.parseJSON(msg);	
					var reload = parseInt(getData_mas['reload']);						

					if(reload == 1)
						location.reload();
					
					var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_72);
	
					var _packet_id = parseInt(getDecryptedData_mas['packet_id']);
					var _user_id = getDecryptedData_mas['user_id'];	
					var list_mas = getDecryptedData_mas['list_mas'];						
					var while_data = getDecryptedData_mas['while_data'];
					var pencil_data = getDecryptedData_mas['pencil_data'];
					var reload = parseInt(getDecryptedData_mas['reload']);
					var list_add_to_friend = getDecryptedData_mas['list_add_to_friend'];

					var dump_getDecryptedData_mas_str = dump(getDecryptedData_mas);
				
					log('dump_getDecryptedData_mas_str=' + dump_getDecryptedData_mas_str);//loger...						
					
					if(reload == 1)
						location.reload();
					
					if(list_mas)
					{
						log('longPoolInretval 1 list_mas OK =' + user_id);//loger...	
						
						if(list_mas.length)
						{
							log('list_mas 1 length=' + list_mas.length);//loger...
							
							if(packet_id == _packet_id && user_id == _user_id && user_id > 0)
							{
								log('longPoolInretval 1 list_mas OK =' + user_id);//loger...							
							
								for(var k = 0; k < list_mas.length; k++)
								{	
									
									if(list_mas[k]['online'] == 1)
										$('.online_td[user_id="' + list_mas[k]['user_id'] + '"]').html('<span class="online"><i class="fa fa-circle" aria-hidden="true"></i></span>');
									else	
										$('.online_td[user_id="' + list_mas[k]['user_id'] + '"]').html('<span class="offline"><i class="fa fa-circle" aria-hidden="true"></i></span>');
										
					
								}					
							
								
								
								
							
							}
													
						
						}
					
					}
					
					if(list_add_to_friend)
					{
						log(list_add_to_friend, 'obj');//loger...	
						
						if(list_add_to_friend.length)
						{
							if(list_add_to_friend.length > 0)
							{
								log('list_add_to_friend DATA length=' + list_add_to_friend.length);//loger...
							
								var list_str = '';						
								
								var users_add = false;
							
								for(k = 0; k < list_add_to_friend.length; k++)
								{
									var add_user_id = parseInt(list_add_to_friend[k]['user_id']);
									
									var user_isset_in_look_list = false;
									
									$('.user_not_friend_el').each(function(){
									
										var user_id = parseInt($(this).attr('user_id'));
									
										if(user_id == add_user_id)
											user_isset_in_look_list = true;
									
									});
									
									if(!user_isset_in_look_list)
									{
										//Добавляем в подписчики событие с лонгпула от том, что к нам кто-то новый ломится
										log('NOT user_isset_in_look_list add_user_id=' + add_user_id);//loger...
										
										users_add = true;
										
										var friend_str = '<i class="fa fa-user-plus" contact_reload="1" aria-hidden="true" user_id="' + list_add_to_friend[k]['user_id'] + '" user_name="' + list_add_to_friend[k]['name'] + '" ></i>';			
										
										var online_str = '';
										
										if(list_add_to_friend[k]['online'] == 1)
										{
											online_str = '<span class="online"><i class="fa fa-circle" aria-hidden="true"></i></span>';
											$('.online_td[user_id="' + list_add_to_friend[k]['user_id'] + '"]').html('<span class="online"><i class="fa fa-circle" aria-hidden="true"></i></span>');
										}							
										else	
										{
											online_str = '<span class="offline"><i class="fa fa-circle" aria-hidden="true"></i></span>';
											$('.online_td[user_id="' + list_add_to_friend[k]['user_id'] + '"]').html('<span class="offline"><i class="fa fa-circle" aria-hidden="true"></i></span>');	
										}														
																															
											
										list_str += '<div class="user_not_friend_el" new="1" user_id="' + list_add_to_friend[k]['user_id'] + '"><table width="100%"><tr><td width="20px" align="center" class="online_td" user_id="' + list_add_to_friend[k]['user_id'] + '">' + online_str + '</td><td><div class="_" user_id="' + list_add_to_friend[k]['user_id'] + '">' + list_add_to_friend[k]['name'] + ' <span class="new_not_friend">New</span></div></td><td align="right" width="20px" class="in_friend">' + '</td><td align="right" width="20px">' + friend_str + '</td></tr></table></div>';										
										
									}
			

								}
								
								if(users_add)
								{
									event_user_add = true;
									soundGo('add_friend');
								
								}
									
								
								$('#data_contacts_box').append(list_str);	

							}

						}		
					
					}
					
					if(pencil_data)
					{
						log(pencil_data, 'obj');//loger...	
					
						if(pencil_data.length)
						{
							if(pencil_data.length > 0)
							{	
								log('pencil_data length=' + pencil_data.length);//loger...
								
								for(p = 0; p < pencil_data.length; p++)
								{
									var p_user_id = parseInt(pencil_data[p]['user_id']);									
									
									var data_list_msg = $('#data_list_msg');
									
									var user_id_act = parseInt($('.abs_msg_con', data_list_msg).attr('user_id'));//Активный пользователь (ему мы сейчас отправим сообщение)											
					
									if(user_id_act == p_user_id)
									{
										log('pencil_data p_user_id=' + p_user_id);//loger...
																												
										$('#pencil').css('display', 'block').css('opacity', '1');
										
										window.setTimeout(function(){
										
																	
											$('#pencil').animate({
												opacity: 0
											  }, 400, function() {
											
												$('#pencil').css('display', 'none')
										
												
											  });						
										
										}, 4000);										
									
									}
					
				
										
								
								
								}
							}

						}		
					
					}
					
					if(while_data)
					{
									
						log(while_data, 'obj');//loger...	
					
						log('longPoolInretval 1 while_data OK =' + user_id);//loger...	
						
						if(while_data.length)
						{
							if(while_data.length > 0)
							{
								log('WHILE DATA MSG length=' + while_data.length);//loger...
							
								for(w = 0; w < while_data.length; w++)
								{
									var _type = while_data[w]['type'];									
									var _user_from_id = while_data[w]['user_from_id'];		
										
										
									log('_type=' + _type);//loger...										
									log('_user_from_id=' + _user_from_id);//loger...							
			
									
									if(_type == 'atom_0')
									{
										//У нас атом сообщения - а значит мы уже получили метаинформацию по сообщению..
															
										var _crypto_line = parseInt(while_data[w]['crypto_line']);					
										var _msg_packet_key = while_data[w]['msg_packet_key'];
										var _number_atom = while_data[w]['number_atom'];
										var _body = while_data[w]['body'];
																				
										log('_crypto_line=' + _crypto_line);//loger...
										log('_msg_packet_key=' + _msg_packet_key);//loger...	
										log('_number_atom=' + _number_atom);//loger...	
										log('_body=' + _body);//loger...	
																				
										var data_list_msg = msgs_mas[_user_from_id + '']['data_list_msg'];
										
										var count_data_list_msg = data_list_msg.length;
										
										for(var m = 0; m < count_data_list_msg; m++)
										{
											if(data_list_msg[m]['msg_packet_key'] == _msg_packet_key)
											{
												log('msg_packet_key_OK_ ');//loger...	
											
												//
												
												var count_atoms = parseInt(data_list_msg[m]['count_atoms']);
												
												log('count_atoms =' + count_atoms);//loger...
												
												if(count_atoms == 1)
												{
													//Из метаинформации по сообщению известно, что атом у него один - значит мы получили все
													//Дешифруем тело атом, отразим текст и отправим на сервер статус сообщения тип что оно прочитано
													
													var sync_key = data_list_msg[m]['decrypt_sync_key_data'];												
													
													
													_body = decodeURIComponent(_body);						
													_body = _body.replaceAll('&quot;', '"');	
													_body = _body.replaceAll('@@p@@', '+');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел		
													_body = _body.replaceAll('@@pr@@', ' ');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел														
													
													log('_body=' + _body);//loger...	
													
													sync_key = sync_key.toString();	

													log('sync_key=' + sync_key);//loger...	
													log('_msg_packet_key=' + _msg_packet_key);//loger...	
													
													var key_p =  CryptoJS.enc.Hex.parse(sync_key);
													var iv =  CryptoJS.enc.Hex.parse(_msg_packet_key);													

													var decrypted = CryptoJS.AES.decrypt(_body, key_p, {iv: iv});
													
													log('decrypted=' + decrypted);//loger...	
													
													decrypted = UtfCorrect(decrypted.toString(CryptoJS.enc.Utf8));	
													
													log('decrypted !!!=' + decrypted);//loger...	

													//log('wwwwwww/' + decrypted + '/' + key_p + '/' + iv);//loger...	
														
													
													if(decrypted != "")
													{
														//Все хокейно - сообщение расшифровали - 
														
														log('_msg_packet_key=' + _msg_packet_key);//loger...	
														
														var msg_el = $('.msg_clss_to[msg_packet_key="' + _msg_packet_key + '"]');
														
														//работаем с реплаями
														//==================================
														
														//alert(decrypted);
														
														var r_decrypted_mas = decrypted.split('@@rr@@');
														
														if(r_decrypted_mas)
														{
															if(r_decrypted_mas.length)
															{
																if(r_decrypted_mas.length == 2)
																{
																	decrypted = r_decrypted_mas[0];
																	var replays = r_decrypted_mas[1];
																
																	decrypted = '<div style="border:1px solid #0000ff">' + replays + '</div>' + decrypted;
																}															
															
															}
															
														}
														
														//==================================
														
														$('.preload_msg_data', msg_el).html(decrypted);
														$('.msg_clss_in_l', msg_el).css('background-color', '#FFEFDB');
														$('.preload_msg_status_send', msg_el).html('');
														$('.preload_msg_time', msg_el).css('right', '5px');
														
														if(_crypto_line == 1)
															$('.fa-paper-plane-abs', msg_el).css('display', 'block');
														
														$(msg_el).attr('state', 'to_look_1');
														
														//А коли так - наверное стоит оповестить об этом сервер, чтобы чел на том конце понял, что до нас дошло (поставим там галочку..)
														//Заодно нужно, чтобы если вкладка в фокусе - отправился статус о прочтении, чтобы на том конце поставилась вторая галочка..
														
														$(msg_el).attr('user_from_id', _user_from_id);
														
														setStatusMsg(_msg_packet_key, _user_from_id, 'to_look_1');//Сообщение доставлено юзеру (для сквозного шифрования)
														
														var event_need = true;														
																	
														var height_set = $('.abs_msg_con[user_id="' + _user_from_id + '"]').height() + 50000;
														
														$('.abs_msg_con[user_id="' + _user_from_id + '"]').animate({ scrollTop: height_set }, 200);
														
														if(focus_g == 1)
														{
															//Вкладка в фокусе
															
															if(menu_state == 'msgs')
															{
																//У нас открыто окно сообщений
																
																var act_user_id = $('#online_td_msg').attr('user_id');														
																
																if(act_user_id == _user_from_id)//Мы говорим с тем, кто прислал сообщение
																	event_need = false;
															
															}														
														
														
														}												

														
														if(event_need)
														{
															$(msg_el).attr('read', '0');														
																												
															event_new_msg = true;
															soundGo('new_msg');
															
														}
														else
														{
															$(msg_el).attr('read', '1');

														}	
														
													}
													
													//var decrypted = CryptoJS.AES.decrypt(_body, sync_key, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8);//дешифруем
													
													//log('decrypted=' + decrypted);//loger...
													
												
												}
												else
												{
													//У нас многоатомная структура
												
												}
												
											
											}
										
										
										}
										
										
										
									}
									
									
									if(_type == 'not_line')
									{
										//У нас есть непрочтенные сообщения от несквозного шифрования
										
										var obj_data_mas = while_data[w]['obj_data_mas'];
										
											
										for(var m = 0; m < obj_data_mas.length; m++)
										{
											var user_from_set = obj_data_mas[m]['user_from'];
											
											window.setTimeout(function(){
											
												$('.user_el[user_id="' + user_from_set + '"]').attr('msg', '1');	
												event_load_msg = true;
												soundGo('new_msg');													
											
											
											}, 500);												
											
															

										
										}	
									
									}									
									
									if(_type == 'msg_4')
									{
										//У нас есть доставленное сообщение
										
										var _msg_packet_key = while_data[w]['packet_key'];
										
										log('_msg_packet_key=' + _msg_packet_key);//loger...
										
										var msg_el = $('.msg_clss_from[msg_packet_key="' + _msg_packet_key + '"]');

										$('.preload_msg_status_send', msg_el).html('<i class="fa fa-arrow-circle-o-left" id="loader_0" style="font-size:13px" aria-hidden="true">');										
									
									}
									
									if(_type == 'msg_6')
									{
										//У нас есть доставленное сообщение
										
										var _msg_packet_key = while_data[w]['packet_key'];
										
										log('_msg_packet_key=' + _msg_packet_key);//loger...
										
										var msg_el = $('.msg_clss_from[msg_packet_key="' + _msg_packet_key + '"]');

										$('.preload_msg_status_send', msg_el).html('<i class="fa fa-arrow-circle-left" id="loader_0" style="font-size:13px" aria-hidden="true">');										
									
									}									
									
									
									if(_type == 'msg_0')
									{
										var _msg_packet_key = while_data[w]['packet_key'];
										var _crypto_line = while_data[w]['crypto_line'];
										var _count_atoms = while_data[w]['count_atoms'];
										var _user_from_name = while_data[w]['user_from_name'];
										var _type_send = while_data[w]['type_send'];
										var _time = while_data[w]['time'];
																			
										
										
										log('_msg_packet_key=' + _msg_packet_key);//loger...
										log('_crypto_line=' + _crypto_line);//loger...
										log('_count_atoms=' + _count_atoms);//loger...
										log('_user_from_name=' + _user_from_name);//loger...
										log('_type_send=' + _type_send);//loger...
										log('_time=' + _time);//loger...
	

										if(_crypto_line == 1)
										{
											log('СКВОЗНОЕ ШИФРОВАНИЕ');//loger...
										
											var _encrypt_sync_key_data = while_data[w]['encrypt_sync_key_data'].toString();	
											
											log('_encrypt_sync_key_data=' + _encrypt_sync_key_data);//loger...		

											_encrypt_sync_key_data = decodeURIComponent(_encrypt_sync_key_data);
											
											_encrypt_sync_key_data = _encrypt_sync_key_data.replaceAll('@@p@@', '+');
											_encrypt_sync_key_data = _encrypt_sync_key_data.replaceAll('@@pr@@', ' ');											
											
											log('_encrypt_sync_key_data=' + _encrypt_sync_key_data);//loger...												
										
											log('privkey=' + _KeysA_1['privkey']);//loger...	
											//=========================================
					
											log('_encrypt_sync_key_data TEST=' + _encrypt_sync_key_data);//loger...		
											log('privkey TEST=' + _KeysA_1['privkey']);//loger...	
											
											//=========================================
											
											// Create the encryption object.
											var crypt = new JSEncrypt();		

											// Set the private.
											crypt.setPrivateKey(_KeysA_1['privkey']);	

												
									
											var decrypt_sync_key_data = crypt.decrypt(_encrypt_sync_key_data);	//.toString()											


										}
										else
										{	
											log('ОБЫЧНОЕ ШИФРОВАНИЕ');//loger...
											var decrypt_sync_key_data = while_data[w]['easysync_key_data'];

										}	

										
										log('decrypt_sync_key_data=' + decrypt_sync_key_data);//loger...	
						
										
										//У нас сообщение, которое мы еще не получили.. атомы по сообщению будем получать только если подтвердим, что метаинформацию получили..
										//Поэтому добавим в массив новые данные и отправим на сервер подтверждение.. там сообщение перейдет в статус 2.. после чего потекут атомы сообщения
										
										if(msgs_mas[_user_from_id])
										{
											//Юзер уже чет нам отослал.. или мы ему.. похер										
							
										}
										else
										{
											var data_list_msg = new Array();
											
											var data_list_msg_box = new Object();
											data_list_msg_box['data_list_msg'] = data_list_msg;
											data_list_msg_box['crypto_line'] = true;
											
											msgs_mas[_user_from_id] = data_list_msg_box;											
										
										}
										

										var count_decrypt_sync_key_data = decrypt_sync_key_data.length;
										
										log('count_decrypt_sync_key_data=' + count_decrypt_sync_key_data);//loger...
										
										
										if(count_decrypt_sync_key_data == 32)
										{
											var msg_id = getNextAutoIncrementId();
											
											var msg_el = new Object();
											msg_el['user_from'] = '1';
											msg_el['time'] = _time;
											msg_el['type'] = 'msg_0';
											msg_el['type_send'] = 'msg';
											msg_el['msg_time_add'] = getTimeBrowserSec();
											msg_el['msg_id'] = msg_id;
											msg_el['msg_packet_key'] = _msg_packet_key;
											msg_el['count_atoms'] = _count_atoms;
											msg_el['status'] = '0';//статус сообщения, по которому получена метаинформация, но само тело еще нет
											msg_el['decrypt_sync_key_data'] = decrypt_sync_key_data;//Синхронный ключ, который мы расшифровали нашим приватным ключем и теперь им будем расшифровывать полученное большое сообщение
											msg_el['no_crypto_line_data'] = 0;

											
											msgs_mas[_user_from_id]['data_list_msg'].push(msg_el);										
											
											
											//=================================
											
											log('<div style="color:#ff0000">msgPaint</div>');//loger...
											
											msgPaint(_user_from_id, _user_from_name);//Отрисовываем сообщения, которые не отрисованы 	
											
											//=================================					
											
											
											//Отошлем запрос на то, что мы готовы принять данные по этому сообщению
											
											setStatusMsg(_msg_packet_key, _user_from_id, 'meta_load');
											
											
											
										
										}
										else
											log('count_decrypt_sync_key_data ERROR');//loger...		

									
									}
								
								
								}
							
							
							}
							
							
						
													
						
						}
					
					}					

					
				}});	
					
			}
			else
				log('sync_key_b_1 ERROR sendMsg');//loger...				
			
			
			
		
		}
		

		function preCorrect(str)
		{
			str = str.replaceAll('г', '@@g@@');	
		
			return str;
		}	

		function UtfCorrect(str)
		{
			str = str.replaceAll('@@g@@', 'г');	
		
			return str;
		}			
		
		function sendAtomEasy(sendDate)
		{
			/*
			
				var sendDate = new Object();
				sendDate['to_user'] = to_user;
				sendDate['data_msg'] = data_msg;													
				sendDate['number_atom'] = 1;
				sendDate['count_atoms'] = count_atoms;//1
				sendDate['packet_key_msg'] = packet_key_for_return_send_sync;//packet_key сообщения
				sendDate['key_s_a_72'] = key_s_a_72_for_sync.toString();//То чем кодируем			
			
			
			*/
			
			log('sendAtomEasy...');//loger...	
									
			var packet_id = getNextAutoIncrementId();
			
			log('packet_id=' + packet_id);//loger...		

			var packet_key = getUnicKeyPacket(packet_id);
			
			log('packet_key=' + packet_key);//loger...		
						
			var key_s_a_5 = getSKey(packet_id);
			
			var crypto_line = sendDate['crypto_line'];
			var crypto_line_int = 1;
			
			var key_s_a_5_for_send_sync = '';	
				
			if(crypto_line)
			{
				//Отправляем сквозным шифрованием
				log('Отправляем сквозным шифрованием');//loger...
				
				key_s_a_5_for_send_sync = 'key_s_a_5_for_send_sync';
			}
			else
			{
				//Отправляем обычным шифрованием
				log('Отправляем обычным шифрованием');//loger...
				
				crypto_line_int = 0;
				key_s_a_5_for_send_sync = 'easysinc_key';
			}
			
			var packet_key_msg = sendDate['packet_key_msg'];
			var data_msg = sendDate['data_msg'];

			log('key_s_a_5_for_send_sync type=' + key_s_a_5_for_send_sync);//loger...	
			log('key_s_a_5_for_send_sync=' + sendDate[key_s_a_5_for_send_sync]);//loger...	
			
			log('data_msg=' + data_msg);//loger...	

			var sync_key = sendDate[key_s_a_5_for_send_sync];
			var iv =  packet_key_msg;
			
			log('sync_key encode=' + sync_key);//loger...	
			log('iv encode=' + iv);//loger...				
			
			var data_atom_encoding = getEncryptedStr(data_msg, sync_key, iv);	//Шифруем данные атома синхронным ключем	
			
			log('data_atom_encoding=' + data_atom_encoding);//loger...		
			
			var sync_key = CryptoJS.enc.Hex.parse(sendDate[key_s_a_5_for_send_sync]);
			var iv =  CryptoJS.enc.Hex.parse(packet_key_msg);
			
			log('sync_key decode=' + sync_key);//loger...	
			log('iv decode=' + iv);//loger...				
			
			//===============================
			//===============================			
			
			log('TEST_3_START Расшифруем для проверки');//loger...						
			
			//var getData_mas = jQuery.parseJSON(msg);	
		//	var encrypted_data = getData_mas['encrypted_data'];	
		
			log('data_atom_encoding_1=' + data_atom_encoding);//loger...		
			
			data_atom_encoding = decodeURIComponent(data_atom_encoding);						
			data_atom_encoding = data_atom_encoding.replaceAll('&quot;', '"');	
			data_atom_encoding = data_atom_encoding.replaceAll('@@p@@', '+');
			data_atom_encoding = data_atom_encoding.replaceAll('@@pr@@', ' ');	
				
			log('data_atom_encoding=' + data_atom_encoding);//loger...	
				
			var decrypted = CryptoJS.AES.decrypt(data_atom_encoding, sync_key, {iv:iv});
					
			log('decrypted=' + decrypted);//loger...		
			
			decrypted = UtfCorrect(decrypted.toString(CryptoJS.enc.Utf8));		
			
			log('decrypted=' + decrypted);//loger...	
			
			if(decrypted != "")
				log('<div style="background-color:#00ff00; width:100px">&nbsp;</div>');//loger...	
			else		
				log('<div style="background-color:#ff0000; width:100px">&nbsp;</div>');//loger...	
				
			log('TEST_3_END');//loger...		
			
			//===============================
				
			
				
			var send_data = new Object();
			send_data['sid'] = sid;
			send_data['packet_key'] = packet_key;
			send_data['key_s_a_5'] = key_s_a_5.toString();//Передадим синхронный ключ для зашифровки длинных данных
			send_data['packet_key_msg'] = packet_key_msg;
			send_data['number_atom'] = sendDate['number_atom'];
			send_data['count_atoms'] = sendDate['count_atoms'];
			send_data['to_user'] = sendDate['to_user'];
			send_data['data_atom_encoding'] = data_atom_encoding;			
			send_data['crypto_line_int'] = crypto_line_int;	
			
			log('key_s_a_5 1=' + send_data['key_s_a_5']);//loger...	
			
			var send_str = JSON.stringify( send_data );
			
			send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
			send_str = send_str.replaceAll(' ', '@@pr@@');	
			send_str = encodeURIComponent(send_str);//Кодируем для URL						
			
			var data_str = send_str + '@';	

			if(data_key_crypt != '')
			{
				var encrypted = getEncryptedStr(data_str, data_key_crypt);				
				
				$.ajax({						
				type: 'POST',
				url: 'setAtom.php',
				data: 'encrypted=' + encrypted,
				async: true,
				success: function(msg){
				
					log('setAtom msg=' + msg);//loger...	
					
					var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_5);

					var _packet_key = getDecryptedData_mas['packet_key'];
				
					if(packet_key == _packet_key)
					{
						log('packet_key setAtom OK');//loger...	
						
						//Если шифрование не сквозное - можно пометить, что сообщение доставлено
						
						if(crypto_line_int != 1)
						{
							//setStatusMsg(packet_key_msg, user_id, 'to_look_1');//Сообщение доставлено на сервер (для НЕ сквозного шифрования)
							
							var msg_el = $('.msg_clss_from[msg_packet_key="' + packet_key_msg + '"]');

							$('.preload_msg_status_send', msg_el).html('<i class="fa fa-server" id="loader_0" style="font-size:13px" aria-hidden="true">');	//Просто поставим иконку, что типа сообщение на сервере - статусность не меняем							

						}	
							
						
						//Закодированое синхронным ключем сообщение положено в базу - теперь дело за получателем
					
					}
					else
						log('packet_key setAtom ERROR');//loger...	

				

								
				}});		
								
				
			
			}
			else
				log('Нет ключа - необходимо авторизоваться');//loger...				
		
		}		
		
		
		function stopEventLoadMsg()
		{					
			event_load_msg = false;
			$('#title').text('Криптограм');
		
		}

		function stopEventNewMsg()
		{
			event_new_msg = false;
			$('#title').text('Криптограм');
		}
		
		function stopEventUserAdd()
		{
			event_user_add = false;
			$('#title').text('Криптограм');
		
		}		

		
		function eventInretval()
		{
			log('eventInretval...');//loger...	
		
			if(event_user_add)
			{
				if(focus_g == 1)
				{
					//Только фон меняем
				
					var background_color = $('.user_not_friend_el[new="1"]').attr('background_color');
					
					if(background_color == '1')
					{
						$('.user_not_friend_el[new="1"]').attr('background_color', '0');
						$('.user_not_friend_el[new="1"]').css('background-color', '#E2E2E2');
					}
					else
					{
						$('.user_not_friend_el[new="1"]').attr('background_color', '1');
						$('.user_not_friend_el[new="1"]').css('background-color', '#FFD700');
					
					}
					
				}
				else
				{
					//title меняем
					
					var title = $('#title').text();				
					
					if(title == 'Вас хотят добавить')
					{
						$('#title').text('Криптограм');
						
						$('.user_not_friend_el[new="1"]').css('background-color', '#E2E2E2');
					
					}
					else
					{
						$('#title').text('Вас хотят добавить');
						
						$('.user_not_friend_el[new="1"]').css('background-color', '#FFD700');
					
					}			
					
					log('title=' + title);//loger...						
					
				
				}
			

			
			}
			
			if(event_new_msg)
			{
				//Сначала узнаем где у нас msg=1
				
				$('.user_el').attr('msg', '0');//Сначала у всех контактов проставим, что не пришло никаких сообщений
				
				//Переберем боксы
				
				$('.abs_msg_con').each(function(){
				
					var not_read_count = 0;
				
					$('.msg_clss_to[read=0]', this).each(function(){
					
						not_read_count++;
						
					});
					
					if(not_read_count > 0)
					{
						//Есть непрочитанные
						
						var user_id = $(this).attr('user_id');
						
						$('.user_el[user_id="' + user_id + '"]').attr('msg', '1');//Указываем, что сообщения есть
						$('.user_msg_count[user_id="' + user_id + '"]').html('[' + not_read_count + ']');//Указываем сколько непрочитанных
					
					}
				
					
				
				});
				
				//Теперь анимация
			
			
				if(focus_g == 1)
				{
					//Только фон меняем
				
					var background_color = $('.user_el[msg="1"]').attr('background_color');
					
					if(background_color == '1')
					{
						$('.user_el[msg="1"]').attr('background_color', '0');
						$('.user_el[msg="1"]').css('background-color', '#92D8F6');
					}
					else
					{
						$('.user_el[msg="1"]').attr('background_color', '1');
						$('.user_el[msg="1"]').css('background-color', '#FFD700');
					
					}
					
				}
				else
				{
					//title меняем
					
					var title = $('#title').text();				
					
					if(title == 'Новое сообщение')
					{
						$('#title').text('Криптограм');
						
						$('.user_el[msg="1"]').css('background-color', '#92D8F6');
					
					}
					else
					{
						$('#title').text('Новое сообщение');
						
						$('.user_el[msg="1"]').css('background-color', '#FFD700');
					
					}			
					
					log('title=' + title);//loger...						
					
				
				}
			

			
			}		

			if(event_load_msg)
			{
							
				if(focus_g == 1)
				{
					//Только фон меняем
				
					var background_color = $('.user_el[msg="1"]').attr('background_color');
					
					if(background_color == '1')
					{
						$('.user_el[msg="1"]').attr('background_color', '0');
						$('.user_el[msg="1"]').css('background-color', '#92D8F6');
					}
					else
					{
						$('.user_el[msg="1"]').attr('background_color', '1');
						$('.user_el[msg="1"]').css('background-color', '#FFD700');
					
					}
					
				}
				else
				{
					//title меняем
					
					var title = $('#title').text();				
					
					if(title == 'Непрочитанное сообщение')
					{
						$('#title').text('Криптограм');
						
						$('.user_el[msg="1"]').css('background-color', '#92D8F6');
					
					}
					else
					{
						$('#title').text('Непрочитанное сообщение');
						
						$('.user_el[msg="1"]').css('background-color', '#FFD700');
					
					}			
					
					log('title=' + title);//loger...						
					
				
				}
			

			
			}				
		
		}
		
		
		
		
		
		function queueInretval()
		{			
			key_k++;
			
			if(focus_g == 1)
			{			
				
				$('.msg_clss_to[state="to_look_1"]').each(function(){
				
					var msg_packet_key = $(this).attr('msg_packet_key');
					var user_from_id = $(this).attr('user_from_id');
					
					//Мы в фокусе, но сообщение будет прочтено только если юзер открывает окно с перепиской
					
					if(menu_state == 'msgs')
					{
						//У нас открыто окно сообщений
						
						var act_user_id = $('#online_td_msg').attr('user_id');														
						
						if(act_user_id == user_from_id)//Мы говорим с тем, кто прислал сообщение
							setStatusMsg(msg_packet_key, user_from_id, 'to_look_2');
					
					}
					
					
				
				});			
			
			}
				

		
			var count_queueEvents = queueEvents.length;		
		
			var queue_blocks_str = '';
			
			var del_mas = new Array();
			
			for(var k = 0; k < count_queueEvents; k++)
			{
				var type = queueEvents[k]['type'];				
				
				var status = queueEvents[k]['status'];
				
				var packet_id = parseInt(queueEvents[k]['packet_id']);
				var count = parseInt(queueEvents[k]['count']);				
				var dead_time = parseInt(queueEvents[k]['dead_time']);
				var _time = getTimeBrowserSec();
				
				var color = '00ff00';
				
				if(_time > dead_time)
				{
					//Пора умирать
				
					color = 'ff0000';
					
					del_mas.push(k);
					
					log('del k=' + k);//loger...	
					
					if(type == 'sendMsg')
					{
						log('type=' + type);//loger...	
					
						//помер пакет отправляемого сообщения Сообщение
						//Если статус не finished - скажем, что сообщение помре
						
						log('status=' + status);//loger...	
						log('packet_id=' + packet_id);//loger...	
						
						if(status != 'finished')
						{							
						
							$('#loader_' + packet_id).css('color', '#ff0000');
						
						
						}						
					
					}
				
				}
				else
				{
					if(type == 'sendMsg')
					{			
					
						if(status == 'init')//
						{
							log('sendMsg_init');//loger...	
						
							
							
														
							var queueEvents_msg_id = parseInt(queueEvents[k]['msg_id']);
							var queueEvents_packet_id = queueEvents[k]['packet_id'];
							var queueEvents_data_msg = queueEvents[k]['data']['msg'];
							var queueEvents_type_send = queueEvents[k]['type_send'];
							var queueEvents_init_time = queueEvents[k]['init_time'];
							var queueEvents_dead_time = queueEvents[k]['dead_time'];
							var to_user = parseInt(queueEvents[k]['data']['user_id']);
							var crypto_line = queueEvents[k]['data']['crypto_line'];
							
							log('k=' + k);//loger...	
							log('packet_id=' + queueEvents_packet_id);//loger...	
							log('msg=' + queueEvents_data_msg);//loger...	
							log(queueEvents[k], 'obj');//loger...	
							log('to_user =' + to_user);//loger...								
							
							if(sync_key_b_1 != "")
							{	

								if(crypto_line)
								{
									//Отправляем сквозным шифрованием								
									queueEvents[k]['status'] = 'getPublicKey';
									
									//Получаем публичный ключ юзера, которому хотим отправить сообщение. Он записался в базу при его логине.	
										
									var packet_key_for_pub = getUnicKeyPacket(packet_id);
									
									//log('packet_key_for_pub=' + packet_key_for_pub + ' to_user=' + to_user);//loger...									
								
									var key_s_a_72 = getSKey(packet_id);
								
									var data_str = packet_key_for_pub + '@' + to_user + '@' + key_s_a_72 + '@' + sid + '@';
									
									var encrypted = getEncryptedStr(data_str, sync_key_b_1);
									
									$.ajax({						
									type: 'POST',
									url: 'getPublicKey.php',
									data: 'encrypted=' + encrypted,
									async: true,
									success: function(msg){
									
										log('getPublicKey.php msg=' + msg);//loger...	
										//log('packet_key_for_pub  after ' + packet_key_for_pub);//loger...										
										
										var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_72);
							
										var _packet_key = getDecryptedData_mas['packet_key'];
										var public_key = getDecryptedData_mas['public_key'];	
										
										log('Получаем публичный ключ юзера, которому хотим отправить сообщение. Он записался в базу при его логине.');//loger...	
										log('public_key OK =' + public_key);//loger...	
										
										
										public_key = decodeURIComponent(public_key);
										
										public_key = public_key.replaceAll('@@p@@', '+');
										public_key = public_key.replaceAll('@@pr@@', ' ');										

										//log('_packet_key 2=' + _packet_key);//loger...									
										
										if(_packet_key == packet_key_for_pub)
										{
											log('public_key OK after =' + public_key);//loger...	
										
											//Получили публичный ключ при логине того юзера, которому собрались отсылать сообщение
											
											//Генерим чисто для этой передачи ключ, шифруем открытым ключем целевого юзера, все это шифруем текущим синхронным ключем
											
											var packet_id = getNextAutoIncrementId();
											
											log('packet_id=' + packet_id);//loger...		

											var packet_key_for_return_send_sync = getUnicKeyPacket(packet_id);
											
											log('packet_key_for_return_send_sync=' + packet_key_for_return_send_sync);//loger...

											$('.msg_clss_from[msg_id="' + queueEvents_msg_id + '"]').attr('msg_packet_key', packet_key_for_return_send_sync);											
												
											var key_s_a_72_for_sync = getSKey(packet_id);
												
											var key_s_a_5_for_send_sync = getSKey(key_s_a_72_for_sync + packet_id + packet_key_for_return_send_sync + '');//Ключ, который мы передадим целевому юзеру для того, чтобы он смог расшифровать наше длинное сообщение
											
											key_s_a_5_for_send_sync = key_s_a_5_for_send_sync.toString();//БЛЯТЬ БЕЗ ЭТОГО НЕ РАБОТАЕТ СУКА . полу утра убил на поиск этой хуйни
											
											//key_s_a_5_for_send_sync = '63a9f0ea7bb98050796b649e85481845';
											
											log('key_s_a_5_for_send_sync ' + key_s_a_5_for_send_sync);//loger...	
											
											var crypt_send_ex = new JSEncrypt();
											crypt_send_ex.setPublicKey(public_key);	
										
											var encrypt_sync_key_by_public_key_target_user = crypt_send_ex.encrypt(key_s_a_5_for_send_sync);//Шифруем данные, среди которых синхронный ключ
											
											log('encrypt_sync_key_by_public_key_target_user encrypt=' + encrypt_sync_key_by_public_key_target_user);//loger...	
																					
											//То что закодили открытым ключем юзера теперь кодим нашим текущим сессионным с сервером синхронным
																			

											//=============================================
											
											if(data_key_crypt != '')
											{
												//Наш синхронный послелогинный ключ есть
												
												
												var data_msg = queueEvents_data_msg;
												var type_send = queueEvents_type_send;
												var init_time = queueEvents_init_time;
												var dead_time = queueEvents_dead_time;//Эти данные взяты по умолчанию из функции при добавлении
												
												
												log('setSyncForMsg OK !!!');//loger...

												log('data_msg=' + data_msg);//loger...	
												log('type_sendg=' + type_send);//loger...	

												var count_atoms = Math.ceil(data_msg.length/count_symbol_in_atom); 	
												
												log('count_atoms=' + count_atoms);//loger...	
												
												log('dead_time из элемента события=' + dead_time);//loger...	
														
												var new_dead_time = init_time + parseInt(one_time_dead) * parseInt(count_atoms);//Переопределяем время жизни сообщения, с учетом составных частей
												
												log('init_time=' + init_time);//loger...					
												
												if(new_dead_time > 0)
												{
													queueEvents_dead_time = new_dead_time;
													dead_time = new_dead_time;
													
													log('new_dead_time=' + new_dead_time);//loger...	
												}
												
												var dead_server_time_str = dead_time + time_delta_int;
												
												log('dead_server_time_str=' + dead_server_time_str);//loger...	
												
												var send_data = new Object();
												send_data['sid'] = sid;
												send_data['packet_key'] = packet_key_for_return_send_sync;
												send_data['encrypt_sync_key_by_public_key_data'] = encrypt_sync_key_by_public_key_target_user;
												send_data['key_s_a_72'] = key_s_a_72_for_sync.toString();
												send_data['to_user'] = to_user;
												send_data['crypto_line'] = 1;
												send_data['type_send'] = type_send;
												send_data['count_atoms'] = count_atoms;
												send_data['dead_time'] = dead_server_time_str;
												
												var send_str = JSON.stringify( send_data );
												
												send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел
												send_str = send_str.replaceAll(' ', '@@pr@@');	
												send_str = encodeURIComponent(send_str);//Кодируем для URL						
												
												var for_crypt_text = send_str + '@';													
																		
												log('for_crypt_text=' + for_crypt_text);//loger...	
												
												var encrypted_for_sync = getEncryptedStr(for_crypt_text, data_key_crypt);
												
												log('encrypted_for_sync=' + encrypted_for_sync);//loger...	
												
												$.ajax({						
												type: 'POST',
												url: 'setSyncForMsg.php',
												data: 'encrypted=' + encrypted_for_sync,
												async: true,
												success: function(msg){
												
													log('setSyncForMsg.php msg=' + msg);//loger...	
													
													var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_72_for_sync);
											
													var _packet_key = getDecryptedData_mas['packet_key'];		
													//var _dead_time = getDecryptedData_mas['dead_time'];	
													
													//log('_dead_time=' + _dead_time);//loger...
													
													if(_packet_key == packet_key_for_return_send_sync)
													{
														log('setSyncForMsg OK !!!');//loger...
														
														//Сделали запись шифрованного синхронного ключа для текущей передачи в базу
														//Так же нам известно количество пакетов и тип отсылаемого сообщения

														//можно ставить в очередь атомов, если их много
																										
														if(count_atoms > 1)
														{
														
														}
														else
														{
															//работаем на простом уровне
															
															log('Простой загрузчик');//loger...	
															
															data_msg = preCorrect(data_msg);
															
															var sendDate = new Object();
															sendDate['to_user'] = to_user;
															sendDate['crypto_line'] = true;
															sendDate['data_msg'] = data_msg;//Пока не зашифрованные данные атома												
															sendDate['number_atom'] = 1;
															sendDate['count_atoms'] = count_atoms;//1
															sendDate['packet_key_msg'] = packet_key_for_return_send_sync;//packet_key сообщения
															sendDate['key_s_a_5_for_send_sync'] = key_s_a_5_for_send_sync.toString();//То чем кодируем
															
															sendAtomEasy(sendDate);
														
														
														}

														/*
														var sendDate = new Object();
														sendDate['to_user'] = to_user;
														sendDate['count_atoms'] = count_atoms;
														sendDate['data_msg'] = data_msg;
														addSendAtoms(sendDate);
														
														*/
														
														

														
													}	


													

												}});		
											
											
											}		
											else
											{
												log('Нет ключа - необходимо авторизоваться');//loger...	
											
											}
											
										
										}
										else
											log(_packet_key + ' != ' + packet_key + ' public_key ERROR ');//loger...	
										
										
									}});										
									
								}
								else
								{
									//Отправляем обычным шифрованием							
									queueEvents[k]['status'] = 'getEasySyncKey';
									
									var packet_key_for_easysync = getUnicKeyPacket(packet_id);
									
									//log('packet_key_for_easysync=' + packet_key_for_easysync + ' to_user=' + to_user);//loger...									
								
									var key_s_a_72 = getSKey(packet_id);
								
									var data_str = packet_key_for_easysync + '@' + to_user + '@' + key_s_a_72 + '@' + sid + '@';
									
									var encrypted = getEncryptedStr(data_str, sync_key_b_1);
									
									$.ajax({						
									type: 'POST',
									url: 'getEasySincKey.php',
									data: 'encrypted=' + encrypted,
									async: true,
									success: function(msg){
									
										log('getEasySincKey.php msg=' + msg);//loger...	
										//log('packet_key_for_easysync  after ' + packet_key_for_easysync);//loger...										
										
										var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_72);
							
										var _packet_key = getDecryptedData_mas['packet_key'];
										var easysinc_key = getDecryptedData_mas['easysinc_key'];	
										
										log('Получаем синхронный ключ, которым зашифруем сообщение. оно будет не сквозным и сохранится в базе, а юзер его прочтет как зайдет в свой аккаунт');//loger...	
										log('easysinc_key OK =' + easysinc_key);//loger...	
										
										
										easysinc_key = decodeURIComponent(easysinc_key);
										
										easysinc_key = easysinc_key.replaceAll('@@p@@', '+');
										easysinc_key = easysinc_key.replaceAll('@@pr@@', ' ');										

										//log('_packet_key 2=' + _packet_key);//loger...									
										
										if(_packet_key == packet_key_for_easysync)
										{
											log('easysinc_key OK after =' + easysinc_key);//loger...												
											
											var data_msg = queueEvents_data_msg;	
											var type_send = queueEvents_type_send;
											
											var packet_id = getNextAutoIncrementId();
											
											log('packet_id=' + packet_id);//loger...		

											var packet_key_for_return_send_sync = getUnicKeyPacket(packet_id);
											
											log('packet_key_for_return_send_sync=' + packet_key_for_return_send_sync);//loger...

											$('.msg_clss_from[msg_id="' + queueEvents_msg_id + '"]').attr('msg_packet_key', packet_key_for_return_send_sync);											
												
											var key_s_a_72_for_sync = getSKey(packet_id);							

											var count_atoms = Math.ceil(data_msg.length/count_symbol_in_atom); 	
											
											log('count_atoms=' + count_atoms);//loger...													
											
											var send_data = new Object();
											send_data['sid'] = sid;
											send_data['packet_key'] = packet_key_for_return_send_sync;
											send_data['key_s_a_72'] = key_s_a_72_for_sync.toString();
											send_data['to_user'] = to_user;
											send_data['crypto_line'] = 0;
											send_data['type_send'] = type_send;
											send_data['count_atoms'] = count_atoms;
											send_data['dead_time'] = 0;		

											var send_str = JSON.stringify( send_data );
											
											send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел
											send_str = send_str.replaceAll(' ', '@@pr@@');	
											send_str = encodeURIComponent(send_str);//Кодируем для URL						
											
											var for_crypt_text = send_str + '@';													
																	
											log('for_crypt_text=' + for_crypt_text);//loger...	
											
											var encrypted_for_sync = getEncryptedStr(for_crypt_text, data_key_crypt);
											
											log('encrypted_for_sync=' + encrypted_for_sync);//loger...	
											
											$.ajax({						
											type: 'POST',
											url: 'setSyncForMsg.php',
											data: 'encrypted=' + encrypted_for_sync,
											async: true,
											success: function(msg){
											
												log('setSyncForMsg.php msg=' + msg);//loger...	
												
												var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_72_for_sync);
										
												var _packet_key = getDecryptedData_mas['packet_key'];		
												//var _dead_time = getDecryptedData_mas['dead_time'];	
												
												//log('_dead_time=' + _dead_time);//loger...
												
												if(_packet_key == packet_key_for_return_send_sync)
												{
													log('setSyncForMsg crypto_line false OK !!!');//loger...
																							
													//можно ставить в очередь атомов, если их много													
																												
													if(count_atoms > 1)
													{
													
													}
													else
													{
														//работаем на простом уровне
														
														log('Простой загрузчик');//loger...	
														
														var sendDate = new Object();
														sendDate['to_user'] = to_user;
														sendDate['crypto_line'] = false;
														sendDate['data_msg'] = data_msg;//Пока не зашифрованные данные атома												
														sendDate['number_atom'] = 1;
														sendDate['count_atoms'] = count_atoms;//1
														sendDate['packet_key_msg'] = _packet_key;//packet_key сообщения
														sendDate['easysinc_key'] = easysinc_key.toString();//То чем кодируем
														
														sendAtomEasy(sendDate);
													
													
													}
													

												}


											}});


											

											
										
										}
										else
											log(_packet_key + ' != ' + packet_key + ' easysinc_key ERROR ');//loger...	
											
											
											
									}});		
									
									
								}							
							

							}
							else
								log('sync_key_b_1 ERROR sendMsg');//loger...	
							

							

						
										
							

						}
					
					
					}
				
				}
			
				queue_blocks_str += '<div style="border:1px solid #' + color + '; width:200px; float:left; margin:2px;">' + _time + '/' + dead_time + '/' + status + '</div>';
							
			
			}
			
			var count_del = del_mas.length;
			
			for(var k = 0; k < count_del; k++)
			{
				log('del_mas=' + del_mas[k]);//loger...	
			
				queueEvents.splice(del_mas[k], 1);
			
			}
		
			$('#queue_box').html(queue_blocks_str);
		
		
		}
		
		function getUnicKeyPacket(packet_id)
		{
		
			var time = new Date().getTime();	
			var random = getRandomArbitary(10, 100000);		
				
			return hex_md5('' + packet_id  + sid + time + random);
		
		}
		
		function log(text, type_obj)
		{	

			
			if(log_display)
			{
				var date = new Date();
			
				if(type_obj === undefined) 
				{
					
					
					$('#log_box').prepend('<div class="log"><b>' + date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds() + '</b>: ' + text + '</div>');
					
					console.log(date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds() + ' : ' + text);
				}		
				else
				if(type_obj == 'obj')
				{
					var dump_str = dump(text);
					
					$('#log_box').prepend('<div class="log"><b>' + date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds() + '  [obj]</b>: ' + dump_str + '</div>');
					
					console.log(date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds() + ' [obj] : ' + text);
					
				}			
				else
				{
					console.log(date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds() + ' [' + type_obj + '] : undefined');				
				
				}
			

			}	
		
		}
		
		function getRandomArbitary(min, max)
		{
		  return Math.random() * (max - min) + min;
		}
		
		
		function getNextAutoIncrementId()
		{
			packet_id++;
			
			return packet_id;
		}
	
	/*
	
		function getPublicKey(packet_id, secret_p)
		{
			
			var data_for_get_public_key = packet_id + '@@@' + secret_p;
			
			
			$.ajax({						
			type: 'POST',
			url: '/report_export_call_all.php',
			data: 'sid=' + sid + '&val=' + val,
			async: true,
			success: function(msg){

				alert(msg);
					
			}});
			
			
			

		}	
	*/
	
		function getSKey(packet_id)
		{
			var time = new Date().getTime();	
			var random = getRandomArbitary(10, 100000);	
			var random2 = getRandomArbitary(10, 100000);		
			var key_s_a_5_md5 = hex_md5(time + random + packet_id + random2 + '');	
			return CryptoJS.enc.Hex.parse(key_s_a_5_md5);				
		
		}
		
		function getEncryptedStr(data_str, key_crypt, iv_crypt)
		{

			var key_p =  CryptoJS.enc.Hex.parse(key_crypt);
			var iv;
			
			if (iv_crypt === undefined) 
			{
				iv =  CryptoJS.enc.Hex.parse(sid);
			}			
			else
				iv =  CryptoJS.enc.Hex.parse(iv_crypt);
		
			//crypted
			var encrypted = CryptoJS.AES.encrypt(data_str, key_p, {iv:iv});
			//and the ciphertext put to base64
			encrypted = encrypted.ciphertext.toString(CryptoJS.enc.Base64);  
							
			encrypted = encrypted.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
			encrypted = encrypted.replaceAll(' ', '@@pr@@');	
			encrypted = encodeURIComponent(encrypted);//Кодируем для URL					
		
			return encrypted;

		}
		
		function timeSync()
		{
			//Синхронизируем время
			//Отошлем текущее время браузера на сервер.. вернем дельту. Эту дельту будем учитывать при получении времени

			var packet_id = getNextAutoIncrementId();
			
			log('packet_id=' + packet_id);//loger...		

			var packet_key = getUnicKeyPacket(packet_id);
			
			log('packet_key=' + packet_key);//loger...		
						
			var key_s_a_5 = getSKey(packet_id);
							
			var time_str = new Date().getTime() + '00000';
			time_str = time_str.substr(0,10);//В базе время смерти в секундах	
	
							
			var send_data = new Object();
			send_data['sid'] = sid;
			send_data['packet_key'] = packet_key;
			send_data['time_str'] = time_str;
			send_data['key_s_a_5'] = key_s_a_5.toString();//Передадим синхронный ключ для зашифровки длинных данных
			
			log('key_s_a_5 1=' + send_data['key_s_a_5']);//loger...	
			
			var send_str = JSON.stringify( send_data );
			
			send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел
			send_str = send_str.replaceAll(' ', '@@pr@@');	
			send_str = encodeURIComponent(send_str);//Кодируем для URL						
			
			var data_str = send_str + '@';	

			if(data_key_crypt != '')
			{
				var encrypted = getEncryptedStr(data_str, data_key_crypt);				
				
				$.ajax({						
				type: 'POST',
				url: 'getTimeSync.php',
				data: 'encrypted=' + encrypted,
				async: true,
				success: function(msg){
				
					log('getTimeSync msg=' + msg);//loger...	
					
					var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_5);

					var _packet_key = getDecryptedData_mas['packet_key'];
					time_delta_int = parseInt(getDecryptedData_mas['time_int']);					
					
					log('getTimeSync delta=' + time_delta_int);//loger...	delta=3726
					
					about_1 = getDecryptedData_mas['about_1'];		


								
				}});		
								
				
			
			}
			else
				log('Нет ключа - необходимо авторизоваться');//loger...					
		
		}
		
		function setOnline()
		{
			log('setOnline...');//loger...	
			
			if(user_id > 0)
			{
			
				var packet_id = getNextAutoIncrementId();
				
				log('packet_id=' + packet_id);//loger...		

				var packet_key = getUnicKeyPacket(packet_id);
				
				log('packet_key=' + packet_key);//loger...		
							
				var key_s_a_5 = getSKey(packet_id);
								
				var send_data = new Object();
				send_data['sid'] = sid;
				send_data['packet_key'] = packet_key;
				send_data['set_user_id'] = user_id;
				send_data['key_s_a_5'] = key_s_a_5.toString();//Передадим синхронный ключ для зашифровки длинных данных
				
				log('key_s_a_5 1=' + send_data['key_s_a_5']);//loger...	
				
				var send_str = JSON.stringify( send_data );
				
				send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
				send_str = send_str.replaceAll(' ', '@@pr@@');	
				send_str = encodeURIComponent(send_str);//Кодируем для URL						
				
				var data_str = send_str + '@';	

				if(data_key_crypt != '')
				{
					var encrypted = getEncryptedStr(data_str, data_key_crypt);				
					
					$.ajax({						
					type: 'POST',				
					url: 'setUserOnline.php',
					data: 'encrypted=' + encrypted,
					async: true,
					success: function(msg){
					
						log('setUserOnline msg=' + msg);//loger...	
						
						var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_5);

						var _packet_key = getDecryptedData_mas['packet_key'];
	
						
						if(packet_key == _packet_key)
						{

						
						}
						else
							log('packet_key setUserOnline ERROR');//loger...	

					

									
					}});		
									
					
				
				}
				else
					log('Нет ключа - необходимо авторизоваться');//loger...					
			
			
			}			
		
		}
		
		function getUserOnline(get_user_id)
		{
			
			log('getUserOnline...');//loger...	
			
			$('.online_td[user_id="' + get_user_id + '"]').html('&nbsp;');
									
			var packet_id = getNextAutoIncrementId();
			
			log('packet_id=' + packet_id);//loger...		

			var packet_key = getUnicKeyPacket(packet_id);
			
			log('packet_key=' + packet_key);//loger...		
						
			var key_s_a_5 = getSKey(packet_id);
							
			var send_data = new Object();
			send_data['sid'] = sid;
			send_data['packet_key'] = packet_key;
			send_data['get_user_id'] = get_user_id;
			send_data['key_s_a_5'] = key_s_a_5.toString();//Передадим синхронный ключ для зашифровки длинных данных
			
			log('key_s_a_5 1=' + send_data['key_s_a_5']);//loger...	
			
			var send_str = JSON.stringify( send_data );
			
			send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
			send_str = send_str.replaceAll(' ', '@@pr@@');	
			send_str = encodeURIComponent(send_str);//Кодируем для URL						
			
			var data_str = send_str + '@';	

			if(data_key_crypt != '')
			{
				var encrypted = getEncryptedStr(data_str, data_key_crypt);				
				
				$.ajax({						
				type: 'POST',				
				url: 'getUserOnline.php',
				data: 'encrypted=' + encrypted,
				async: true,
				success: function(msg){
				
					log('getUserOnline getUserOnline msg=' + msg);//loger...	
					
					var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_5);

					var _packet_key = getDecryptedData_mas['packet_key'];
					var _get_user_id = getDecryptedData_mas['get_user_id'];	
					var _online = getDecryptedData_mas['online'];		
					
					if(packet_key == _packet_key)
					{
						if(get_user_id == _get_user_id)
						{
							if(_online == 1)
								$('.online_td[user_id="' + _get_user_id + '"]').html('<span class="online"><i class="fa fa-circle" aria-hidden="true"></i></span>');
							else	
								$('.online_td[user_id="' + _get_user_id + '"]').html('<span class="offline"><i class="fa fa-circle" aria-hidden="true"></i></span>');	

						}	
					
					}
					else
						log('packet_key getUserOnline ERROR');//loger...	

				

								
				}});		
								
				
			
			}
			else
				log('Нет ключа - необходимо авторизоваться');//loger...		
		
		
		}
		
		function getListFriend()
		{
		
			$('#data_contacts_box').html('<center><div class="preloader_friend">&nbsp;</div></center>');			

			//Наш синхронный послелогинный ключ есть
									
			var packet_id = getNextAutoIncrementId();
			
			log('packet_id=' + packet_id);//loger...		

			var packet_key = getUnicKeyPacket(packet_id);
			
			log('packet_key=' + packet_key);//loger...		
						
			var key_s_a_5 = getSKey(packet_id);
							
			var send_data = new Object();
			send_data['sid'] = sid;
			send_data['packet_key'] = packet_key;
			send_data['key_s_a_5'] = key_s_a_5.toString();//Передадим синхронный ключ для зашифровки длинных данных
			
			log('key_s_a_5 1=' + send_data['key_s_a_5']);//loger...	
			
			var send_str = JSON.stringify( send_data );
			
			send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
			send_str = send_str.replaceAll(' ', '@@pr@@');	
			send_str = encodeURIComponent(send_str);//Кодируем для URL						
			
			var data_str = send_str + '@';	

			if(data_key_crypt != '')
			{
				var encrypted = getEncryptedStr(data_str, data_key_crypt);				
				
				$.ajax({						
				type: 'POST',
				url: 'getListFriend.php',
				data: 'encrypted=' + encrypted,
				async: true,
				success: function(msg){
				
					log('msg=' + msg);//loger...	
					
					var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_5);

					var _packet_key = getDecryptedData_mas['packet_key'];
					var list_mas = getDecryptedData_mas['list_mas'];	
					var list_2_mas = getDecryptedData_mas['list_2_mas'];		
					
					if(packet_key == _packet_key)
					{
						
					
						log('list_mas length=' + list_mas.length);//loger...		
						
						var list_str = '';
						
						//list_str += '<div style="color:#0000ff">Друзья:</div>';
						
						for(var k = 0; k < list_mas.length; k++)
						{							
									
							var friend_str = '<i class="fa fa-user-times" contact_reload="1" aria-hidden="true" user_id="' + list_mas[k]['user_id'] + '" user_name="' + list_mas[k]['name'] + '" ></i>';			
							
							var online_str = '';
							var in_friend_str = '';
							
							if(list_mas[k]['online'] == 1)
							{
								online_str = '<span class="online"><i class="fa fa-circle" aria-hidden="true"></i></span>';
								$('.online_td[user_id="' + list_mas[k]['user_id'] + '"]').html('<span class="online"><i class="fa fa-circle" aria-hidden="true"></i></span>');
							}							
							else	
							{
								online_str = '<span class="offline"><i class="fa fa-circle" aria-hidden="true"></i></span>';
								$('.online_td[user_id="' + list_mas[k]['user_id'] + '"]').html('<span class="offline"><i class="fa fa-circle" aria-hidden="true"></i></span>');	
							}
							
							if(list_mas[k]['in_friend'] == 1)
							{
								in_friend_str = '<i class="fa fa-smile-o" aria-hidden="true"></i></span>';
								
							}							
							else	
							{
								in_friend_str = '';	
							}
															
																												
								
							list_str += '<div class="user_el" user_id="' + list_mas[k]['user_id'] + '"><table width="100%"><tr><td width="20px" align="center" class="online_td" user_id="' + list_mas[k]['user_id'] + '">' + online_str + '</td><td><div class="user_setter" user_id="' + list_mas[k]['user_id'] + '"><div class="user_setter_name" user_id="' + list_mas[k]['user_id'] + '">' + list_mas[k]['name'] + '</div>&nbsp;</div></td><td align="right" width="20px" class="user_msg_count" user_id="' + list_mas[k]['user_id'] + '">&nbsp;</td><td align="right" width="20px" class="in_friend">' + in_friend_str + '</td><td align="right" width="20px">' + friend_str + '</td></tr></table></div>';

						}
						
						log('list_2_mas length=' + list_2_mas.length);//loger...	
						
						log('list_2_mas: ' + list_2_mas, 'obj');//loger...	

						list_str += '<div style="color:#808080; border-top:2px solid #92D8F6; margin-top: 5px; padding-top:5px">Подписчики:</div>';
						
						for(var k = 0; k < list_2_mas.length; k++)
						{							
									
							var friend_str = '<i class="fa fa-user-plus" contact_reload="1" aria-hidden="true" user_id="' + list_2_mas[k]['user_id'] + '" user_name="' + list_2_mas[k]['name'] + '" ></i>';			
							
							var online_str = '';
							
							if(list_2_mas[k]['online'] == 1)
							{
								online_str = '<span class="online"><i class="fa fa-circle" aria-hidden="true"></i></span>';
								$('.online_td[user_id="' + list_2_mas[k]['user_id'] + '"]').html('<span class="online"><i class="fa fa-circle" aria-hidden="true"></i></span>');
							}							
							else	
							{
								online_str = '<span class="offline"><i class="fa fa-circle" aria-hidden="true"></i></span>';
								$('.online_td[user_id="' + list_2_mas[k]['user_id'] + '"]').html('<span class="offline"><i class="fa fa-circle" aria-hidden="true"></i></span>');	
							}														
																												
								
							list_str += '<div class="user_not_friend_el" user_id="' + list_2_mas[k]['user_id'] + '"><table width="100%"><tr><td width="20px" align="center" class="online_td" user_id="' + list_2_mas[k]['user_id'] + '">' + online_str + '</td><td><div user_id="' + list_2_mas[k]['user_id'] + '">' + list_2_mas[k]['name'] + '</div></td><td align="right" width="20px" class="in_friend">' + '</td><td align="right" width="20px">' + friend_str + '</td></tr></table></div>';

						}						

						
						$('#data_contacts_box').html(list_str);				
					
					}
					else
						log('packet_key getUserOnline ERROR');//loger...	

				

								
				}});		
								
				
			
			}
			else
				log('Нет ключа - необходимо авторизоваться');//loger...			
	
		
		}		
		
		function initDemons()
		{
			if(demon_init)
			{
				log('initDemons init...');//loger...		
				
				window.interval_event = window.setInterval(eventInretval, event_time);
				window.interval_queue = window.setInterval(queueInretval, queue_time);
				window.interval_long_pool = window.setInterval(longPoolInretval, long_pool_time);
				
				longPoolInretval();			
			
			}
			else
				log('initDemons отключен (для тестов)...');//loger...	
		

		
		}
		
		function loadUserNotCryptoLineData(get_user_id)
		{	
			log('loadUserNotCryptoLineData get_user_id=' + get_user_id);//loger...	
			
			var packet_id = getNextAutoIncrementId();
			
			log('packet_id=' + packet_id);//loger...		

			var packet_key = getUnicKeyPacket(packet_id);
			
			log('packet_key=' + packet_key);//loger...		
						
			var key_s_a_5 = getSKey(packet_id);
							
			var send_data = new Object();
			send_data['sid'] = sid;
			send_data['packet_key'] = packet_key;
			send_data['get_user_id'] = get_user_id;
			send_data['from'] = 0;
			send_data['count'] = 10;
			send_data['key_s_a_5'] = key_s_a_5.toString();//Передадим синхронный ключ для зашифровки длинных данных
			
			log('key_s_a_5 1=' + send_data['key_s_a_5']);//loger...	
			
			var send_str = JSON.stringify( send_data );
			
			send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
			send_str = send_str.replaceAll(' ', '@@pr@@');	
			send_str = encodeURIComponent(send_str);//Кодируем для URL						
			
			var data_str = send_str + '@';	

			if(data_key_crypt != '')
			{
				var encrypted = getEncryptedStr(data_str, data_key_crypt);				
				
				$.ajax({						
				type: 'POST',				
				url: 'getUserNotCryptoLineData.php',
				data: 'encrypted=' + encrypted,
				async: true,
				success: function(msg){
				
					log('getUserNotCryptoLineData msg=' + msg);//loger...	
					
					var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_5);

					var _packet_key = getDecryptedData_mas['packet_key'];
					var _get_user_id = getDecryptedData_mas['get_user_id'];	
					var _user_from_name = getDecryptedData_mas['user_from_name'];	
					var no_crypto_line_data = getDecryptedData_mas['no_crypto_line_data'];		
					
					if(packet_key == _packet_key)
					{
						if(get_user_id == _get_user_id)
						{
							//$('.abs_msg_con[user_id=' + _get_user_id + ']').html('<div>loadUserNotCryptoLineData</div>');
							
							
							if(no_crypto_line_data)
							{
											
								log(no_crypto_line_data, 'obj');//loger...	
							
								log('no_crypto_line_data OK');//loger...	
								
								if(no_crypto_line_data.length)
								{
									if(no_crypto_line_data.length > 0)
									{
										log('no_crypto_line_data length=' + no_crypto_line_data.length);//loger...
										
										if(msgs_mas[_get_user_id])
										{
											//Юзер уже чет нам отослал.. или мы ему.. похер										
							
										}
										else
										{
											var list_data_list_msg = new Array();
											
											var data_list_msg_box = new Object();
											data_list_msg_box['data_list_msg'] = list_data_list_msg;
											data_list_msg_box['crypto_line'] = true;										
											
											msgs_mas[_get_user_id] = data_list_msg_box;		

											$('.abs_msg_con[user_id=' + _get_user_id + ']').html('');
										
										}											
									
										for(d = 0; d < no_crypto_line_data.length; d++)
										{
											var _msg_packet_key = no_crypto_line_data[d]['packet_key'];
											var _time = no_crypto_line_data[d]['time'];
											var _count_atoms = no_crypto_line_data[d]['count_atoms'];
											var _status = no_crypto_line_data[d]['status'];
											var _type_send = no_crypto_line_data[d]['type_send'];
											var _atoms_mas = no_crypto_line_data[d]['atoms_mas'];
											var _sync_key = no_crypto_line_data[d]['sync_key'];
											var _user_from = parseInt(no_crypto_line_data[d]['user_from']);
										
											
											log('_msg_packet_key=' + _msg_packet_key);//loger...
											log(_atoms_mas, 'obj');//loger...
										
											var msg_id = getNextAutoIncrementId();
											
											var msg_el = new Object();
											
											if(_user_from == _get_user_id)											
												msg_el['user_from'] = '1';
											else
												msg_el['user_from'] = '0';
											
											msg_el['time'] = _time;
											msg_el['type'] = 'msg_0';
											msg_el['type_send'] = _type_send;
											msg_el['msg_time_add'] = getTimeBrowserSec();
											msg_el['msg_id'] = msg_id;
											msg_el['msg_packet_key'] = _msg_packet_key;
											msg_el['count_atoms'] = _count_atoms;
											msg_el['status'] = _status;
											msg_el['atoms_mas'] = _atoms_mas;
											msg_el['sync_key'] = _sync_key;
											msg_el['no_crypto_line_data'] = 1;
											
											//msg_el['decrypt_sync_key_data'] = decrypt_sync_key_data;//Синхронный ключ, который мы расшифровали нашим приватным ключем и теперь им будем расшифровывать полученное большое сообщение
																														
											msgs_mas[_get_user_id]['data_list_msg'].push(msg_el);										
											
											


										}
										
										//=================================
										
										log('<div style="color:#ff0000">msgPaint</div>');//loger...
										
										msgPaint(_get_user_id, _user_from_name);//Отрисовываем сообщения, которые не отрисованы 											
									}
								}
							}

																		

						}	
					
					}
					else
						log('packet_key getUserNotCryptoLineData ERROR');//loger...	

				

								
				}});		
								
				
			
			}
			else
				log('Нет ключа - необходимо авторизоваться');//loger...		
				
			
		}
		
		function createAbsIfNotExist(user_id, user_name)
		{			
			
			var abs_msg_box_isset = false;			
			
			$('.abs_msg_box[user_id=' + user_id + ']').each(function(){				

					abs_msg_box_isset = true;
			
			});		

			if(!abs_msg_box_isset)
			{
				log('В data_list_msg_abs_box нету abs_msg_box с  user_id=' + user_id + ' Создаем хранилище');//loger...
				
				var abs_msg_con = "<div class='abs_msg_con' user_id='" + user_id + "' count_msg='0'><span style='color:#808080'>Здесь будет переписка с пользователем <b>" + user_name + "</b></span></div>";
				
				var abs_msg_box_str = "<div class='abs_msg_box' user_id='" + user_id + "'>" + abs_msg_con + "</div>";
				
				$('#data_list_msg_abs_box').prepend(abs_msg_box_str);//Добавляем бокс для сообщений
							
				$('.abs_msg_con[user_id=' + user_id + ']').ready(function(){
				
					log('Грузим данные для пользователя ' + user_id);//loger...
					
					loadUserNotCryptoLineData(user_id);
					
				
				});	
							

			
			}
		
		}			
					
		function getListMsg(user_id, user_name)
		{
			var user_id_load = 0;
		
			var list_msg_str = "";
			var data_text_msg = "";
			var data_list_msg_change = true;

			
			createAbsIfNotExist(user_id, user_name);	
			
			var data_list_msg_abs_box = $('#data_list_msg_abs_box');
			var data_list_msg = $('#data_list_msg');
			
						
			//Активный пользователь определен - подгрузим его содержание в бокс с сообщениями
			
			var data_list_msg_abs_load = false;
			
			$('.abs_msg_con', data_list_msg).each(function(){				

					user_id_load = $(this).attr('user_id');//Заодно получим юзера, чей контент загружен
					data_list_msg_abs_load = true;//Нашли загруженный чей-то контент
			
			});				
				
			if(data_list_msg_abs_load)
			{
				//В боксе контента есть кто-то - смотрим кто
				
				log('В боксе контента есть ' + user_id_load);//loger...
						
				if(user_id_load != user_id)
				{
					log('Содержание НЕ то которое нужно.. Заберем из хранилище новый контент в строку');//loger...
					
					list_msg_str = $(".abs_msg_box[user_id='" + user_id + "']").html();
					$(".abs_msg_box[user_id='" + user_id + "']").html('');								
				
				
				}							
				else
				{
					//Содержание уже то которое нужно.. видимо мы повторно зашли на нашего же юзера
					
					log('Содержание уже то которое нужно.. Из хранилища не забираем');//loger...
					
					data_list_msg_change = false;
				
				}
				
				if(user_id_load != user_id)
				{	
				
					log('Содержание НЕ то которое нужно.. Переместим текущий контент в его бокс');//loger...
					
					var abs_msg_conFrom = $('.abs_msg_con[user_id="' + user_id_load + '"]', data_list_msg);								
					var abs_msg_boxTo = $('.abs_msg_box[user_id="' + user_id_load + '"]', data_list_msg_abs_box);
					
					$(abs_msg_conFrom).appendTo($('.abs_msg_box[user_id="' + user_id_load + '"]'));
					$(data_list_msg).html('');
				

				}
				else
				{
					log('Содержание уже то которое нужно.. Текущее содержание не трогаем');//loger...
					
					data_list_msg_change = false;					
				
				}					
				
				
			}
			else
			{
				//В боксе сообщений никого нет - загрузим того кого просят в аргументах функции
				
				log('В боксе сообщений никого нет - загрузим того кого просят в аргументах функции');//loger...
				
				list_msg_str = $(".abs_msg_box[user_id='" + user_id + "']").html();
				$(".abs_msg_box[user_id='" + user_id + "']").html('');
				
			}	
			
			if(data_list_msg_change)
			{
				$('#data_user_msg_name').html(user_name);
			
				$(data_list_msg).html(list_msg_str);
					
				$('#data_text_msg').val(data_text_msg);				
			
			}
			
			$(data_list_msg).ready(function(){
			
				$('.msg_clss_to', data_list_msg).attr('read', '1');//Типа прочитали новые сообщения
			
			});
			
	
			
			
			
			
		
		}
		
		function addSendAtoms(sendDate)
		{
			log('msg addSendAtom...');//loger...			
		
			/*
		
			var atom = new Object();
			atom['num'] = 'sendMsg';
			atom['type_send'] = 'msg';
			atom['data'] = sendDate;
			atom['init_time'] = getTimeBrowserSec();
			atom['dead_time'] = getTimeBrowserSec() + 500;//По умолчанию
			atom['packet_id'] = sendDate['packet_id'];
			atom['status'] = 'init';
			
			log('atom init_time=' + atom['init_time']);//loger...
			log('atom dead_time=' + atom['dead_time']);//loger...
		
			queueAtoms.push(atom);
			
			log('atoms length=' + queueAtoms.length);//loger...
			
			*/
		
		}			
		
		function addSendMessage(sendDate)
		{
			log('msg addSendMessage...');//loger...
		
			//Дла отправки сообщения нужно:
			//получить публичный ключ чувака
			//Обменяться синхронными ключами, зашифровав их публичным ключем
			//Передать данные, зашифровав их синхронным ключем
		
			var event = new Object();
			event['type'] = 'sendMsg';
			event['type_send'] = 'msg';
			event['msg_id'] = sendDate['msg_id'];
			event['data'] = sendDate;
			event['init_time'] = getTimeBrowserSec();
			event['dead_time'] = getTimeBrowserSec() + one_time_dead;//По умолчанию
			event['count'] = 0;
			event['packet_id'] = sendDate['packet_id'];
			event['status'] = 'init';	
			
			log('event init_time=' + event['init_time']);//loger...
			log('event dead_time=' + event['dead_time']);//loger...
		
			queueEvents.push(event);
			
			log('event length=' + queueEvents.length);//loger...
			
			var queueEvents_dump = dump(queueEvents);
			
			log('queueEvents_dump=' + queueEvents_dump);//loger...
		}		
		
		function test(data_str, key_crypt)
		{
			log('TEST_START');//loger...
			
			log('data_str=' + data_str);//loger...	
			
			var key_p =  CryptoJS.enc.Hex.parse(key_crypt);
			var iv =  CryptoJS.enc.Hex.parse(sid);
		
			log('key_p=' + key_p);//loger...	
			log('iv=' + iv);//loger...	
		
			//crypted
			var encrypted = CryptoJS.AES.encrypt(data_str, key_p, {iv:iv});
			
			log('encrypted_1=' + encrypted);//loger...	
			
			encrypted = encrypted.ciphertext.toString(CryptoJS.enc.Base64);  
				
			log('encrypted Base64=' + encrypted);//loger...	
				
			encrypted = encrypted.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
			encrypted = encrypted.replaceAll(' ', '@@pr@@');	
			encrypted = encodeURIComponent(encrypted);//Кодируем для URL					
		
			log('encrypted encodeURIComponent=' + encrypted);//loger...	
		
			log('_________________________________');//loger...
		
			encrypted = decodeURIComponent(encrypted);						
			encrypted = encrypted.replaceAll('&quot;', '"');	
			
			log('encrypted decodeURIComponent=' + encrypted);//loger...	
			
			encrypted = encrypted.replaceAll('@@p@@', '+');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел		
			encrypted = encrypted.replaceAll('@@pr@@', ' ');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел		

			log('encrypted=' + encrypted);//loger...	

			//encrypted = CryptoJS.enc.Base64.stringify(encrypted);
			
			//log('encrypted stringify=' + encrypted);//loger...	
			
			var decrypted = CryptoJS.AES.decrypt(encrypted, key_p, {iv: iv});
			
			log('decrypted=' + decrypted);//loger...	
			
			decrypted = UtfCorrect(decrypted.toString(CryptoJS.enc.Utf8));	
			
			log('decrypted=' + decrypted);//loger...	
			
			log('TEST_END');//loger...

		}		
	
		$(document).ready(function(){	

			sid = $('#sid').val();		
		
			$('#data_text_msg').click(function(){
			
				window.interval_tmp = window.setTimeout(function(){
				
					if(about_1 == 'need')
					{
						about_1 = '';
						
						var data_list_msg = $('#data_list_msg');
						
						var user_id_act = parseInt($('.abs_msg_con', data_list_msg).attr('user_id'));//Активный пользователь (ему мы сейчас отправим сообщение)								
						
						var site_product = '<a href="http://криптограм.впрограмме.рф" target="_blank" class="a_clss">http://криптограм.впрограмме.рф</a>';
						var site_vp = '<a href="http://заметки.впрограмме.рф" target="_blank" class="a_clss">http://заметки.впрограмме.рф</a>';
						
						addSystemMsg(user_id_act, 'Вас приветствует система <span style="color:#000"><b>Криптограм</b></span> - свободнораспространяемый менненджер со сквозным шифрованием и открытым исходным кодом.<br> Сайт продукта:<br>' + site_product + '<br>При поддержке:<br>' +site_vp + ' =)');
					}									
				
				}, 2000);		
			
			
			});		
		
			$('html,body').animate({scrollTop:0}, 1000,function()
			{
																
			});	
	
		
			$('#s_send_new').click(function(){			

				var user_secret = $('#s_chat_new_word_secret').val();
				var user_password = $('#s_chat_new_user_password').val();
				var user_password2 = $('#s_chat_new2_user_password').val();
				var sound_ok_val;
				var log_on_val;
				
				if($('#sound_ok').prop("checked"))
					sound_ok_val = 1;
				else 
					sound_ok_val = 0;
					
				if($('#log_on').prop("checked"))
					log_on_val = 1;
				else 
					log_on_val = 0;					
				
				
				if(user_secret != "" && user_password != "")
				{
					if(user_password == user_password2)
					{
						//Помимо прочих настроек отправим новые данные о пароле и секретном слове
					
						var user_secret_md5 = hex_md5(user_secret.toString());
						var user_password_md5 = hex_md5(user_password.toString());
						
						log('user_secret_md5=' + user_secret_md5);//loger...	
						log('user_password_md5=' + user_password_md5);//loger...	
						

								
						
					}

				
				}

				
				var packet_id = getNextAutoIncrementId();
				
				log('packet_id=' + packet_id);//loger...		

				var packet_key = getUnicKeyPacket(packet_id);
				
				log('packet_key=' + packet_key);//loger...		
							
				var key_s_a_5 = getSKey(packet_id);
								
				var send_data = new Object();
				send_data['sid'] = sid;
				send_data['packet_key'] = packet_key;
				send_data['sound_ok_val'] = sound_ok_val;
				send_data['log_on_val'] = log_on_val;
				send_data['user_secret_md5'] = user_secret_md5;
				send_data['user_password_md5'] = user_password_md5;
				send_data['key_s_a_5'] = key_s_a_5.toString();//Передадим синхронный ключ для зашифровки длинных данных
				
				log('key_s_a_5 1=' + send_data['key_s_a_5']);//loger...	
				
				var send_str = JSON.stringify( send_data );
				
				send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
				send_str = send_str.replaceAll(' ', '@@pr@@');	
				send_str = encodeURIComponent(send_str);//Кодируем для URL						
				
				var data_str = send_str + '@';	

				if(data_key_crypt != '')
				{
					var encrypted = getEncryptedStr(data_str, data_key_crypt);				
					
					$.ajax({						
					type: 'POST',				
					url: 'setNewReqs.php',
					data: 'encrypted=' + encrypted,
					async: true,
					success: function(msg){
					
						log('setNewReqs msg=' + msg);//loger...	
						
						var getData_mas = jQuery.parseJSON(msg);	
						//var encrypted_data = getData_mas['encrypted_data'];	
						var time_ok = parseInt(getData_mas['time_ok']);	
						
						if(time_ok == -1)
						{
							key_s_a_5 = key_s_a_5.toString();

							var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_5);
						
							var _packet_key = getDecryptedData_mas['packet_key'];
						
							if(packet_key == _packet_key)
							{	
								alert('Настройки сохранены');
								location.reload();
								
							}
							else
								log('packet_key getSettings ERROR');//loger...	

						}
						else
							alert('В целях безопасности последующее обращение к системе возможно через ' + time_ok + ' секунд');
					

									
					}});		
									
					
				
				}
				else
					log('Нет ключа - необходимо авторизоваться');//loger...		
				
				

			
			});		
		
			$('#user_name_box').click(function(){
			
				$('#con_abs_box').animate({
					left: -960
				  }, 500, function() {
					// Animation complete.
					

					
				  });	


			
			});
			
		
			$.ajax({						
			type: 'POST',
			url: 'logout.php',
			data: 'sid=' + sid,
			async: true,
			success: function(msg){

				
			
			}});	
			
			function msgEditPanel()
			{
				var msg_edit_panel_display = false;
								
				var data_list_msg = $('#data_list_msg');
				
				$('.msg_clss', data_list_msg).each(function(){
				
					var _state = $(this).attr('_state_v');
					
					if(_state == 1)
						msg_edit_panel_display = true;
				
				});
				
				if(msg_edit_panel_display)
				{
					$('#msg_edit_panel').css('display', 'block');
				}
				else
					$('#msg_edit_panel').css('display', 'none');
			
			}
			
			function msgDel(str_edit)
			{
				
				log('msgDel...');//loger...				
												
				var st_packet_id = getNextAutoIncrementId();
				
				log('st_packet_id=' + st_packet_id);//loger...		

				var st_packet_key = getUnicKeyPacket(st_packet_id);
				
				log('st_packet_key=' + st_packet_key);//loger...		
							
				var st_key_s_a_5 = getSKey(st_packet_id);
								
				st_key_s_a_5 = 	st_key_s_a_5.toString();		
								
				var send_data = new Object();
				send_data['sid'] = sid;
				send_data['packet_key'] = st_packet_key;
				send_data['str_edit'] = str_edit;
				send_data['key_s_a_5'] = st_key_s_a_5;//Передадим синхронный ключ для зашифровки длинных данных
				
				log('st_key_s_a_5 1=' + st_key_s_a_5);//loger...	
				
				var st_send_str = JSON.stringify( send_data );
				
				st_send_str = st_send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
				st_send_str = st_send_str.replaceAll(' ', '@@pr@@');	
				st_send_str = encodeURIComponent(st_send_str);//Кодируем для URL						
				
				var st_data_str = st_send_str + '@';	

				if(data_key_crypt != '')
				{
					log('data_key_crypt=' + data_key_crypt);//loger...	
				
					var encrypted = getEncryptedStr(st_data_str, data_key_crypt);				
					
					log('encrypted=' + encrypted);//loger...	
					
					//Сейчас у сообщения статус 1, т.к. при создании оно было 0, после отправки метаинформации сервер перевел ее в 1
					//Мы должны переставить его в статус 2, чтобы сервер начал нам отдавать его атомы
					
					$.ajax({						
					type: 'POST',
					url: 'msgDel.php',
					data: 'encrypted=' + encrypted,
					async: true,
					success: function(msg){
					
						log('msgDel msg=' + msg);//loger...	
						
						//console.log(msg);
						
						var getDecryptedData_mas = getDataDecryptedArray(msg, st_key_s_a_5);

						var _packet_key = getDecryptedData_mas['packet_key'];						
										
						if(st_packet_key == _packet_key && getDecryptedData_mas['del_msgs_str'])
						{
							var _del_msgs_str = '' + getDecryptedData_mas['del_msgs_str'].toString();
							
							var del_msgs_mas = _del_msgs_str.split(',');
							var count_del_msgs_mas = del_msgs_mas.length;
							
							if(count_del_msgs_mas)
								if(count_del_msgs_mas > 0)
								{
									for(var d = 0; d < count_del_msgs_mas; d++)
									{
										if(del_msgs_mas[d] != '')
											$('.msg_clss[msg_packet_key="' + del_msgs_mas[d] + '"]').remove();
									
									}
									
									$('#msg_edit_panel').css('display', 'none');
								
								}
								
						
						}
						else
							log('packet_key msgDel "' + status + '" ERROR');//loger...	

					

									
					}});		
									
					
				
				}
				else
					log('Нет ключа - необходимо авторизоваться');//loger...						
				
			
			}
			
			function msgReply(mas_edit)
			{
				var h_minus = 120;
				
				$('#msg_edit_panel').css('display', 'none');
			
				var count_mas_edit = mas_edit.length;
				
				var html_str = '';
				
				for(var r = 0; r < count_mas_edit; r++)
				{
					var msg_el = $('.msg_clss[msg_packet_key="' + mas_edit[r] + '"]');
					
					var r_msg_packet_key = $(msg_el).attr('msg_packet_key');
					var r_is_from = $(msg_el).attr('is_from');			
				
					html_str += '<div class="msg_reply" msg_packet_key="' + r_msg_packet_key + '" is_from="' + r_is_from + '">' + $(msg_el).html() + '</div>';
				
				}
				
				if(html_str != "")
				{
					data_list_msg_h = parseInt($('#data_list_msg').height());
					
					$('#data_list_msg').height(data_list_msg_h - h_minus);
				
					$('#box_msg_reply').html(html_str);
					$('#tr_msg_reply').css('display', 'table-row');
				
				
				}
			
			}
			
			function msgReplyClose()
			{
				$('#data_list_msg').height(data_list_msg_h);
			
				$('#box_msg_reply').html('');
				$('#tr_msg_reply').css('display', 'none');
				
				msgEditPanel();			
			
			}
			
			$('#msg_reply_close').live('click', function(){
			
				msgReplyClose();
			
			});
			
			$('#msg_reply').live('click', function(){
			
				var str_edit = '';
				var mas_edit = new Array();
				var msg_edit_panel_display = false;
				var k = 0;
				
				var data_list_msg = $('#data_list_msg');
				
				$('.msg_clss', data_list_msg).each(function(){
				
					var _state = $(this).attr('_state_v');
					
					if(_state == 1)
					{
						k++;
						msg_edit_panel_display = true;
						
						str_edit += $(this).attr('msg_packet_key') + ',';
						mas_edit.push($(this).attr('msg_packet_key'));
						
					}
						
				
				});
				
				if(msg_edit_panel_display)
				{
					msgReply(mas_edit);

				}	
				
			
			});			
			
			
			$('#msg_del').live('click', function(){
			
				var str_edit = '';
				var msg_edit_panel_display = false;
				var k = 0;
				
				var data_list_msg = $('#data_list_msg');
				
				$('.msg_clss', data_list_msg).each(function(){
				
					var _state = $(this).attr('_state_v');
					
					if(_state == 1)
					{
						k++;
						msg_edit_panel_display = true;
						
						str_edit += $(this).attr('msg_packet_key') + ',';
						
						
					}
						
				
				});
				
				if(msg_edit_panel_display)
				{
					if(k == 1)
					{
						if(confirm('Удалить сообщение?'))
						{
							msgDel(str_edit);
						}					
					
					}
					else
					{
						if(confirm('Удалить выбранные сообщения?'))
						{
							msgDel(str_edit);
						}						
					
					}


				}	
				
			
			});
			
			$('.msg_clss').live('click', function(){
			
				var _state = $(this).attr('_state_v');
				
				if(_state == 1)
				{
					
					$(this).attr('_state_v', '0').css('background', '#fff');
				
				}
				else
				{
					$(this).attr('_state_v', '1').css('background', '#1C5C78');
				
				}
				
				msgEditPanel();
			
			});
		
		
			$('#crypto_line_state').live('click', function(){
			
				var crypto_line_state_el = $('.crypto_line_state_el', this);
			
				var crypto_line = parseInt($(crypto_line_state_el).attr('crypto_line'));
				
				var user_id = parseInt($('#online_td_msg').attr('user_id'));
				
				if(user_id > 0)
				{
					if(msgs_mas[user_id])
					{
						//Юзер уже чет нам отослал.. или мы ему.. похер										
		
					}
					else
					{
						var list_data_list_msg = new Array();
						
						var data_list_msg_box = new Object();
						data_list_msg_box['data_list_msg'] = list_data_list_msg;
						data_list_msg_box['crypto_line'] = true;										
						
						msgs_mas[user_id] = data_list_msg_box;						
					
					}				
				
					if(crypto_line == 1)
					{
						$('.crypto_line_state_el').attr('crypto_line', '0').css('color', '#c0c0c0');
						
						msgs_mas[user_id]['crypto_line'] = false;
					}					
					else
					{
						$('.crypto_line_state_el').attr('crypto_line', '1').css('color', '#ff0000');
						
						msgs_mas[user_id]['crypto_line'] = true;
					}
										
				
				}

				
				
			
			});
		
			$('.user_el[msg="1"]').live('click', function(){
			
				var user_id = $(this).attr('user_id');
				
				var abs_msg_con = $('.abs_msg_con[user_id=' + user_id + ']');
				
				$('.msg_clss_to', abs_msg_con).attr('read', '1');//Прочитаем все сообщения внутри контейнера с перепиской этого юзера
			
				//Клик по юзеру с непрочитанными сообщениями - откроется контент с сообщениями - типа его прочитали
				
				$(this).attr('msg', '0');
				$(this).css('background-color', '#92D8F6');	
				$('.user_msg_count', this).html('');	
			
				$('#title').text('Криптограм');
				
				//Смотрим отключать ли мигалки..
				
				var new_els = false;
				
				$('.user_el[msg="1"]').each(function(){
				
					new_els = true;
				
				
				});
				
				if(new_els)
					event_new_msg = true;
				else
					stopEventNewMsg();				
			
			});
		
			$('.user_not_friend_el').live('click', function(){
						
				$(this).attr('new', '0');
				$(this).css('background-color', '#E2E2E2');	
				$('.new_not_friend', this).css('display', 'none');	
			
				$('#title').text('Криптограм');
				
				//Смотрим отключать ли мигалки..
				
				var new_els = false;
				
				$('.user_not_friend_el[new="1"]').each(function(){
				
					new_els = true;
				
				
				});
				
				if(new_els)
					event_user_add = true;
				else
					stopEventUserAdd();
					
					
			});
		
		
            $(window).bind('focus', function() {
			
				setOnline();
			
			
                focus_g = 1;
				
				//Все сообщения, которые получили - отправим как прочитанные
				
				/*
				$('.msg_clss_to[state="to_look_1"]').each(function(){
				
					var msg_packet_key = $(this).attr('msg_packet_key');
					var user_from_id = $(this).attr('user_from_id');
					
					setStatusMsg(msg_packet_key, user_from_id, 'to_look_2');
				
				});
				*/
				
            });

            $(window).bind('blur', function() {
                focus_g = 0;
            });			
		

			$('#demons_state').click(function(){
			
				var _play = $(this).attr('_play');
				
				if(_play == '1')
				{
					//tools_log = false;
					
					$(this).attr('_play', '0').html("Запустить");
					
					clearInterval(window.interval_event);//Удаляем интервал
					clearInterval(window.interval_queue);//Удаляем интервал
					clearInterval(window.interval_long_pool);//Удаляем интервал
					
					
					
				}
				else
				{
					//tools_log = true;
					
					$(this).attr('_play', '1').html("Остановить");
					
					//Запускаем, но не сразу, а то на серваке может еще не закончится лонгпул от предыдущего скрипта
					
					window.setTimeout(function(){
					
						window.interval_event = window.setInterval(eventInretval, event_time);
						window.interval_queue = window.setInterval(queueInretval, queue_time);
						window.interval_long_pool = window.setInterval(longPoolInretval, long_pool_time);	
						
						longPoolInretval();
					
					}, long_pool_time);					
					
				
				}			
			
			});
		
		
		
				
				
			//var t_k = hex_md5('hghghhghghghghhhh');
		
			//test('sssss', t_k);				
				

		
			$('#type_login').click(function(){
			
				$('#login_box').css('display', 'block');
				$('#new_box').css('display', 'none');
			
			});
		
			$('#type_new').click(function(){
			
				$('#login_box').css('display', 'none');
				$('#new_box').css('display', 'block');
			
			});	

			function getSettings()
			{			

				var packet_id = getNextAutoIncrementId();
				
				log('packet_id=' + packet_id);//loger...		

				var packet_key = getUnicKeyPacket(packet_id);
				
				log('packet_key=' + packet_key);//loger...		
							
				var key_s_a_5 = getSKey(packet_id);
								
				var send_data = new Object();
				send_data['sid'] = sid;
				send_data['packet_key'] = packet_key;
				send_data['key_s_a_5'] = key_s_a_5.toString();//Передадим синхронный ключ для зашифровки длинных данных
				
				log('key_s_a_5 1=' + send_data['key_s_a_5']);//loger...	
				
				var send_str = JSON.stringify( send_data );
				
				send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
				send_str = send_str.replaceAll(' ', '@@pr@@');
				send_str = encodeURIComponent(send_str);//Кодируем для URL						
				
				var data_str = send_str + '@';	

				if(data_key_crypt != '')
				{
					var encrypted = getEncryptedStr(data_str, data_key_crypt);				
					
					$.ajax({						
					type: 'POST',
					url: 'getSettings.php',
					data: 'encrypted=' + encrypted,
					async: true,
					success: function(msg){
					
						log('getSettings msg=' + msg);//loger...	
						
						var getData_mas = jQuery.parseJSON(msg);	
						var encrypted_data = getData_mas['encrypted_data'];	
						var time_ok = parseInt(getData_mas['time_ok']);	
						
						if(time_ok == -1)
						{
							key_s_a_5 = key_s_a_5.toString();

							var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_5);
						
							var _packet_key = getDecryptedData_mas['packet_key'];
							var _sound_on = parseInt(getDecryptedData_mas['sound_on']);
							var _log_on = parseInt(getDecryptedData_mas['log_on']);
							var _s_user_block_link = getDecryptedData_mas['user_block_link'];
						
							var debug = new Object();
							
							if(_log_on == 1)
							{
								debug['log_display'] = true;
								debug['tools_log'] = true;
								debug['tools_queue_msg'] = true;
								debug['tools_queue_atom'] = true;
								debug['tools_con_msgs'] = false;
							
							}
							else
							{
								debug['log_display'] = false;
								debug['tools_log'] = false;
								debug['tools_queue_msg'] = false;
								debug['tools_queue_atom'] = false;
								debug['tools_con_msgs'] = false;							
							
							}
							
							setDebag(debug);
						
						
							if(packet_key == _packet_key)
							{	
							
								//Вставка настроек
								
								if(_log_on == 1)
									$('#log_on').prop("checked", "checked");
								else
									$('#log_on').prop("checked", "");								
								
								
								if(_sound_on == 1)
									$('#sound_ok').prop("checked", "checked");
								else
									$('#sound_ok').prop("checked", "");
								

								$('#s_user_block_link').val(_s_user_block_link);	
							
							
								log('packet_key getSettings OK Настройки получены');//loger...	

								$('#data_settings_status').html('');

								$('#box_box').css('display', 'block');										
								$('#login_boxs').css('display', 'none');
								
								$('#user_search').val('');
								$('#data_search').html('');
								
								timeSync();
								
								initDemons();
								
								getListFriend();							
							
								var user_name = $('#chat_login_user_name').val();
							
								$('#user_name_box').html(user_name);
								
								soundGo('init');									
								
							}
							else
								log('packet_key getSettings ERROR');//loger...	

						}
						else
							alert('В целях безопасности последующее обращение к системе возможно через ' + time_ok + ' секунд');	

									
					}});		
									
					
				
				}
				else
					log('Нет ключа - необходимо авторизоваться');//loger...		
				
				//============================================================
				//============================================================
			
		
				

			}	
			
			function loginStep_2()
			{
				log('send_login2');//loger...			
				
				
				var user_name = $('#chat_login_user_name').val();
				var user_password = $('#chat_login_user_password').val();
				
				var user_name_md5 = hex_md5(user_name.toString());	
				var user_password_md5 = hex_md5(user_password.toString());	
				
				log('user_name_md5=' + user_name_md5);//loger...					
				log('user_password_md5=' + user_password_md5);//loger...	
				
				var packet_id = getNextAutoIncrementId();
				
				log('packet_id=' + packet_id);//loger...		
				
				var packet_key = getUnicKeyPacket(packet_id);
				
				log('packet_key=' + packet_key);//loger...		
				
				if(sync_key_b_1 != "")
				{
					//Шифруем данные пользователя.. дада, имя и пароль
								
					var key_s_a_2 = getSKey(packet_id);
				
					var data_str = user_name_md5 + '@' + user_password_md5 + '@' + key_s_a_2 + '@' + packet_key + '@';
									
					if(sync_key_b_1 != '')
					{
						var encrypted = getEncryptedStr(data_str, sync_key_b_1);
						
						$.ajax({						
						type: 'POST',
						url: 'login.php',
						data: 'encrypted=' + encrypted + '&sid=' + sid,
						async: true,
						success: function(msg){
						
							log('login.php msg=' + msg);//loger...	
							
							var getLogin_mas = jQuery.parseJSON(msg);	
							var time_ok = parseInt(getLogin_mas['time_ok']);	
							
							if(time_ok == -1)
							{							
								key_s_a_2 = key_s_a_2.toString();

								var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_2);
								
								_packet_key = getDecryptedData_mas['packet_key'];	
								
								if(_packet_key == packet_key)
								{									
									log('Данные логина опознаны');//loger...	
									
									user_id = getDecryptedData_mas['user_id'];
									var block = parseInt(getDecryptedData_mas['block']);
									data_key_crypt = getDecryptedData_mas['data_key_crypt'];
									
									log('block=' + block);//loger...	
									log('data_key_crypt=' + data_key_crypt);//loger...
									
									if(block == 1)
									{
										alert('Пользователь заблокирован');
										location.reload();
									}
									else
									{
										//LOGIN__
										
										getSettings();								
										
										//pubkeyA_1 записали на сервере в базу из сессии, в которую положили при проверке секретного слова
															
										$('html,body').animate({scrollTop:0}, 1000,function()
										{
																							
										});										
									
									
									}
									

																
								
								}
								else
									log('packet_key ERROR');//loger...	
								
							}
							else
								alert('В целях безопасности последующее обращение к системе возможно через ' + time_ok + ' секунд');	
											
						}});
						
						
					
					}
					else
						log('Нет ключа - необходимо авторизоваться');//loger...						
					

				
					
				
				}				
				
			}
		
	
			$('#send_login2').click(function(){
						
				loginStep_2();

				

			});	

			function loginStep_1()
			{
				log('send_login');//loger...
				
				$('#box_secret_preloader').css('display', 'block');
			
				_KeysA_1 = generateKeys();
				
				pubkeyA_1 = _KeysA_1['pubkey'];
				var privkey = _KeysA_1['privkey'];
				
				log('pubkeyA_1=' + pubkeyA_1);//loger...				
				log('privkey=' + privkey);//loger...
				
				pubkeyA_1 = pubkeyA_1.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел		
				pubkeyA_1 = pubkeyA_1.replaceAll(' ', '@@pr@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел		
				pubkeyA_1 = encodeURIComponent(pubkeyA_1);//Кодируем для URL
				
				//log('pubkeyA_1 after=' + pubkeyA_1);//loger...
				
				var packet_id = getNextAutoIncrementId();
				
				log('packet_id=' + packet_id);//loger...		
				
				var packet_key = getUnicKeyPacket(packet_id);
				
				log('packet_key=' + packet_key);//loger...				
				
				var user_name = $('#chat_login_user_name').val();
				var user_secret = $('#chat_login_user_secret').val();
				
				var user_name_md5 = hex_md5(user_name.toString());	
				var user_secret_md5 = hex_md5(user_secret.toString());
				
				log('user_name_md5=' + user_name_md5);//loger...	
				log('user_secret_md5=' + user_secret_md5);//loger...
				
				var data = 'pubkeyA_1=' + pubkeyA_1 + '&packet_key=' + packet_key + '&user_name_md5=' + user_name_md5 + '&user_secret_md5=' + user_secret_md5 + '&sid=' + sid;
				
				log('getInitLogin data send=' + data);//loger...
				
							
				$.ajax({						
				type: 'POST',
				url: 'getInitLogin.php',
				data: data,
				async: true,
				success: function(msg){

					log('getInitLogin.php msg=' + msg);//loger...	
					
					var getInitLogin_mas = jQuery.parseJSON(msg);	
					var encrypted = getInitLogin_mas['encrypted_data'];	
					var time_ok = parseInt(getInitLogin_mas['time_ok']);	
					
					if(time_ok == -1)
					{
						encrypted = decodeURIComponent(encrypted);
						
						encrypted = encrypted.replaceAll('@@p@@', '+');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел		
						encrypted = encrypted.replaceAll('@@pr@@', ' ');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
						
						log('encrypted=' + encrypted);//loger...		
						
						// Create the encryption object.
						var crypt = new JSEncrypt();		

						// Set the private.
						crypt.setPrivateKey(_KeysA_1['privkey']);		

						var decrypted = crypt.decrypt(encrypted);	
						
						log('decrypted=' + decrypted);//loger...

						if(decrypted)
						{
							var data_decrypted_mas = decrypted.split('@@');
							
							var packet_key_d = data_decrypted_mas[0];
							var connect = data_decrypted_mas[1];
							sync_key_b_1 = data_decrypted_mas[2];
							
							log('packet_key=' + packet_key_d);//loger...
							log('connect=' + connect);//loger...
							log('sync_key_b_1=' + sync_key_b_1);//loger...
							
							if(connect == 'Connect' && packet_key == packet_key_d)
							{
								log('packet_key OK');//loger...					
								
								$('#box_secret_preloader').css('display', 'none');
								
								$('#secret_dop').css('display', 'block');
								$('#send_login').css('display', 'none');
								$('#send_login2').css('display', 'block');
							
							}
							else
								log('packet_key ERROR');//loger...

						}
						else
							alert('Ошибка подключения. Секретное слово не получено.');
											
					
					}
					else
						alert('В целях безопасности последующее обращение к системе возможно через ' + time_ok + ' секунд');


						
				}});				
				
				
			}
		
			$('#send_login').click(function(){
			
				loginStep_1();			
				
			
			});
			
			
			function addNewUser_2()
			{
				var user_password = $('#chat_new_user_password').val();
				var user_password2 = $('#chat_new2_user_password').val();	
				var user_name = $('#chat_new_user_name').val();
				var word_secret = $('#chat_new_word_secret').val();				
			
				if(user_name != "" && word_secret != "" && user_password != "" && user_password2 != "")
				{
					if(user_password == user_password2)
					{
						if(getLatCorrect(user_name))
						{
						
							var user_password_md5 = hex_md5(user_password.toString());							
							
							var user_name_length = user_name.length;
							
							if(user_name_length >= 4 && user_name_length < 10)
							{
								var word_secret_md5 = hex_md5(word_secret.toString());	
								
								log('user_name=' + user_name);//loger...	
								log('word_secret_md5=' + word_secret_md5);//loger...	
								log('user_password_md5=' + user_password_md5);//loger...	
								
								var packet_id = getNextAutoIncrementId();
								
								log('packet_id=' + packet_id);//loger...		
								
								var packet_key = getUnicKeyPacket(packet_id);
								
								log('packet_key=' + packet_key);//loger...									
								
								if(sync_key_b_2 != "")
								{
									//Шифруем данные пользователя.. дада, имя и пароль
																
									var key_s_a_2 = getSKey(packet_id);	
									
									var data_str = user_name + '@' + word_secret_md5 + '@' + user_password_md5 + '@' + key_s_a_2 + '@';
																					
									var encrypted = getEncryptedStr(data_str, sync_key_b_2);										
				
									
									$.ajax({						
									type: 'POST',
									url: 'newUserReg.php',
									data: 'encrypted=' + encrypted + '&packet_key=' + packet_key + '&sid=' + sid,
									async: true,
									success: function(msg){
									
										log('newUserReg.php msg=' + msg);//loger...	
										
										var getLogin_mas = jQuery.parseJSON(msg);	
										var encrypted_data = getLogin_mas['encrypted_data'];								
										
										encrypted_data = decodeURIComponent(encrypted_data);						
										encrypted_data = encrypted_data.replaceAll('&quot;', '"');	
															
										key_s_a_2 = key_s_a_2.toString();					
										
										log('encrypted_data r=' + encrypted_data);//loger...			
										log('key_s_a_2=' + key_s_a_2);//loger...							
										
								
										var decrypted = CryptoJS.AES.decrypt(encrypted_data, key_s_a_2, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8);
										
										if(decrypted != "")
										{
											var length = decrypted.length;
										
											if(length > 3)
											{
												decrypted = decrypted.substr(1,(decrypted.length - 2));
											
											}
											
										
										}
										
										log('decrypted 1=' + decrypted);//loger...	
										
										decrypted = htmlspecialchars_decode(decrypted);
										decrypted = decrypted.replaceAll('\\/', '/');

										
										decrypted = decodeURIComponent(decrypted);
										
										decrypted = decrypted.replaceAll('@@p@@', '+');
										decrypted = decrypted.replaceAll('@@pr@@', ' ');						
										
										log('decrypted 2=' + decrypted);//loger...	
										
										var data_decrypted_mas = decrypted.split('@@@');
										
										var data_decrypted_mas_length = data_decrypted_mas.length;
										
										if(data_decrypted_mas_length == 2)
										{
											var state = data_decrypted_mas[0];										
											var packet_key_b = data_decrypted_mas[1];
											
											if(packet_key == packet_key_b)
											{
												if(state == 'reg')
												{
													alert('Регистрация завершена! Теперь Вы можете зайти, используя ваши данные =)');
													
													location.reload();											
												
												}
												else
												if(state == 'isset')
												{
													alert('Пользователь ' + user_name + ' уже существует!');
													
													location.reload();											
												
												}											
												else
												{
													alert('Ошибка рагистрации.');
													
													location.reload();											
												
												}										
											}
										
										}
																												
									
									
									}});									


								}		
								
								

							}						
							else
							{
							
								alert('Имя должно быть не менее 4 и менее 10 символов');
							
							}						
						
						}
						else
						{
							alert('В имени пользователя могут быть использованы только символы латинского алфовита и знак подчеркивания');
						
						}
						
						
							
						
					
						
					
					}
					else
					{
						alert('Пароли не одинаковы');
					
					}					
				}
				else
					alert('Заполнены не все поля');				
				
				
			}
			
			$('#send_new2').click(function(){
			
				addNewUser_2();
			

			
			});
			
			
			function addNewUser()
			{
				
				//Нам нужено передать шифро данные.
				
				var startKeysA_2 = generateKeys();
				
				var pubkeyA_2 = startKeysA_2['pubkey'];
				
				pubkeyA_2 = pubkeyA_2.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
				pubkeyA_2 = pubkeyA_2.replaceAll(' ', '@@pr@@');	
				pubkeyA_2 = encodeURIComponent(pubkeyA_2);//Кодируем для URL
				
				log('pubkeyA_2=' + pubkeyA_2);//loger...
				
				var packet_id = getNextAutoIncrementId();
				
				log('packet_id=' + packet_id);//loger...		
				
				var packet_key = getUnicKeyPacket(packet_id);
				
				log('packet_key=' + packet_key);//loger...						
			
				var user_name = $('#chat_new_user_name').val();
				var word_secret = $('#chat_new_word_secret').val();

				
				if(user_name != "" && word_secret != "")
				{
				
					if(getLatCorrect(user_name))
					{
						var user_name_length = user_name.length;
						
						if(user_name_length >= 4 && user_name_length < 10)
						{
							var word_secret_md5 = hex_md5(word_secret.toString());	
							var user_name_md5 = hex_md5(user_name.toString());
							
							$.ajax({						
							type: 'POST',
							url: 'addNewUser.php',
							data: 'pubkeyA_2=' + pubkeyA_2 + '&packet_key=' + packet_key + '&user_name_md5=' + user_name_md5 + '&word_secret_md5=' + word_secret_md5 + '&sid=' + sid,
							async: true,
							success: function(msg){
							
								log('addNewUser.php msg=' + msg);//loger...	
								
								var getInitLogin_mas = jQuery.parseJSON(msg);	
								var encrypted = getInitLogin_mas['encrypted_data'];	
								
								encrypted = decodeURIComponent(encrypted);
								
								encrypted = encrypted.replaceAll('@@p@@', '+');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел		
								encrypted = encrypted.replaceAll('@@pr@@', ' ');
								
								log('encrypted=' + encrypted);//loger...		
								
								// Create the encryption object.
								var crypt = new JSEncrypt();		

								// Set the private.
								crypt.setPrivateKey(startKeysA_2['privkey']);		

								var decrypted = crypt.decrypt(encrypted);	
								
								log('decrypted=' + decrypted);//loger...

								if(decrypted)
								{
									var data_decrypted_mas = decrypted.split('@@');
									
									var packet_key_d = data_decrypted_mas[0];
									var state_user = data_decrypted_mas[1];
									sync_key_b_2 = data_decrypted_mas[2];
									
									log('packet_key=' + packet_key_d);//loger...
									log('state_user=' + state_user);//loger...
									log('sync_key_b_2=' + sync_key_b_2);//loger...
									
									if(state_user == 'not_isset' && packet_key == packet_key_d)
									{
										log('packet_key OK');//loger...					
										
										
										$('#pass_dop').css('display', 'block');
										$('#send_new').css('display', 'none');
										$('#send_new2').css('display', 'block');
									
									}
									else
									if(state_user == 'isset' && packet_key == packet_key_d)
									{
										log('packet_key OK');//loger...					
										
										alert('Пользователь ' + user_name + ' уже существует!');
										
										location.reload();
									
									}								
									else
										log('packet_key ERROR');//loger...

								}
								else
									alert('Ошибка подключения. Секретное слово не получено.');
								
							
							
							}});							
						}
						else
						{
						
							alert('Имя должно быть не менее 4 и менее 10 символов');
						
						}

							
												
					}
					else
					{
						alert('В имени пользователя могут быть использованы только символы латинского алфовита и знак подчеркивания');
					
					}
				
	
				
			
				
				}
				else
				{
					alert('Заполнены не все поля');
				
				}
				
				
				
			}
			
			
			$('#send_new').click(function(){
			

				addNewUser();
				
			
			});		


			function searchContacts()
			{
				var search_val = $('#user_con_search').val() + '';	
												
				if(search_val != "")
				{
					var data_contacts_box = $('#data_contacts_box');
				
					$('.user_el', data_contacts_box).each(function(){
					
						var search_val = $('#user_con_search').val() + '';	
						var name = $('.user_setter_name', this).text() + '';
												
						var search_val = search_val.toString().toLowerCase();
						var name_lower = name.toString().toLowerCase();						
						
						var _indexOf = search_val.indexOf(name_lower);
						
						//alert(search_val + '/' + name_lower + '/' + _indexOf);
						
						if(name_lower.indexOf(search_val) >= 0) 
						{
							$(this).css('display', 'block');
						
						}
						else
							$(this).css('display', 'none');
						
					
					
					});
				}
				else
					getListFriend();

			}		
			
			function searchUser()
			{
				var search_val = $('#user_search').val();
				
				if(search_val.length >= 4)
				{
					$('#data_search').html('Search...');
					
					var search_val_md5 = hex_md5(search_val);	
					
					$.ajax({						
					type: 'POST',
					url: 'searchUser.php',
					data: 'search_val_md5=' + search_val_md5 + '&sid=' + sid,
					async: true,
					success: function(msg){

						log('searchUser.php =' + msg);//loger...	
					
						$('#data_search').html('');
					
						var getData_mas = jQuery.parseJSON(msg);	
						var sid_b = getData_mas['sid'];						
			
						if(sid_b == sid)
						{
							var users = getData_mas['users'];
							
							var users_length = users.length;
							
							if(users_length > 0)
							{							
								
								var users_str = '';
								
								for(var k = 0; k < users_length; k++)
								{
									var friend = false;
									var friend_str = '';
									
									if(users[k]['is_friend'])
										if(users[k]['is_friend'] == '1' || users[k]['is_friend'] == '3')
											friend = true;
											
									if(!friend)
									{
										friend_str = '<i class="fa fa-user-plus" aria-hidden="true" user_id="' + users[k]['id'] + '" user_name="' + users[k]['user_name'] + '" ></i>';
									
									}
								
									users_str += '<div class="user_el" ><table width="100%"><tr><td>' + users[k]['user_name'] + '</td><td align="right">' + friend_str + '</td></tr></table></div>';
								
								}
								
								$('#data_search').html(users_str);
							
							}
					
						
						}
						
					
					}});				
				
				}
				else
					$('#data_search').html('');

			}	
			
			$('#user_con_search').focus(function(){
			
				$('#div_con_search').css('border', '1px solid #1C5C78');
			
			}).focusout(function(){
			
				$('#div_con_search').css('border', '1px solid #fff');
			
			}).keyup(function(){
			
				searchContacts();
			
			});			
			
			
			$('#user_search').focus(function(){
			
				$('#div_search').css('border', '1px solid #1C5C78');
			
			}).focusout(function(){
			
				$('#div_search').css('border', '1px solid #fff');
			
			}).keyup(function(){
			
				searchUser();
			
			});
			
			$('.fa-user-times').live('click', function(){
			
				var user_id = $(this).attr('user_id');
				var user_name = $(this).attr('user_name');	
				var contact_reload = $(this).attr('contact_reload');	

				log('Убираем из списка контактов');//loger...	
				
				if(user_id > 0 && user_name != "")
				{
					if(data_key_crypt != '')
					{
						//Наш синхронный послелогинный ключ есть
												
						var send_data = new Object();
						send_data['sid'] = sid;
						send_data['user_id'] = user_id;
						send_data['user_name_md5'] = hex_md5(user_name.toString());
						
						var send_str = JSON.stringify( send_data );
						
						send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел		
						send_str = send_str.replaceAll(' ', '@@pr@@');
						send_str = encodeURIComponent(send_str);//Кодируем для URL						
						
						var data_str = send_str + '@';					
											
						var encrypted = getEncryptedStr(data_str, data_key_crypt);
						
						$.ajax({						
						type: 'POST',
						url: 'delFromFriend.php',
						data: 'encrypted=' + encrypted,
						async: true,
						success: function(msg){
						
							log('msg=' + msg);//loger...	
						
							var getData_mas = jQuery.parseJSON(msg);	
							var result = getData_mas['result'];	
							var sid_b = getData_mas['sid'];	
							
							log('result addToFriend=' + result);//loger...	
							
							if(sid_b == sid && result == 'del')
							{
								if(contact_reload == "1")
								{
									getListFriend();
								}
								else
								{
									$('.user_el[user_id=' + user_id + ']').css('display', 'none');
								
								}							
							}

							
							
								
							
							
						}});		
					
					
					}		
					else
					{
						log('Нет ключа - необходимо авторизоваться');//loger...	
					
					}
				}			
			
				
				
			});		
			
			
			$('.fa-user-plus').live('click', function(){
			
				var user_id = $(this).attr('user_id');
				var user_name = $(this).attr('user_name');
				var contact_reload = $(this).attr('contact_reload');
				
				log('Добавляем юзера в други');//loger...	
				
				if(user_id > 0 && user_name != "")
				{
					if(data_key_crypt != '')
					{
						//Наш синхронный послелогинный ключ есть
												
						var send_data = new Object();
						send_data['sid'] = sid;
						send_data['user_id'] = user_id;
						send_data['user_name_md5'] = hex_md5(user_name.toString());
						
						var send_str = JSON.stringify( send_data );
						
						send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
						send_str = send_str.replaceAll(' ', '@@pr@@');	
						send_str = encodeURIComponent(send_str);//Кодируем для URL						
						
						var data_str = send_str + '@';
												
						var encrypted = getEncryptedStr(data_str, data_key_crypt);
						
						$.ajax({						
						type: 'POST',
						url: 'addToFriend.php',
						data: 'encrypted=' + encrypted,
						async: true,
						success: function(msg){
						
							log('msg=' + msg);//loger...	
						
							var getData_mas = jQuery.parseJSON(msg);	
							var result = getData_mas['result'];	
							var sid_b = getData_mas['sid'];	
							
							log('result addToFriend=' + result);//loger...	
														
							if(sid_b == sid && result == 'add')
							{
								if(contact_reload == "1")
								{
									getListFriend();	
								}
								else
									$('.fa-user-plus[user_id=' + user_id + ']').css('display', 'none');
							}	
							
							
						}});		
					
					
					}		
					else
					{
						log('Нет ключа - необходимо авторизоваться');//loger...	
					
					}
				}			
			
			});	
			
			//==========================================
			
			function addSystemMsg(user_id, text)
			{
				var data_list_msg = $('#data_list_msg');
				
				var msg_time_conv_browser = getTimeBrowserSec();
				
				var date = new Date(msg_time_conv_browser * 1000);
				var hours = date.getHours();
				var minutes = date.getMinutes();					
							
				var time_ = hours + ':' + minutes;

				var time_abs = '<div style="position:absolute; right:5px; bottom:3px; font-size:13; color:#808080" class="preload_msg_time_system">' + time_ + '</div>';										
				
				var new_msg_from_div = '<div class="msg_clss_from_system" align="left"><div style="color:#fff" class="preload_msg_data_system">' + text + '</div>' + time_abs + '</div>';
				
				var new_msg_from_table = '<table width=100% cellpadding="0" cellspacing="0"><tr><td align="left">' + new_msg_from_div + '</td></tr></table>';
																	
		
				var msg_box = '<div class="msg_clss" >' + new_msg_from_table + '</div>';									
			
				log('msg_box=' + msg_box);//loger...	
				
				$('.abs_msg_con[user_id="' + user_id + '"]', data_list_msg).append(msg_box);
				
				var height_set = $('.abs_msg_con[user_id="' + user_id + '"]').height() + 50000;
				
				$('.abs_msg_con[user_id="' + user_id + '"]').animate({ scrollTop: height_set }, 1000);				
			
			}
			
			function msgSend()
			{
				var data_text_msg = $('#data_text_msg').val();
				
				if(data_text_msg != "")
				{
					var data_list_msg = $('#data_list_msg');
					
					var user_id_act = parseInt($('.abs_msg_con', data_list_msg).attr('user_id'));//Активный пользователь (ему мы сейчас отправим сообщение)			
					
					//Вообще делаем это все - если юзер онлайн
					
					//============================================================
					//============================================================
															
					var packet_id = getNextAutoIncrementId();
					
					log('packet_id=' + packet_id);//loger...		

					var packet_key = getUnicKeyPacket(packet_id);
					
					log('packet_key=' + packet_key);//loger...		
								
					var key_s_a_5 = getSKey(packet_id);
									
					var send_data = new Object();
					send_data['sid'] = sid;
					send_data['packet_key'] = packet_key;
					send_data['get_user_id'] = user_id_act;
					send_data['key_s_a_5'] = key_s_a_5.toString();//Передадим синхронный ключ для зашифровки длинных данных
					
					log('key_s_a_5 1=' + send_data['key_s_a_5']);//loger...	
					
					var send_str = JSON.stringify( send_data );
					
					send_str = send_str.replaceAll('+', '@@p@@');//Символ + отдельно кодируем ибо пхп-ная urldecode раскодирует + как пробел	
					send_str = send_str.replaceAll(' ', '@@pr@@');
					send_str = encodeURIComponent(send_str);//Кодируем для URL						
					
					var data_str = send_str + '@';	

					if(data_key_crypt != '')
					{
						var encrypted = getEncryptedStr(data_str, data_key_crypt);				
						
						$.ajax({						
						type: 'POST',
						url: 'getUserOnline.php',
						data: 'encrypted=' + encrypted,
						async: true,
						success: function(msg){
						
							log('getUserOnline msg_send msg=' + msg);//loger...	
							
							var getDecryptedData_mas = getDataDecryptedArray(msg, key_s_a_5);

							var _packet_key = getDecryptedData_mas['packet_key'];
							var _get_user_id = getDecryptedData_mas['get_user_id'];	
							var _online = getDecryptedData_mas['online'];	
							var _in_friend = getDecryptedData_mas['in_friend'];	
							
							if(packet_key == _packet_key)
							{
								if(user_id_act == _get_user_id)
								{
									if(_in_friend == 1)
									{
									
										//Смотрим - сквозным ли шифрованием передать пакет или нет
										
										var crypto_line = true;
										var send = false;
										
										if(msgs_mas[user_id_act])
										{
											if(!msgs_mas[user_id_act]['crypto_line'])
												crypto_line = false;
										
										}	

										if(crypto_line && _online == 1)//Мы хотим сквозным и чел онлайн - можно
											send = true;
											
										if(!crypto_line)//Мы хотим несквозным - всегда можно
											send = true;
									
										if(_online == 1)
											$('.online_td[user_id="' + _get_user_id + '"]').html('<span class="online"><i class="fa fa-circle" aria-hidden="true"></i></span>');
										else
											$('.online_td[user_id="' + _get_user_id + '"]').html('<span class="offline"><i class="fa fa-circle" aria-hidden="true"></i></span>');	
									
										if(send)
										{									
										
										
											//Ставим сообщение в очередь и добавляем в лог сообщений по юзеру
											
											if(msgs_mas[user_id_act])
											{
												//Юзер уже чет нам отослал.. или мы ему.. похер										
								
											}
											else
											{
												var list_data_list_msg = new Array();
												
												var data_list_msg_box = new Object();
												data_list_msg_box['data_list_msg'] = list_data_list_msg;
												data_list_msg_box['crypto_line'] = true;										
												
												msgs_mas[user_id_act] = data_list_msg_box;
												
												$('.abs_msg_con[user_id="' + user_id_act + '"]').html('');
											
											}
											
											var msg_id = getNextAutoIncrementId();
											var time_str = getTimeBrowserSec();
											
											var packet_id = getNextAutoIncrementId();
											
											log('msg packet_id=' + packet_id);//loger...											
											
											
											var msg_el = new Object();
											msg_el['user_from'] = '0';
											msg_el['time'] = time_str;
											msg_el['type'] = 'msg_0';
											msg_el['msg_time_add'] = time_str;
											msg_el['msg_id'] = msg_id;
											msg_el['packet_id'] = packet_id;
											msg_el['status'] = '0';//статус сообщения для user_from = 0, которое еще не отправилось, но отправляется юзеру.. часики типа нарисуем
											
											msgs_mas[user_id_act]['data_list_msg'].push(msg_el);							

											
											
											var lt = new Date();
											var time_full = lt.toLocaleTimeString();	
											
											var time_full_mas = time_full.split(':');
											
											var time_ = time_full_mas[0] + ':' + time_full_mas[1];

											var time_abs = '<div style="position:absolute; right:25px; bottom:3px; font-size:13; color:#808080">' + time_ + '</div>';
											var send_abs = '<div style="position:absolute; right:5px; bottom:5px; font-size:13; color:#1C5C78" class="preload_msg_status_send"><i class="fa fa-clock-o" id="loader_' + packet_id + '" style="font-size:13px" aria-hidden="true"></i></div>';
											
											var crypto_line_abs = '';
											
											if(crypto_line)
												crypto_line_abs = '<div style="position:absolute; right:5px; top:5px; font-size:13; color:#808080"><i class="fa fa-paper-plane" style="font-size:13px; color:#ff0000" aria-hidden="true"></i></div>';											
											
											var new_msg_from_div = '<div class="msg_clss_in" align="left"><div class="preload_msg_data">' + data_text_msg + '</div>' + time_abs + send_abs + crypto_line_abs+ '</div>';
											var new_msg_from_table = '<table width=100% cellpadding="0" cellspacing="0"><tr><td align="right">' + new_msg_from_div + '</td></tr></table>';
																								
											
											var sendDate = new Object();
											sendDate['packet_id'] = packet_id;											
											sendDate['msg_id'] = msg_id;
											sendDate['user_id'] = user_id_act;
											sendDate['crypto_line'] = crypto_line;	

											//Собираем реплейсы											
											
											var replys_str = '';
											
											var box_msg_reply = $('#box_msg_reply');
											
											$('.msg_reply', box_msg_reply).each(function(){											
																							
												var r_msg_packet_key = $(this).attr('msg_packet_key');
												var r_is_from = parseInt($(this).attr('is_from'));
												
												var r_text = $('.preload_msg_data', this).text();
													
												replys_str += r_msg_packet_key + '@r@' + r_is_from + '@r@' + r_text;
											
											});
											
											if(replys_str != "")
											{
												data_text_msg += '@@rr@@' + replys_str;
												msgReplyClose();
											}												
											
											//alert(data_text_msg);
											
											sendDate['msg'] = data_text_msg;
											//sendDate['replys_str'] = replys_str;	
											
											addSendMessage(sendDate);
										
											var msg_box = '<div class="msg_clss msg_clss_from" style="opacity:0" is_from="0" msg_id="' + msg_id + '" packet_id="' + packet_id + '"  time="' + time_str + '" >' + new_msg_from_table + '</div>';
										
											log('msg_box=' + msg_box);//loger...	
										
										
											var count_msg = parseInt($('.abs_msg_con[user_id="' + user_id_act + '"]').attr('count_msg'));
											
											if(count_msg == 0)
											{
												//$('.abs_msg_con[user_id="' + user_id_act + '"]', data_list_msg).html('');
											
											}
										
											$('.abs_msg_con[user_id="' + user_id_act + '"]', data_list_msg).append(msg_box);
											
											count_msg++;
											
											$('.abs_msg_con[user_id="' + user_id_act + '"]').attr('count_msg', count_msg)
											
											$('#data_text_msg').val('');								
										
											var height_set = $('.abs_msg_con[user_id="' + user_id_act + '"]').height() + 50000;
										
											$('.abs_msg_con[user_id="' + user_id_act + '"]').animate({ scrollTop: height_set }, 200);
											
										
											$('.msg_clss[msg_id=' + msg_id + ']').ready(function(){
											
												$('.msg_clss[msg_id=' + msg_id + ']').animate({
													opacity: 1
												  }, 300, function() {
													// Animation complete.
													
													$('.abs_msg_con[user_id="' + user_id_act + '"]').animate({ scrollTop: height_set }, 200);
											
													
												  });	
											
											
											});
											
											$('.abs_msg_con[user_id="' + user_id_act + '"]').animate({ scrollTop: height_set }, 200);
										
										
										}									
										else
										{
											
											if(crypto_line && _online != 1)
												addSystemMsg(user_id_act, 'Вы не можете отослать сквозное сообщение пользователю, - дождитесь пока он будет онлайн или измените статус шифрования переписки с этим пользователем. Для отключения свозного шифрования и перевода к обычному шифрованию нажмите на значок <i class="fa fa-paper-plane" style="font-size:13px; color:#ff0000" aria-hidden="true"></i> красного самолетика в правом верхнем углу.');
											

										}										
									}
									else
									{
									
										addSystemMsg(user_id_act, 'Вы не можете отослать сообщение пользователю, - Вы не состоите у него в друзьях');
									}
								

										

								}	
								else
									log('user_id_act = ' + user_id_act + '/_get_user_id=' + _get_user_id + ' ERROR');//loger...	
							}
							else
								log('packet_key getUserOnline ERROR');//loger...	

						

										
						}});		
										
						
					
					}
					else
						log('Нет ключа - необходимо авторизоваться');//loger...		
					
					//============================================================
					//============================================================
					
					

				}	
			
			
			}
			
			$('#data_text_msg').keydown(function (e) {

				var send_go = false;

				if (e.ctrlKey && e.keyCode == 13) {
				
					send_go = true;
				
				
				}
			  
				if (!e.shiftKey && e.keyCode == 13) {
				
					send_go = true;
					
				
				}		
			  
				if(send_go)
					msgSend();
			  
				writer();
			
			  
			});	
			
			$('#msg_send').click(function(){
			

				msgSend();
			
			});
			
			
			$('.menu_el').each(function(){
			
				var act = $(this).attr('act');
			
				if(act == '1')
					$(this).css({'color': '#000'});
			});
			
			$('.user_setter_name').live('click', function(){	
			
			
				$('#con_abs_box').animate({
					left: 0
				  }, 500, function() {
					// Animation complete.
			
					menu_state = 'msgs';
					
				  });		
				
				var user_id = $(this).attr('user_id');
				
				$('#online_td_msg').attr('user_id', user_id);//Для значка онлайна в сообщении
				var user_name = $(this).html();
				
				$('.menu_el').css({'color':'#668B8B'}).attr('act', '0');
				
				getUserOnline(user_id);
				
				getListMsg(user_id, user_name);					

				
				var crypto_line_state = true;
				
				if(msgs_mas[user_id])
				{
					if(!msgs_mas[user_id]['crypto_line'])
						crypto_line_state = false;				

				}
				
				if(crypto_line_state)
					$('#crypto_line_state').html('<i class="fa fa-paper-plane crypto_line_state_el" style="font-size:13px; color:#ff0000; cursor:pointer" crypto_line="1" aria-hidden="true"></i>');
				else
					$('#crypto_line_state').html('<i class="fa fa-paper-plane crypto_line_state_el" style="font-size:13px; color:#c0c0c0; cursor:pointer" crypto_line="0" aria-hidden="true"></i>');
				
				var height_set = $('.abs_msg_con[user_id="' + user_id + '"]').height() + 50000;
				
				$('.abs_msg_con[user_id="' + user_id + '"]').animate({ scrollTop: height_set }, 1000);
				
				stopEventLoadMsg();//Отключаем оповещелку.. 	
						
			});
			
			
			$('.menu_el').click(function(){
			
				$('#con_abs_box').stop();
			
				$('.menu_el').css({'color':'#668B8B'}).attr('act', '0');
				$(this).css({'color':'#000'}).attr('act', '1');
				
				var el_name = $(this).attr('el_name');
			
				if(el_name == 'cont')
				{
					$('#con_abs_box').animate({
						left: -320
					  }, 500, function() {
						// Animation complete.
						
						$('#user_search').val('');
						$('#data_search').html('');		

						menu_state = 'cont';	
						
					  });	

					//Получим тех кто у нас в листе
					
					getListFriend();	

					
				}
				else
				if(el_name == 'search')
				{
					
				
					$('#con_abs_box').animate({
						left: -638
					  }, 500, function() {
						// Animation complete.
						
						
						$('#data_contacts_box').html('<center><div class="preloader_friend">&nbsp;</div></center>');
						
						menu_state = 'search';
						
					  });
				
				}

			
			});
			
			$('.menu_el').mouseenter(function(){
			
				var act = $(this).attr('act');
			
				if(act == '0')	
					$(this).css({'color': '#000'});
			
			}).mouseleave(function(){
			
				var act = $(this).attr('act');
			
				if(act == '1')	
					$(this).css({'background-color':'#92D8F6', 'color': '#000'});
				else
					$(this).css({'background-color':'#92D8F6', 'color': '#668B8B'});
					
			
			});			
			
		
		});