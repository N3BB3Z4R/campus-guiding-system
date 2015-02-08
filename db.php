<?php

// create a database connection, the return object will be used by doQuery()
function openDB() {
	$con = mysql_connect('localhost', 'root', 'root')
		or die("Error: Database Connection Failure.");
	
	mysql_select_db('hkust_cgs', $con)
	//mysql_select_db('svc_cgs', $con)
		       or die ("Error: Database(".$dbname.") not found.");
	
	return $con;
}

// process the query in $sql, and covert the result into an array
function doQuery($con, $sql) {
	if (!$result = mysql_query($sql, $con)) {
		die('Error: ' . mysql_error());
	}

	$rows = array();

	// convert the SELECT result into a php array for better processing
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$rows[] = $row;
	}
	
	return $rows;
}

?>
