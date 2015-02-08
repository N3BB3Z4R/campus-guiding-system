<?php

// have $_GET[mapID] from client request
require_once("db.php");

$con = openDB();

// Part 1/2: "subTypes", "nodes"

$sql = "(SELECT LN.subType, N.nodeType, LN.name, LN.nodeID, N.x, N.y
		FROM location_node AS LN, node AS N
		WHERE N.mapID = '$_GET[mapID]' AND LN.nodeID = N.nodeID
		ORDER BY LN.subType, LN.name, N.x, N.y
		) UNION (
		SELECT L.subType, N.nodeType, L.name, LN.nodeID, N.x, N.y
		FROM link AS L, link_node AS LN, node AS N
		WHERE N.mapID = '$_GET[mapID]' AND LN.nodeID = N.nodeID AND LN.linkID = L.linkID
		ORDER BY L.subType, L.name, N.x, N.y)
		ORDER BY subType, name, x, y";
$rows = doQuery($con, $sql);

foreach ($rows as $temp) {
	$subTypesArr[$temp["subType"]][] = $temp["nodeID"];
	$nodesArr[$temp["nodeID"]]["subType"] = $temp["subType"];
	$nodesArr[$temp["nodeID"]]["nodeType"] = $temp["nodeType"];
	$nodesArr[$temp["nodeID"]]["name"] = $temp["name"];
	$nodesArr[$temp["nodeID"]]["x"] = $temp["x"];
	$nodesArr[$temp["nodeID"]]["y"] = $temp["y"];
}

$sql = "SELECT LN.linkID, LN.nodeID
		FROM link_node AS LN, node AS N
		WHERE N.mapID = '$_GET[mapID]' AND LN.nodeID = N.nodeID
		ORDER BY LN.nodeID";
$rows = doQuery($con, $sql);

foreach ($rows as $temp) {
	$nodesArr[$temp["nodeID"]]["linkID"] = $temp["linkID"];
	$arr["linkIDToNodeID"][$temp["linkID"]] = $temp["nodeID"];
}

$arr["subTypes"] = $subTypesArr;
$arr["nodes"] = $nodesArr;

// Part 2/2: "links"

function fillLinks($linkID, $nodeID) {
	global $con, $arr;
	
	$sql = "SELECT M.mapID
			FROM map AS M, link_node AS LN, node AS N
			WHERE LN.linkID = '$linkID' AND LN.nodeID = N.nodeID AND N.floorID = M.floorID
			ORDER BY M.floorID";
	$rows = doQuery($con, $sql);
	
	foreach ($rows as $temp) {
		$arr["linkAccessibleFloors"][$nodeID][] = $temp["mapID"];
	}
}

$sql = "SELECT LN.linkID, N.nodeID
		FROM link_node AS LN, node AS N
		WHERE N.nodeType = 'L' AND LN.nodeID = N.nodeID AND N.mapID = '$_GET[mapID]'
		ORDER BY nodeID";
$rows = doQuery($con, $sql);

foreach ($rows as $temp) {
	fillLinks($temp["linkID"], $temp["nodeID"]);
}

echo json_encode($arr);

mysql_close($con);

?>
