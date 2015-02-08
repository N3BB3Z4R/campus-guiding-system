<html>

<body>
<a href="insert_location_nodes.html">Input next location node...</a></br></br>

<?php
$con = mysql_connect("localhost", "root", "root");

if (!$con) {
	die('Could not connect: ' . mysql_error());
}

mysql_select_db("hkust_cgs", $con);





$sqlA = "INSERT INTO node VALUES
('$_POST[nodeID]','$_POST[nodeType]','$_POST[x]','$_POST[y]','$_POST[floorID]','$_POST[mapName]')";

$sqlB1 = "INSERT INTO location_node (nodeID,name,subType";
$sqlB2 =  ") VALUES ('$_POST[nodeID]','$_POST[name]','$_POST[subType]'";

if ($_POST[description] != null) {
	$sqlB1 .= ",description";
	$sqlB2 .= ",'$_POST[description]'";
}
if ($_POST[openPeriod] != null) {
	$sqlB1 .= ",openPeriod";
	$sqlB2 .= ",'$_POST[openPeriod]'";
}
if ($_POST[url] != null) {
	$sqlB1 .= ",url";
	$sqlB2 .= ",'$_POST[url]'";
}
if ($_POST[snapshotURL] != null) {
	$sqlB1 .= ",snapshotURL";
	$sqlB2 .= ",'$_POST[snapshotURL]'";
}
if ($_POST[snapshotWidth] != null) {
	$sqlB1 .= ",snapshotWidth";
	$sqlB2 .= ",'$_POST[snapshotWidth]'";
}
if ($_POST[snapshotHeight] != null) {
	$sqlB1 .= ",snapshotHeight";
	$sqlB2 .= ",'$_POST[snapshotHeight]'";
}

$sqlB2 .= ")";

$sqlB = $sqlB1.$sqlB2;





if (!mysql_query($sqlA, $con)) {
	die('Error: ' . mysql_error());
}
if (!mysql_query($sqlB, $con)) {
	die('Error: ' . mysql_error());
}
echo "Location added!";

mysql_close($con);
?> 
<body>

</html>