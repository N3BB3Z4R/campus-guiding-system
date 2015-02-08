<html>

<body>
<a href="insert_path_units.html">Input next path units...</a></br></br>

<?php
//////////////////////////////////
$floorID = 4;
$mapID = 4;
$pxToM = 0.04;
$pxToS = 0.04;
//////////////////////////////////

$con = mysql_connect("localhost", "root", "root");

if (!$con) {
	die('Could not connect: ' . mysql_error());
}

mysql_select_db("hkust_cgs", $con);

////////////////////////////////////////////////////////////////////

$sql = "SELECT nodeID FROM node WHERE (mapID = '$mapID') AND 
	((x = '$_POST[ax]' AND y = '$_POST[ay]') OR 
	 (x = '$_POST[bx]' AND y = '$_POST[by]')) 
	ORDER BY nodeID";

if (!$result = mysql_query($sql, $con)) {
	die('Error: ' . mysql_error());
}

$ret = array();

//convert the SELECT result into a php array for better processing
while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
	$ret[] = $row;
}

////////////////////////////////////////////////////////////////////

if (($_POST[ax] == $_POST[bx] && $_POST[ay] == $_POST[by]) || $ret[0][nodeID] == null || count($ret) != 2) {
	die("Invaild node(s)!");
}

////////////////////////////////////////////////////////////////////

$pxLength = sqrt(pow($_POST[ax]-$_POST[bx],2) + pow($_POST[ay]-$_POST[by],2));

$distanceCost = $pxLength * $pxToM;
$timeCost = $pxLength * $pxToS;

$nodeID = $ret[0][nodeID];
$neighborNodeID = $ret[1][nodeID];

////////////////////////////////////////////////////////////////////

$sql = "INSERT INTO path_unit VALUES 
('$nodeID','$neighborNodeID','P','$distanceCost','$timeCost','$floorID','$mapID')";

if (!mysql_query($sql, $con)) {
	die('Error: ' . mysql_error());
}

////////////////////////////////////////////////////////////////////

echo "Path unit added between (nodeID: ".$ret[0][nodeID].") and (nodeID: ".$ret[1][nodeID].")!</br>";
echo "pxLength: ".$pxLength."px</br>";
echo "distanceCost: ".$distanceCost."m</br>";
echo "timeCost: ".$timeCost."s</br>";

////////////////////////////////////////////////////////////////////

mysql_close($con);
?> 
<body>

</html>