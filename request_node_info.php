<?php

// have $_GET[nodeType/nodeID] from client request
require_once("db.php");

$con = openDB();

// get "xSnapshotURLRoot", "lSnapshotURLRoot"

$sql = "SELECT xSnapshotURLRoot, lSnapshotURLRoot FROM config";
$rows = doQuery($con, $sql);

$xSnapshotURLRoot = $rows[0]["xSnapshotURLRoot"];
$lSnapshotURLRoot = $rows[0]["lSnapshotURLRoot"];

// Case 1/2: "nodeType" = "X"

if ($_GET[nodeType] == "X") {
	$sql = "SELECT name, subType, description, openPeriod,
			url, snapshotURL, snapshotWidth, snapshotHeight
			FROM location_node
			WHERE nodeID = '$_GET[nodeID]'";
	$rows = doQuery($con, $sql);

	$arr["openPeriod"] = $rows[0]["openPeriod"];
	$arr["url"] = $rows[0]["url"];
	if ($rows[0]["snapshotURL"] == null) {
		$arr["snapshotURL"] = null;
	} else {
		$arr["snapshotURL"] = $xSnapshotURLRoot.$rows[0]["snapshotURL"];
	}
}

// Case 2/2: "nodeType" = "L"

if ($_GET[nodeType] == "L") {
	$sql = "SELECT L.name, L.subType, L.description, L.operationPeriod,
			LN.snapshotURL, LN.snapshotWidth, LN.snapshotHeight
			FROM link AS L, link_node AS LN
			WHERE LN.nodeID = '$_GET[nodeID]' AND L.linkID = LN.linkID";
	$rows = doQuery($con, $sql);

	$arr["operationPeriod"] = $rows[0]["operationPeriod"];
	if ($rows[0]["snapshotURL"] == null) {
		$arr["snapshotURL"] = null;
	} else {
		$arr["snapshotURL"] = $lSnapshotURLRoot.$rows[0]["snapshotURL"];
	}
}

// Share parts:

	$arr["name"] = $rows[0]["name"];
	$arr["subType"] = $rows[0]["subType"];
	$arr["description"] = $rows[0]["description"];
	$arr["snapshotWidth"] = $rows[0]["snapshotWidth"];
	$arr["snapshotHeight"] = $rows[0]["snapshotHeight"];

echo json_encode($arr);

mysql_close($con);

?>
