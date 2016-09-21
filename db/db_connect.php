<?php

	

require_once("req/my_sql.class");
$text=new  class_my_sql;
$ok=false;
if ($text->my_sql_connect()) {$ok=true;}
	


?>