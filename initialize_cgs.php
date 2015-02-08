<?php

// no $_GET[] from client request for this php page
require_once("db.php");

$con = openDB();

// Part 1/6: "pixelToMeterScale", "pixelToTimeScale", "meterToTimeScale", "defaultStartMapID", "defaultStartNodeName" and get "iconURLRoot", "mapURLRoot"

$sql = "SELECT pixelToMeterScale, pixelToTimeScale, meterToTimeScale, defaultStartMapID, defaultStartNodeName, iconURLRoot, mapURLRoot FROM config";
$rows = doQuery($con, $sql);

$arr["pixelToMeterScale"] = $rows[0]["pixelToMeterScale"];
$arr["pixelToTimeScale"] = $rows[0]["pixelToTimeScale"];
$arr["meterToTimeScale"] = $rows[0]["meterToTimeScale"];
$arr["defaultStartMapID"] = $rows[0]["defaultStartMapID"];
$arr["defaultStartNodeName"] = $rows[0]["defaultStartNodeName"];

$iconURLRoot = $rows[0]["iconURLRoot"];
$mapURLRoot = $rows[0]["mapURLRoot"];

// Part 2/6: "tags", "subTypes"

$sql = "SELECT nodeCategory, subType, iconURL FROM node_icon ORDER BY nodeCategory, subType";
$rows = doQuery($con, $sql);

foreach ($rows as $temp) {
	if ($temp["nodeCategory"] != $previousNC) {
		$tagsArr[] = array("nodeCategory" => $temp["nodeCategory"], "subTypes" => array());
	}
	$tagsArr[count($tagsArr) - 1]["subTypes"][] = $temp["subType"];
	$subTypesArr[$temp["subType"]] = $iconURLRoot.$temp["iconURL"];
	$previousNC = $temp["nodeCategory"];
}

$arr["tags"] = $tagsArr;
$arr["subTypes"] = $subTypesArr;

// Part 3/6: "floors", "maps"

$sql = "SELECT floorID, mapID, mapName, mapURL, mapWidth, mapHeight FROM map ORDER BY floorID, mapName";
$rows = doQuery($con, $sql);

foreach ($rows as $temp) {
	if ($temp["floorID"] != $previousFID) {
		$floorsArr[] = array("floorID" => $temp["floorID"], "maps" => array());
	}
	$floorsArr[count($floorsArr) - 1]["maps"][] = $temp["mapID"];
	$mapsArr[$temp["mapID"]]["mapName"] = $temp["mapName"];
	$mapsArr[$temp["mapID"]]["mapURL"] = $mapURLRoot.$temp["mapURL"];
	$mapsArr[$temp["mapID"]]["mapWidth"] = $temp["mapWidth"];
	$mapsArr[$temp["mapID"]]["mapHeight"] = $temp["mapHeight"];
	$previousFID = $temp["floorID"];
}

$arr["floors"] = $floorsArr;
$arr["maps"] = $mapsArr;

// Part 4/6: "navigator"

function fillNavigator($mode, $subType) {
	global $con, $arr;
	
	$sql = ($mode == "X")?
		"SELECT COUNT(N.nodeID) AS numberOfNode
		FROM node AS N, location_node AS LN
    	WHERE N.nodeID = LN.nodeID AND LN.subType = '$subType'"
		:
		"SELECT COUNT(N.nodeID) AS numberOfNode
		FROM node AS N, link_node AS LN, link AS L
    	WHERE N.nodeID = LN.nodeID AND L.linkID = LN.linkID AND L.subType = '$subType'";
	$rows = doQuery($con, $sql);
	
	$arr["navigator"][$subType]["numberOfNode"] = $rows[0]["numberOfNode"];
	
	$sql = ($mode == "X")?
		"SELECT DISTINCT N.mapID
		FROM node AS N, location_node AS LN, map AS M
		WHERE N.nodeID = LN.nodeID AND LN.subType = '$subType' AND N.mapID = M.mapID
		ORDER BY N.floorID, M.mapName"
		:
		"SELECT DISTINCT N.mapID
		FROM node AS N, link_node AS LN, link AS L, map AS M
		WHERE N.nodeID = LN.nodeID AND L.linkID = LN.linkID AND L.subType = '$subType' AND N.mapID = M.mapID
		ORDER BY N.floorID, M.mapName";
	$rows = doQuery($con, $sql);
	
	foreach ($rows as $temp) {
		$arr["navigator"][$subType]["maps"][] = $temp["mapID"];
	}
}

// in table "location_node":
$sql = "SELECT DISTINCT subType FROM location_node ORDER BY subType";
$rows = doQuery($con, $sql);

foreach ($rows as $temp) {
	fillNavigator("X", $temp["subType"]);
}

// in table "link":
$sql = "SELECT DISTINCT subType FROM link ORDER BY subType";
$rows = doQuery($con, $sql);

foreach ($rows as $temp) {
	fillNavigator("L", $temp["subType"]);
}

// Part 5/6: "featured"

$sql = "SELECT FS.subType, LN.name
		FROM featured_subtype AS FS, location_node AS LN
		WHERE FS.subType = LN.subType
		ORDER BY FS.subType, LN.name";
$rows = doQuery($con, $sql);

foreach ($rows as $temp) {
	if ($temp["subType"] != $previousNC) {
		$featuredArr[] = array("subType" => $temp["subType"], "locationName" => array());
	}
	$featuredArr[count($featuredArr) - 1]["locationName"][] = $temp["name"];
	$previousNC = $temp["subType"];
}

$arr["featured"] = $featuredArr;

// Part 6/6: "nearest"

$sql = "SELECT subType FROM nearest_subtype ORDER BY subType";
$rows = doQuery($con, $sql);

foreach ($rows as $temp) {
	$subTypeArr[] = $temp["subType"];
}

$arr["nearest"] = $subTypeArr;

echo json_encode($arr);

mysql_close($con);

?>
