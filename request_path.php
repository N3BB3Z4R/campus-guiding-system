<?php

// have $_GET[mode/keywordA/keywordB/L/E/S/costType] from client request
//$start_time = (float) microtime(true);
require_once("db.php");
require_once("dijkstra_class.php");

$con = openDB();

// ### Section 1/2: Get start nodeID and end nodeID by keywordA and keywordB ###

// Part 1/2: Get keywordA's "nodeID" and "name"

if ($_GET[keywordA] == "") {
	$arr["notExistOn"] = "keywordA";
	echo json_encode($arr);
	mysql_close($con);
	return;
}

if ($_GET[mode] == "D") {
	$sql = "SELECT defaultStartNodeID, defaultStartNodeName FROM config";
	$rows = doQuery($con, $sql);
	
	$startNodeID = $rows[0]["defaultStartNodeID"];
	$startNodeName = $rows[0]["defaultStartNodeName"];
} else {
	$keywordA = "%".str_ireplace(" ", "%", $_GET[keywordA])."%";

	if ($_GET[mode] == "X") {
		$sql = "SELECT nodeID, name FROM location_node WHERE name LIKE '$keywordA'";
	} else if ($_GET[mode] == "N") {
		$sql = "SELECT N.nodeID, LN.name, N.floorID, N.x, N.y, M.xRelativeToStartMap, M.yRelativeToStartMap
				FROM location_node AS LN, node AS N, map AS M
				WHERE N.nodeID = LN.nodeID
				AND N.mapID = M.mapID
				AND LN.name LIKE '$keywordA'";
	}
	$rows = doQuery($con, $sql);
	
	if ($rows[0]["nodeID"] == null) {
		$arr["notExistOn"] = "keywordA";
		echo json_encode($arr);
		mysql_close($con);
		return;
	}
	
	$startNodeID = $rows[0]["nodeID"];
	$startNodeName = $rows[0]["name"];
	
	if ($_GET[mode] == "N") {
		$floorIDForModeN = $rows[0]["floorID"];
		$xForModeN = $rows[0]["x"];
		$yForModeN = $rows[0]["y"];
		$xRTSMForModeN = $rows[0]["xRelativeToStartMap"];
		$yRTSMForModeN = $rows[0]["yRelativeToStartMap"];
	}
}

// Part 2/3: Get keywordB's "nodeID" and "name"

if ($_GET[keywordB] == "") {
	$arr["notExistOn"] = "keywordB";
	echo json_encode($arr);
	mysql_close($con);
	return;
}

if ($_GET[mode] == "D" || $_GET[mode] == "X") {
	$keywordB = "%".str_ireplace(" ", "%", $_GET[keywordB])."%";

	$sql = "SELECT nodeID, name FROM location_node WHERE name LIKE '$keywordB'";
	$rows = doQuery($con, $sql);
	
	if ($rows[0]["nodeID"] == null) {
		$arr["notExistOn"] = "keywordB";
		echo json_encode($arr);
		mysql_close($con);
		return;
	}
	
	$endNodeID = $rows[0]["nodeID"];
	$endNodeName = $rows[0]["name"];
} else if ($_GET[mode] == "N"){
	$sql = "SELECT N.nodeID, LN.name
			FROM node AS N, location_node AS LN, map AS M
			WHERE N.nodeID = LN.nodeID
			AND N.mapID = M.mapID
			AND LN.subType = '$_GET[keywordB]'
			AND ABS(CAST(N.floorID AS SIGNED)-'$floorIDForModeN') = (
				SELECT MIN(ABS(CAST(N.floorID AS SIGNED)-'$floorIDForModeN'))
				FROM node AS N, location_node AS LN
				WHERE N.nodeID = LN.nodeID
				AND LN.subType = '$_GET[keywordB]')
			ORDER BY SQRT(POW((CAST(N.x AS SIGNED)+M.xRelativeToStartMap)-('$xForModeN'+'$xRTSMForModeN'),2)
			+POW((CAST(N.y AS SIGNED)+M.yRelativeToStartMap)-('$yForModeN'+'$yRTSMForModeN'),2))";
	$rows = doQuery($con, $sql);
	
	if ($rows[0]["nodeID"] == null) {
		$arr["notExistOn"] = "keywordB";
		echo json_encode($arr);
		mysql_close($con);
		return;
	}
	
	$endNodeID = $rows[0]["nodeID"];
	$endNodeName = $rows[0]["name"];
}

