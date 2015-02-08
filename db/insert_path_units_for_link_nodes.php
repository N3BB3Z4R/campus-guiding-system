<html>

<body>
<a href="insert_path_units_for_link_nodes.html">Inesrt next link node's path units...</a></br></br>

<?php
$con = mysql_connect("localhost", "root", "root");

if (!$con) {
	die('Could not connect: ' . mysql_error());
}

mysql_select_db("hkust_cgs", $con);

////////////////////////////////////////////////////////////////////

$sql = "SELECT linkID FROM link WHERE linkID = '$_POST[linkID]'";

if (!$result = mysql_query($sql, $con)) {
	die('Error: ' . mysql_error());
}

$row = mysql_fetch_row($result);

if ($row[0] == null) {
	die("Invaild linkID!");
}

////////////////////////////////////////////////////////////////////

$sql = "SELECT meterToTimeScale FROM config";

if (!$result = mysql_query($sql, $con)) {
	die('Error: ' . mysql_error());
}

$row = mysql_fetch_row($result);

$meterToTimeScale = $row[0];

////////////////////////////////////////////////////////////////////

$sql = "SELECT subType, accessOverheadTime, floorTravelOverHeadTime, unitFloorTravelTime FROM link WHERE
	linkID = '$_POST[linkID]'";

if (!$result = mysql_query($sql, $con)) {
	die('Error: ' . mysql_error());
}

$row = mysql_fetch_array($result, MYSQL_ASSOC);

$subType = $row['subType'];
$accessOverheadTime = $row['accessOverheadTime'];
$floorTravelOverHeadTime = $row['floorTravelOverHeadTime'];
$unitFloorTravelTime = $row['unitFloorTravelTime'];

////////////////////////////////////////////////////////////////////

$sql = "SELECT LN.nodeID, N.floorID FROM link AS L, link_node AS LN, node AS N WHERE
	L.linkID = '$_POST[linkID]' AND L.linkID = LN.linkID AND LN.nodeID = N.nodeID
	ORDER BY N.floorID";

if (!$result = mysql_query($sql, $con)) {
	die('Error: ' . mysql_error());
}

$linkNodeSet = array();

//convert the SELECT result into a php array for better processing
while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
	$linkNodeSet[] = $row;
}

////////////////////////////////////////////////////////////////////

echo "meterToTimeScale: ".$meterToTimeScale."</br></br>";

echo "subType: ".$subType."</br>";
echo "accessOverheadTime: ".$accessOverheadTime."</br>";
echo "floorTravelOverHeadTime: ".$floorTravelOverHeadTime."</br>";
echo "unitFloorTravelTime: ".$unitFloorTravelTime."</br></br>";

echo "nodeID:     floorID:</br>";
foreach ($linkNodeSet as $temp) {
	echo $temp['nodeID']."             ".$temp['floorID']."</br>";
}

echo "</br>            distanceCost:     timeCost:</br>";

////////////////////////////////////////////////////////////////////

foreach ($linkNodeSet as $x) {
	foreach ($linkNodeSet as $y) {
		if ($x['nodeID'] != $y['nodeID'] && $x['floorID'] < $y['floorID']) {
			$floorBetweenXY = $y['floorID'] - $x['floorID'];
			if ($subType == "Lift" || $subType == "Escalator") {
				if ($subType == "Lift") {
					$pathType = "L";
				} else {
					$pathType = "E";
				}
				$distanceCost = 0;
			} else {
				$pathType = "S";
				$distanceCost = ($unitFloorTravelTime / $meterToTimeScale) 
						* $floorBetweenXY;
			}
			$timeCost = ($floorTravelOverHeadTime + $unitFloorTravelTime) 
				    * $floorBetweenXY + $accessOverheadTime;

			echo "(floor ".$x['floorID'].") to (floor ".$y['floorID']."): "
			     .$distanceCost."             ".$timeCost."</br>";

			$nodeID = $x['nodeID'];
			$neighborNodeID = $y['nodeID'];

			$sql = "INSERT INTO path_unit (nodeID,neighborNodeID,pathType,distanceCost,timeCost) VALUES 
				('$nodeID','$neighborNodeID','$pathType','$distanceCost','$timeCost')";

			if (!mysql_query($sql, $con)) {
				die('Error: ' . mysql_error());
			}
		}
	}
}

////////////////////////////////////////////////////////////////////

mysql_close($con);
?> 
<body>

</html>