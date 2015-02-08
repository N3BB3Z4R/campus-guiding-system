<?php

// have $_GET[mode/keyword] from client request
require_once("db.php");

$con = openDB();

// Part 1/2: Get keyword's "nodeID", "nodeType", "mapID", "x", "y"

if ($_GET[keyword] == "") {
	$arr["notExistOn"] = "keyword";
	echo json_encode($arr);
	mysql_close($con);
	return;
}

$keyword = "%".str_ireplace(" ", "%", $_GET[keyword])."%";

$sql = "SELECT N.nodeID, N.nodeType, N.mapID, N.x, N.y
		FROM location_node AS LN, node AS N
		WHERE N.nodeID = LN.nodeID
		AND LN.name LIKE '$keyword'";

$rows = doQuery($con, $sql);

if ($rows[0]["nodeID"] == null) {
	$arr["notExistOn"] = "keyword";
	echo json_encode($arr);
	mysql_close($con);
	return;
}

$arr["notExistOn"] = "null";

// Part 2/2: Return result

// Case 1/2: "mode" = "X"

if ($_GET[mode] == "X") {
    $arr["nodeID"] = $rows[0]["nodeID"];
    $arr["nodeType"] = $rows[0]["nodeType"];
    $arr["mapID"] = $rows[0]["mapID"];
    $arr["x"] = $rows[0]["x"];
    $arr["y"] = $rows[0]["y"];
}

// Case 2/2: "mode" = "N"

if ($_GET[mode] == "N") {
	
}

echo json_encode($arr);

mysql_close($con);

?>
