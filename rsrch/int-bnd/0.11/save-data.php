<?php
$filename = 'data/' . $_POST["pID"] . '.' . uniqid() . ".txt";
$myfile = fopen($filename, "w") or die("Unable to open file!");
fwrite($myfile, $_POST["txt"]);
fclose($myfile);
header('Location: end.html');
die();
?>