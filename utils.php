<?php


function getEncryptedDataError($packet_key, $sid)
{
	$key_s_error_1 = md5($packet_key . rand(0, 10000) . $sid);

	$count_sib = rand(1, 10);

	$alphabet = 'qwertyuioplkjhgfdsazxcvbnm';

	$data_return_str = '';

	for($k = 0; $k < $count_sib; $k++)
	{
		$rnd_s = rand(0, 25);
		$data_return_str .= substr($alphabet, $rnd_s, 1);

	}

	$encrypted_data = urlencode(base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $key_s_error_1, $data_return_str, MCRYPT_MODE_ECB)));
	$encrypted_data_urlencode = urlencode($encrypted_data);

	return $encrypted_data_urlencode;
}



?>