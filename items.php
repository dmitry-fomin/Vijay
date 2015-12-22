<?php
$submitContent = file_get_contents('php://input');
if($submitContent)
{
	$fh = fopen("items.json", 'w+');
	fwrite($fh, $submitContent);
	fclose($fh);
}

exit(json_encode(array()));

?>