$arr["notExistOn"] = "null";

// ### Section 2/2: Get result path ###

// I is the infinite distance.
define("I", 99999);
$ourMap = array();

$sql = "SELECT nodeID, neighborNodeID, distanceCost, timeCost FROM path_unit
		WHERE pathType = 'P'(L?)(E?)(S?)";
$sql = str_ireplace("(L?)", ($_GET[L]=="T")? " OR pathType = 'L'" : "", $sql);
$sql = str_ireplace("(E?)", ($_GET[E]=="T")? " OR pathType = 'E'" : "", $sql);
$sql = str_ireplace("(S?)", ($_GET[S]=="T")? " OR pathType = 'S'" : "", $sql);
$rows = doQuery($con, $sql);

if ($_GET[costType] == "SP") {
	$aKey = "mainCost";
	$bKey = "subCost";
} else if ($_GET[costType] == "MT") {
	$aKey = "subCost";
	$bKey = "mainCost";
}

foreach ($rows as $temp) {
	$ourMap[$temp["nodeID"]][$temp["neighborNodeID"]][$aKey] = $temp["distanceCost"];
	$ourMap[$temp["nodeID"]][$temp["neighborNodeID"]][$bKey] = $temp["timeCost"];

	$ourMap[$temp["neighborNodeID"]][$temp["nodeID"]][$aKey] = $temp["distanceCost"];
	$ourMap[$temp["neighborNodeID"]][$temp["nodeID"]][$bKey] = $temp["timeCost"];
}

// initialize the algorithm class
$dijkstra = new Dijkstra($ourMap, I);
$dijkstra->findShortestPath($startNodeID, $endNodeID);
$dijkstra->getResults((int)$endNodeID, $result);

// Part 3/3: Generate json

if ($result["pathNodes"] == null) {
	$arr["havePath"] = "F";
} else {
	$arr["havePath"] = "T";
	$arr["startNodeID"] = $result["pathNodes"][0];
	$arr["startNodeName"] = $startNodeName;
	$arr["endNodeID"] = $result["pathNodes"][count($result["pathNodes"]) - 1];
	$arr["endNodeName"] = $endNodeName;
	$arr["totalDistanceCost"] = $result[$aKey];
	$arr["totalTimeCost"] = $result[$bKey];

	foreach ($result["pathNodes"] as $node) {
		$rows = doQuery($con, "SELECT x, y, mapID FROM node WHERE nodeID = '$node'");
		
		if ($rows[0]["mapID"] != $previousMID) {
			if (count($mapsArr) - 1 >= 0) {
				$mapsArr[count($mapsArr) - 1]["tailNodeID"] = $previousNID;
			}
			$mapsArr[] = array("mapID" => $rows[0]["mapID"],
							   "headNodeID" => $node,
							   "nodes" => array());
		}
		$mapsArr[count($mapsArr) - 1]["nodes"][] = array("x" => $rows[0]["x"],
														 "y" => $rows[0]["y"]);
		$previousMID = $rows[0]["mapID"];
		$previousNID = $node;
	}
	$mapsArr[count($mapsArr) - 1]["tailNodeID"] = $previousNID;
	
	$arr["numberOfMap"] = count($mapsArr);
	$arr["maps"] = $mapsArr;
}

echo json_encode($arr);

mysql_close($con);
//$end_time = (float) microtime(true);
//echo " #Spent Time: ", ($end_time - $start_time), "(s)\n";
?>
