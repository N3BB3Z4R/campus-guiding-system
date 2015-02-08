// ============================================================ Global Variables ============================================================
// result object from "initialize_cgs.php"
var interfaceData;

// result object from "request_path.php"
var resultPathData;
var curStepNum = -1;

// result object from "load_map.php"
var mapData = new Array();

// jsDraw2D objects
var pathLayer = new jsGraphics(document.getElementById("path_layer"));
var lineWidth = 8;
var pen = new jsPen(new jsColor("red"), lineWidth);

// ceiling banner height
var bannerHeight = 120;

// space between the result path dialogs and head/tail nodes
var space = 20;

// location tags' side width
var tagSideWidth = 18;

// state of request type
var isGo = null;
var isGoNodeID;

// hoving tag element's ID
var hoverLinkNodeID;

// hoving tag node's name
var hoverNodeName

// current map's width and height
var originalMapWidth;
var originalMapHeight;
var curMapWidth;
var curMapHeight;

// browser's viewable content area width and height
var windowWidth;
var windowHeight;

// map's zooming scale
var scale = 0.2;

// map's shadow width
var mapShadowWidth = 8;

// current hover object for link's tooltip floor selector
var curHoverObj;

// previous floor ID
var preFloorID;

// boolean indicating whether first launch
var firstStart = true;

// ============================================================ Functions ============================================================
// ######################################## Show featured locations selector dialog ########################################
function showLocSelectorDialog(mode) {
	if (mode == "to") {
		$(".dlg_featured_location").dialog("option", "title", "Featured Locations Selector (X-to-Y: To)");
		$(".nearest_content").show();
	} else {
		(mode == "from")? $(".dlg_featured_location").dialog("option", "title", "Featured Locations Selector (X-to-Y: From)")
		: $(".dlg_featured_location").dialog("option", "title", "Featured Locations Selector (X: To)");
		$(".nearest_content").hide();
	}
	
	$("<span class='title_icon_dialog ui-icon ui-icon-star'></span>").insertBefore("#ui-dialog-title-1");
	$("#ui-dialog-title-1").addClass("title_dialog");
	
	$(".dlg_featured_location select").attr("selectedIndex", 0);
	$(".dlg_featured_location").attr("id", mode).dialog("close").dialog("option", "position", [238, 15 + bannerHeight]).dialog("open");
	$("[class*='ui-state-focus']").removeClass("ui-state-focus");
}

// ######################################## Show information dialog ########################################
function showInfoDialog(nodeType, nodeID, x, y) {
	var nodeInfoData;
	$.ajax({
		type: "GET",
		url: "request_node_info.php",
		data: {
			nodeType: nodeType,
			nodeID: nodeID
		},
		dataType: "json",
		async: false,
		success: function(data) {
			nodeInfoData = data;
		}
	});
	var contentStringA = "";
	var contentStringB = "";
	var contentStringC = "";
	var contentStringD = "";
	// if the node has snapshot, resize it to fit the information dialog
	if (nodeInfoData["snapshotURL"] != null) {
		var snapshotWidth = nodeInfoData["snapshotWidth"];
		var snapshotHeight = nodeInfoData["snapshotHeight"];
		var ratio;
		if (snapshotWidth > 350) {
			ratio = snapshotWidth / 350;
			snapshotWidth = 350;
			snapshotHeight /= ratio;
		}
		contentStringA = "<img src='" + nodeInfoData["snapshotURL"] + "' width='" + snapshotWidth + "' height='" + snapshotHeight + "'/><br />";
	}
	if (nodeType == "X") {
		if (nodeInfoData["openPeriod"] != null) {
			contentStringC = "<div class='dlg_info_content_title'>Open Period:</div><div class='dlg_info_sub_content'>" + nodeInfoData["openPeriod"] + "</div>";
		}
		if (nodeInfoData["url"] != null) {
			contentStringD = "<div class='dlg_info_content_title'>URL:</div><div class='dlg_info_sub_content'><a href='" + nodeInfoData["url"]
							 + "' target='_blank' class='url hover_highlight_url' style='word-wrap:break-word'>" + nodeInfoData["url"] + "</a></div>";
		}
	} else {
		if (nodeInfoData["operationPeriod"] != null) {
			contentStringC = "<div class='dlg_info_content_title'>Operation Period:</div><div class='dlg_info_sub_content'>" + nodeInfoData["operationPeriod"] + "</div>";
		}
	}
	if (nodeInfoData["description"] != null) {
		contentStringB = "<div class='dlg_info_content_title'>Description:</div><div class='dlg_info_sub_content'>" + nodeInfoData["description"] + "</div>";
	}
	
	if (contentStringB != "" || contentStringC != "" || contentStringD != "") {
		contentStringB = "<hr />" + contentStringB;
	}
	
	var contentString = contentStringA
						+ "<div style='padding-top: 3px'>"
							+ "<div style='float:left; padding-right: 8px'><b>Name:"
							+ "<div style='padding-top: 3px'>Type:</div></b></div>"
							+ "<div style='display: inline-block'>" + nodeInfoData["name"]
							+ "<div style='padding-top: 2px'><img src='" + interfaceData["subTypes"][nodeInfoData["subType"]] + "' />&nbsp;&nbsp;"
							+ "<span style='position: relative; top: -5px'>" + nodeInfoData["subType"] + "</span></b></div></div>"
						+ "</div>"
						+ contentStringB
						+ contentStringC
						+ contentStringD;
	
	// set information dialog's width according to the content's width
	var contentWidth = $(".dlg_info_content").html(contentString).width() + 10;
	if (contentWidth <= 260) {
		contentWidth = 260;
	} else if (nodeInfoData["snapshotURL"] == null) {
		contentWidth = 310;
	} else if (nodeInfoData["snapshotURL"] != null) {
		contentWidth = snapshotWidth;
	}
	
	$(".dlg_info")
	.html(contentString)
	.dialog("option", "width", contentWidth)
	.dialog("open");
	
	// width fix
	$(".dlg_info_sub_content").width(contentWidth - 13 + "px");
	var tempContentWidth = parseInt(contentWidth) + 10;
	$(".dlg_info").parent().width(tempContentWidth + "px");
	
	var contentHeight = $(".dlg_info").parent().height();
	var tempIsGo = isGo;
	isGo = "navigator_adjusting";
	$(".dlg_info")
	.dialog("close")
	.dialog(
		"option", "position", [(windowWidth - contentWidth - 23),
							   parseInt(bannerHeight + ((windowHeight - bannerHeight) / 2) - (contentHeight / 2))]
	)
	.dialog("open");
	isGo = tempIsGo;
	
	// width fix
	$(".dlg_info_sub_content").width(contentWidth - 13 + "px");
	var tempContentWidth = parseInt(contentWidth) + 10;
	$(".dlg_info").parent().width(tempContentWidth + "px");
	
	$("<span class='title_icon_dialog ui-icon ui-icon-info'></span>").insertBefore("#ui-dialog-title-2");
	$("#ui-dialog-title-2").addClass("title_dialog");
	
	// if this dialog is opened by clicking navigator
	if (isGo == "navigator") {
    	$(".dlg_info").dialog("option", "buttons", {
    		"Close": function() { $(this).dialog("close"); }
    	});
	} else {
    	$(".dlg_info").dialog("option", "buttons", {
    		"Close": function() { $(this).dialog("close"); },
    		"Open Navigator": function() {
    			var subType = nodeInfoData["subType"];
    			var curMapID = $(".ddl_floor").val();
    			$(".dlg_featured_location").dialog("close");
    			showCategoryNavigator(subType, curMapID, $.inArray(nodeID, mapData[curMapID]["subTypes"][subType]));
    			isGo = "navigator";
    			isGoNodeID = nodeID;
    		}
    	});
	}
	
	$("[class*='ui-state-focus']").removeClass("ui-state-focus");
	$("[class*='focusing']").removeClass("focusing").not("[class*='visible']").not("[class*='showing']").fadeOut("fast");
	$("#" + nodeID).addClass("focusing").fadeIn("slow");
	$(".tag_highlight").removeClass("tag_highlight").addClass("tag_no_shadow");
	$(".tag_no_shadow").addClass("tag_shadow");
	$("#" + nodeID).removeClass("tag_shadow").addClass("tag_highlight");
	centerMap(x, y);
}

// ######################################## Show category navigator ########################################
function showCategoryNavigator(subType, mapID, startNode) {
	var maps = interfaceData["maps"];
	var subTypeData = interfaceData["navigator"][subType];
	var category_maps = subTypeData["maps"];
	
	var curMapData = mapData[parseInt(mapID)];
	var category_nodes = curMapData["subTypes"][subType];
	var nodes = curMapData["nodes"];
	
	var contentStringA = "<hr />"
						 + "<div class='category_controls'>"
        	    		 + "<select class='ddl_category_floor'></select>"
	var contentStringB = "<span>&nbsp;&nbsp;</span>"
     					 + "<span class='btn_previous_floor hover_up ui-icon ui-icon-circle-arrow-s' title='Previous Floor'></span>"
            			 + "<span class='btn_next_floor hover_up ui-icon ui-icon-circle-arrow-n' title='Next Floor'></span>"
            			 + "<span>&nbsp;|&nbsp;&nbsp;</span>"
            			 + "<select class='ddl_category_node'></select>"
            			 + "<span>&nbsp;</span>"
            			 + "<span class='btn_head hover_up ui-icon ui-icon-seek-first' title='First Location on This Floor'></span>"
            			 + "<span class='btn_previous hover_up ui-icon ui-icon-triangle-1-w' title='Previous Location'></span>"
            			 + "<span class='btn_next hover_up ui-icon ui-icon-triangle-1-e' title='Next Location'></span>"
            			 + "<span class='btn_tail hover_up ui-icon ui-icon-seek-end' title='Last Location on This Floor'></span>";
    var contentStringC = "<span class='btn_close hover_up ui-icon ui-icon-close' title='Close Navigator'></span>"
						 + "</div>";
	var contentString = contentStringA + contentStringB + contentStringC;
	
	if (curStepNum != -1) {
		closePath();
	}
	isGo = "navigator";
	var haveThisSubType = $.inArray(mapID, subTypeData["maps"]) >= 0;
	// if floor with mapID has node with subType
	if (haveThisSubType) {
		$(".category_tabs ul li a").html("<span class='title'>&nbsp;&nbsp;" + subType + "</span>");
		var nodeKey;
		if (startNode == "head") {
			nodeKey = 0;
		} else if (startNode == "tail") {
			nodeKey = category_nodes.length - 1;
		} else {
			nodeKey = startNode;
		}
		
		$("<img class='img_subtype' src='" + interfaceData["subTypes"][subType] + "' />").insertBefore(".category_tabs ul li a .title");
		$(".category_tabs ul li a").append(" (<span class='category_rank'>" + (nodeKey + 1) + "</span>/" + category_nodes.length + " of this floor) ("
										   + subTypeData["numberOfNode"] + " total)");
		$(".category_content").html("Name: &nbsp;<b>" + nodes[category_nodes[nodeKey]]["name"] + "</b>" + contentString);
		
		// fill category node drop down list's options
    	for (var key in category_nodes) {
    			$(".ddl_category_node").append("<option value='" + category_nodes[key] + "'>" + nodes[category_nodes[key]]["name"] + "</option>");
    	}
    	$(".ddl_category_node").val(category_nodes[nodeKey]);
    	
    	isGoNodeID = category_nodes[nodeKey];
    	showInfoDialog(nodes[category_nodes[nodeKey]]["nodeType"], category_nodes[nodeKey],
					   nodes[category_nodes[nodeKey]]["x"], nodes[category_nodes[nodeKey]]["y"]);
	} else {
		$(".category_tabs ul li a").html("<span class='title'>" + subType + "</span>");
		$("<span class='title_icon ui-icon ui-icon-alert'></span>").insertBefore(".category_tabs ul li a .title");
		$(".category_tabs ul li a").append(" (0 on this floor) (" + subTypeData["numberOfNode"] + " total)");
		
		$(".category_content").html("This floor does not have any <b>" + subType + "</b>.<br />"
									+ "Please select a floor with <b>" + subType + "</b> from the list below." + contentStringA + contentStringC);
		$(".ddl_category_floor").width(274);
	}
	
	// fill category floor drop down list's options
	for (var key in category_maps) {
			$(".ddl_category_floor").prepend("<option value='" + category_maps[key] + "'>" + maps[category_maps[key]]["mapName"] + "</option>");
	}
	if (haveThisSubType) {
		$(".ddl_category_floor").val(mapID);
	} else {
		$(".ddl_category_floor").prepend("<option value='select'>Select...</option>").val("select");
	}
	
	// register events handlers:
	$(".ddl_category_floor").change(function() {
		if ($(".ddl_category_floor").hasClass("tail")) {
			$(".ddl_category_floor").removeClass("tail");
			drawMap($(".ddl_category_floor").val());
			showCategoryNavigator(subType, $(".ddl_category_floor").val(), "tail");
		} else {
			$(".ddl_category_floor").removeClass("head");
			drawMap($(".ddl_category_floor").val());
			showCategoryNavigator(subType, $(".ddl_category_floor").val(), "head");
		}
	});
	$(".ddl_category_node").change(function() {
		var nodeID = $(".ddl_category_node").val();
		hideShowAndFocusClass();
		$(".category_rank").html($(".ddl_category_node").attr("selectedIndex") + 1);
		isGoNodeID = category_nodes[nodeKey];
    	showInfoDialog(nodes[nodeID]["nodeType"], nodeID, nodes[nodeID]["x"], nodes[nodeID]["y"]);
    	$(".category_content b").html($(".ddl_category_node option:selected").text());
	});
	
	$(".btn_previous_floor").click(function() {
		var newIndex = $(".ddl_category_floor").attr("selectedIndex") + 1;
		if (newIndex < $(".ddl_category_floor option").length) {
			$(".ddl_category_floor").attr("selectedIndex", newIndex).trigger("change");
		} else {
			$(".ddl_category_floor").removeClass("tail");
		}
	});
	$(".btn_next_floor").click(function() {
		var newIndex = $(".ddl_category_floor").attr("selectedIndex") - 1;
		if (newIndex >= 0) {
			$(".ddl_category_floor").attr("selectedIndex", newIndex).trigger("change");
		} else {
			$(".ddl_category_floor").removeClass("head");
		}
	});
	
	$(".btn_head").click(function() {
		if ($(".ddl_category_node").attr("selectedIndex") != 0) {
			$(".ddl_category_node").attr("selectedIndex", 0).trigger("change");
		}
	});
	$(".btn_previous").click(function() {
		var newIndex = $(".ddl_category_node").attr("selectedIndex") - 1;
		if (newIndex >= 0) {
			$(".ddl_category_node").attr("selectedIndex", newIndex).trigger("change");
		} else {
			$(".ddl_category_floor").addClass("tail")
			$(".btn_previous_floor").trigger("click");
		}
	});
	$(".btn_next").click(function() {
		var newIndex = $(".ddl_category_node").attr("selectedIndex") + 1;
		if (newIndex < $(".ddl_category_node option").length) {
			$(".ddl_category_node").attr("selectedIndex", newIndex).trigger("change");
		} else {
			$(".ddl_category_floor").addClass("head")
			$(".btn_next_floor").trigger("click");
		}
	});
	$(".btn_tail").click(function() {
		if ($(".ddl_category_node").attr("selectedIndex") != $(".ddl_category_node option").length - 1) {
			$(".ddl_category_node").attr("selectedIndex", $(".ddl_category_node option").length - 1).trigger("change");
		}
	});
	
	$(".btn_close").click(function() {
		$(".dlg_info").dialog("close");
	});
	
	$(".category_tabs").fadeIn("slow");
}

// ######################################## Draw map ########################################
function drawMap(mapID) {
	// return if requesting the same map as current one
	if (parseInt(mapID) == parseInt(preFloorID) && !firstStart) {
		return;
	}
	
	// get the needed map data if not already cached
	if (mapData[parseInt(mapID)] == null) {
    	$.ajax({
    		type: "GET",
    		url: "load_map.php",
    		data: {mapID: mapID},
    		dataType: "json",
    		async: false,
    		success: function(data) {
    			mapData[parseInt(mapID)] = data;
    		}
    	});
	}
	if (curStepNum == -1 && !isGo) {
		$(".map_container").css({
			"left": (80 + mapShadowWidth) + "px",
			"top": (15 + mapShadowWidth) + "px"
			}, 500
		);
	}
	originalMapWidth = interfaceData["maps"][mapID]["mapWidth"];
	originalMapHeight = interfaceData["maps"][mapID]["mapHeight"];
	curMapWidth = originalMapWidth * scale;
	curMapHeight = originalMapHeight * scale;
	$(".map_container, .bg_layer, .map_layer, .path_layer, .tag_layer").css({
		"width": curMapWidth + "px",
		"height": curMapHeight + "px"
	});
	$(".tag_layer").css({
		"opacity": "0.5",
		"filter": "alpha(opacity=50)"
	});
	$(".map_layer").hide();
	$(".map_layer").attr("src", interfaceData["maps"][mapID]["mapURL"]).bind("onreadystatechange load", function() {
		if (this.complete) {
			$(".map_layer").fadeIn(200);
			$(".tag_layer").animate({
				"opacity": "1",
				"filter": "alpha(opacity=100)"
			}, 200);
			if (curStepNum != -1) {
				var curMapNodeData = mapData[parseInt(mapID)]["nodes"];
				var curPathData = resultPathData["maps"][curStepNum];
				$(".dlg_path_head").css({
					"left": curMapNodeData[curPathData["headNodeID"]]["x"] * scale - ($(".dlg_path_head").width() / 2) + "px",
					"top": curMapNodeData[curPathData["headNodeID"]]["y"] * scale - $(".dlg_path_head").height() - space + "px"
				});
				$(".dlg_path_tail").css({
					"left": curMapNodeData[curPathData["tailNodeID"]]["x"] * scale - ($(".dlg_path_tail").width() / 2) + "px",
					"top": curMapNodeData[curPathData["tailNodeID"]]["y"] * scale - $(".dlg_path_tail").height() - space + "px"
				});
			}
			$(".map_layer").unbind("onreadystatechange load");
		}
	});
	
	// place the location tags onto the map
	var curMapData = mapData[parseInt(mapID)];
	var subTypes = curMapData["subTypes"];
	$(".tag_layer").html("");
	$(".locations_accordion div div span").html("0");
	for (var keyA in subTypes) {
		for (var keyB in subTypes[keyA]) {
			$(".tag_layer").append("<img src='" + interfaceData["subTypes"][keyA]
								   + "' id='" + subTypes[keyA][keyB]
								   + "' class='" + keyA + " tag tag_shadow' style='position:absolute; "
								   + "left:" + (curMapData["nodes"][subTypes[keyA][keyB]]["x"] * scale - (tagSideWidth/2)) + "px; "
								   + "top:" + (curMapData["nodes"][subTypes[keyA][keyB]]["y"] * scale - (tagSideWidth/2)) +"px;"
								   + "' title='Click for Details' />");
			if ($(".locations_accordion div input[class*='" + keyA + "']").attr("checked")) {
				$("#" + subTypes[keyA][keyB]).addClass("visible").show();
			} else {
				$("#" + subTypes[keyA][keyB]).hide();
			}
		}
		$("span[class*='" + keyA + "']").html(subTypes[keyA].length);
	}
	
	// handle tags' interaction events
	$(".tag")
	.mouseover(function() {
		$(this).css("cursor", "pointer");
	})
	.hoverIntent({
		sensitivity: 1, // number = sensitivity threshold (must be 1 or higher)
		interval: 200, // number = milliseconds for onMouseOver polling interval
		over: // function = onMouseOver callback (REQUIRED)
		function() {
			var id = $(this).attr("id");
			var subType = curMapData["nodes"][id]["subType"];
			$(".tooltip ul li a").html("<img class='img_subtype' src='" + interfaceData["subTypes"][subType]
									   + "' />" + "<span class='title'>&nbsp;&nbsp;" + subType + "</span>");
			$(".tooltip_name").html("Name: <b>" + curMapData["nodes"][id]["name"] + "</b>");
			if (curMapData["nodes"][id]["nodeType"] == "X") {
				if (subType != "WC - Men" && subType != "WC - Women" && subType != "Express Station") {
					hoverNodeName = curMapData["nodes"][id]["name"];
        			$(".fill").show();
        		} else {
        			$(".fill").hide();
        		}
    			$(".ddl_floors").hide();
    		} else {
    			var linkAccessibleFloor = curMapData["linkAccessibleFloors"][id];
    			$(".ddl_floors").html("");
    			for (var key in linkAccessibleFloor) {
    				$(".ddl_floors").prepend("<option class='ddl_floors_option' value='" + linkAccessibleFloor[key] + "'>"
											 + interfaceData["maps"][linkAccessibleFloor[key]]["mapName"]
											 + ((linkAccessibleFloor[key] == $(".ddl_floor").val())? " (Current Floor)" : "")
											 + "</option>");
    			}
				$(".ddl_floors").val(mapID).show();
    			$(".fill").hide();
    			hoverLinkNodeID = id;
    		}
    		$(".tooltip").show().css("width", "auto");
    		if (curMapData["nodes"][id]["nodeType"] != "L" && $(".tooltip").width() <= 100) {
    			$(".tooltip").width(100);
    		}
			$(".tooltip").show().css({
				"left": ($(this).position().left - ($(".tooltip").width() / 2) + (tagSideWidth / 2)) + "px",
				"top": ($(this).position().top - $(".tooltip").height() - space + (tagSideWidth / 2)) + "px"
			});
		},
		timeout: 200, // number = milliseconds delay before onMouseOut
		out: // function = onMouseOut callback (REQUIRED)
		function() {
			if (!$(".tooltip").hasClass("hovering")) {
				$(".tooltip").removeClass("hovering").fadeOut("fast");
			}
		}
	})
	.click(function() {
		var id = $(this).attr("id");
		if (isGo == "go" && id != isGoNodeID) {
			hideShowAndFocusClass();
			isGo = null;
		} else if (isGo == "navigator" && id != isGoNodeID) {
			$(".dlg_info").dialog("close");
			isGo = null;
		}
		showInfoDialog(curMapData["nodes"][id]["nodeType"], id, curMapData["nodes"][id]["x"], curMapData["nodes"][id]["y"]);
	});
	
	// handle tag filter check boxs change
	$(".locations_accordion div input").change(function() {
		if ($(this).attr("checked")) {
			$(".tag[class*='" + $(this).attr("class") + "']").addClass("visible").show();
		} else {
			$(".tag[class*='" + $(this).attr("class") + "']").removeClass("visible").not($("[class*='showing']")).not("[class*='focusing']").hide();
		}
	});
	
	// change floor drop down list's selected field
	preFloorID = mapID;
	$(".ddl_floor").val(mapID);
}

// ######################################## Center the map by the point (x, y) ########################################
function centerMap(x, y) {
	$(".map_container").animate({
		"left": (($(".viewable_box").width() / 2) - x * scale) + "px",
		"top": (($(".viewable_box").height() / 2) - y * scale) + "px"
		}, 500
	);
}

// ######################################## Format time from (second) to (minute, second) ########################################
function formatTime(s) {
	if (s < 60) {
		return s + "s";
	} else {
		return Math.floor(s / 60) + "m " + (s % 60) + "s";
	}	
}

// ######################################## Hide elements with class "showing" or "focusing" ########################################
function hideShowAndFocusClass() {
    $(".tag[class*='showing']").add(".tag_layer img[class*='focusing']").not("[class*='visible']").fadeOut("fast");
    $(".tag[class*='showing']").removeClass("showing");
    $(".tag[class*='focusing']").removeClass("focusing");
}

// ######################################## Hide the result path and it's interface elements ########################################
function closePath() {
	curStepNum = -1;
	$(".instruction_tabs").tabs({ selected: 0 });
    $(".dlg_path_head, .dlg_path_tail, .path_layer, .instruction_tabs").fadeOut("fast");
    $(".dlg_info").dialog("close");
	hideShowAndFocusClass();
}

// ######################################## Print path on path layer ########################################
function printPath() {
	var curPathData = resultPathData["maps"][curStepNum];
	
	// load path points' (x, y) to array: points for path drawing
	var points = new Array();
	for (var key in curPathData["nodes"]) {
		points.push(new jsPoint(
			curPathData["nodes"][key]["x"] * scale,
			curPathData["nodes"][key]["y"] * scale
		));
	}
    
    // clear previous path and draw new one
	pathLayer.clear();
    pathLayer.drawPolyline(pen, points);
}

// ######################################## Draw path on map ########################################
function drawPath() {
	// aliases for shorter
	var curPathData = resultPathData["maps"][curStepNum];
	var mapID = curPathData["mapID"];

	// draw the needed map
	drawMap(mapID);

	// show map, path, head/tail dialogs, instruction tabs
	$(".dlg_path_head, .dlg_path_tail, .instruction_tabs").fadeIn("slow");
	$(".instruction_tabs ul li").removeClass("ui-state-focus");
	$(".path_layer").stop(true, true).css("filter", "alpha(opacity=60").fadeIn("slow");

	// ******************** Part 1/6: Path Drawing ********************
	printPath();

	// ******************** Part 2/6: Print Head/Tail Dialogs ********************
	// aliases for shorter
    var curMapNodeData = mapData[parseInt(mapID)]["nodes"];
    
    // print head/tail dialogs contents:
    // head dialog:
    if (curStepNum == 0) {
    	$(".dlg_path_head ul li a").html("<span class='title_icon ui-icon ui-icon-pin-s'></span><span class='title'>Departure (from)</span>");
    	$(".path_head_content").html("<span>You are here: <b>" + curMapNodeData[curPathData["headNodeID"]]["name"] + "</b></span>");
    } else {
    	$(".dlg_path_head ul li a").html("<span class='title_icon ui-icon ui-icon-pin-s'></span><span class='title'>Midway (from)</span>");
    	$(".path_head_content").html("<div style='white-space: nowrap'>"
									 	+ "<div style='float:left; padding-right: 5px'>Leave: <br /> On: </div>"
									 	+ "<div style='display: inline-block'><b>" + curMapNodeData[curPathData["headNodeID"]]["name"]
									 	+ "<br />" + interfaceData["maps"][curPathData["mapID"]]["mapName"] + "</b></div>"
									 + "</div>"
									 + "<span class='btn_previous hover_up ui-icon ui-icon-triangle-1-w' title='Previous Step'></span>");
    }
    // tail dialog:
    if (curStepNum == resultPathData["maps"].length - 1) {
    	$(".dlg_path_tail ul li a").html("<span class='title_icon ui-icon ui-icon-flag'></span><span class='title'>Destination (to)</span>");
    	$(".path_tail_content").html("<span>You reached: <b>" + curMapNodeData[curPathData["tailNodeID"]]["name"] + "</b></span>"
									+ "<br /><span class='btn_close hover_up ui-icon ui-icon-close' title='Close Result Path'></span>"
									+ "<span class='btn_rollback hover_up ui-icon ui-icon-arrowrefresh-1-w' title='Back to First Step'></span>");
    } else {
    	$(".dlg_path_tail ul li a").html("<span class='title_icon ui-icon ui-icon-flag'></span><span class='title'>Midway (to)</span>");
    	$(".path_tail_content").html("<div style='white-space: nowrap'>"
									 	+"<div style='float:left; padding-right: 5px'>Access: <br /> To: </div>"
									 	+ "<div style='display: inline-block'><b>" + curMapNodeData[curPathData["tailNodeID"]]["name"]
									 	+ "<br />" + interfaceData["maps"][resultPathData["maps"][curStepNum + 1]["mapID"]]["mapName"] + "</b></div>"
									 + "</div>"
									 + "<span class='btn_next hover_up ui-icon ui-icon-triangle-1-e' title='Next Step'></span>");
    }
    
    // position head/tail dialogs
    $(".dlg_path_head").css({
    	"left": curMapNodeData[curPathData["headNodeID"]]["x"] * scale - ($(".dlg_path_head").width() / 2) + "px",
    	"top": curMapNodeData[curPathData["headNodeID"]]["y"] * scale - $(".dlg_path_head").height() - space + "px"
    });
    $(".dlg_path_tail").css({
    	"left": curMapNodeData[curPathData["tailNodeID"]]["x"] * scale - ($(".dlg_path_tail").width() / 2) + "px",
    	"top": curMapNodeData[curPathData["tailNodeID"]]["y"] * scale - $(".dlg_path_tail").height() - space + "px"
    });
    
    // ******************** Part 3/6: Show Head/Tail Tags ********************
    $("#" + curPathData["headNodeID"]).addClass("showing").show();
    $("#" + curPathData["tailNodeID"]).addClass("showing").show();
    
    // ******************** Part 4/6: Print Instruction Tabs(Steps Tab) ********************
    // show the first instruction tab
    $(".instruction_tabs").tabs('option', 'selected', 0).children("div").css("padding", "0.2em 5px 5px 5px");
	
	// print steps tab contents:
	$(".steps_content").html("<div style='padding-top:5px'><b>Step " + (curStepNum + 1) + " / " + resultPathData["maps"].length + ":</b></div><hr />"
							 + "<div style='float:left; padding-right:5px'>From: <br />To: </div>"
							 + "<b>"
							 + "<span class='from hover_highlight' title='Jump to &#34;" + curMapNodeData[curPathData["headNodeID"]]["name"] + "&#34;'>"
							 + curMapNodeData[curPathData["headNodeID"]]["name"] + "</span><br />"
							 + "<span class='to hover_highlight' title='Jump to &#34;" + curMapNodeData[curPathData["tailNodeID"]]["name"] + "&#34;'>"
							 + curMapNodeData[curPathData["tailNodeID"]]["name"] + "</span>"
							 + "</b>"
							 + "<span class='btn_close hover_up ui-icon ui-icon-close' title='Close Result Path'></span>"
							 + "<span class='btn_tail hover_up ui-icon ui-icon-seek-end' title='Last Step'></span>"
							 + "<span class='btn_next hover_up ui-icon ui-icon-triangle-1-e' title='Next Step'></span>"
							 + "<span class='btn_previous hover_up ui-icon ui-icon-triangle-1-w' title='Previous Step'></span>"
							 + "<span class='btn_head hover_up ui-icon ui-icon-seek-first' title='First Step'></span>");
	
	// ******************** Part 5/6: Print Instruction Tabs(Information Tab) ******************** 
	// tick and cross icons
	var isChecked = "<span class='ui-icon ui-icon-check' style='float:left'></span>";
	var notChecked = "<span class='ui-icon ui-icon-close' style='float:left'></span>";
	
	// print information tab contents:
	$(".info_content").html("<div style='float:left; padding-right: 5px'>Departure: <br /> Destination: </div>"
							+ "<div><b>" + resultPathData["startNodeName"]
							+ "<br />" + resultPathData["endNodeName"] + "</b></div><hr />"
							+ "<div style='float:left; padding-right: 5px'>Estimated Distance Cost: <br /> Estimated Time Cost: </div>"
							+ "<div><b>" + Math.round(resultPathData["totalDistanceCost"]) + " m"
							+ "<br />" + formatTime(Math.round(resultPathData["totalTimeCost"])) + " </b></div><hr />"
							+ " <span style='float:left'>Search Options: &nbsp;</span>"
							+ (($(".ckb_lift").attr("checked"))? isChecked : notChecked) + " <span style='float:left'> Lift </span>"
							+ (($(".ckb_escalator").attr("checked"))? isChecked : notChecked) + "<span style='float:left'> Escalator </span>"
							+ (($(".ckb_stair").attr("checked"))? isChecked : notChecked) + "<span style='float:left'> Stair</span>"
							+ "<span style='float:left'>, <b>" + (($(".ddl_search_opt").val()=="SP")? "Shortest Path" : "Minimal Time") + "</b></span>");
	
	// ******************** Part 6/6: Register Events Handlers ********************
	$(".from").click(function() {
		centerMap(curMapNodeData[curPathData["headNodeID"]]["x"], curMapNodeData[curPathData["headNodeID"]]["y"]);
	});
	$(".to").click(function() {
		centerMap(curMapNodeData[curPathData["tailNodeID"]]["x"], curMapNodeData[curPathData["tailNodeID"]]["y"]);
	});
	
	$(".btn_head").click(function() {
    	curStepNum = 0;
    	drawPath();
	});
	$(".btn_previous").click(function() {
    	if (curStepNum > 0) {
			curStepNum--;
			drawPath();
		}
	});
	$(".btn_next").click(function() {
		if (curStepNum < resultPathData["maps"].length - 1) {
    		curStepNum++;
    		drawPath();
    	}
	});
	$(".btn_tail").click(function() {
    	curStepNum = resultPathData["maps"].length - 1;
    	drawPath();
	});
	$(".btn_rollback").click(function() {
    	curStepNum = 0;
    	drawPath();
	});
	
	$(".btn_close, .btn_reset_xy, .btn_reset_x").click(function() {
		closePath();
		$(".txb_from").select();
	});
	
	// center the map by head node
	centerMap(curMapNodeData[curPathData["headNodeID"]]["x"], curMapNodeData[curPathData["headNodeID"]]["y"]);
}

// ######################################## Stop any animation before map scale change ########################################
function preMapScaleChange() {
	$(".map_container, .bg_layer, .map_layer, .tag_layer, .path_layer, .dlg_path_head, .dlg_path_tail").stop(true, true);
	$(".tag_layer, .path_layer, .dlg_path_head, .dlg_path_tail").hide();
}

// ######################################## Change map scale ########################################
function changeMapScale(scale, mapLeft, mapTop) {
	// new map widht and height
	var newWidth = originalMapWidth * scale;
	var newHeight = originalMapHeight * scale;
	$(".path_layer, .tag_layer, .bg_layer").css({
		"width": newWidth + "px",
		"height": newHeight + "px"
	});
	
	// change map scale with jQuery animation
	var zoomScale = newWidth / curMapWidth;
	$(".map_container").animate({
		"left": ($(".map_container").position().left - ((zoomScale - 1) * mapLeft)) + "px",
		"top": ($(".map_container").position().top - ((zoomScale - 1) * mapTop)) + "px",
	}, { queue: false, duration: 300 });
	$(".map_container, .map_layer").animate({
		"width": newWidth + "px",
		"height": newHeight + "px"
	}, 300, function() {
		if (curStepNum != -1) {
			$(".path_layer, .dlg_path_head, .dlg_path_tail").fadeIn(150);
		}
		$(".tag_layer").fadeIn(150);
	});
	
	// update global variables current map width and height
	curMapWidth = newWidth;
	curMapHeight = newHeight;
	
	// update tags' position
	var curMapID = $(".ddl_floor").val();
	$(".tag").each(function() {
		$(this).css({
			"left": mapData[curMapID]["nodes"][$(this).attr("id")]["x"] * scale - (tagSideWidth / 2),
			"top":  mapData[curMapID]["nodes"][$(this).attr("id")]["y"] * scale - (tagSideWidth / 2)
		});
	});
	
	// update path head and tail dialogs' position
	if (curStepNum != -1) {
		var curPathData = resultPathData["maps"][curStepNum];
    	var curMapNodeData = mapData[curMapID]["nodes"];
    	$(".dlg_path_head").css({
    		"left": curMapNodeData[curPathData["headNodeID"]]["x"] * scale - ($(".dlg_path_head").width() / 2) + "px",
    		"top": curMapNodeData[curPathData["headNodeID"]]["y"] * scale - $(".dlg_path_head").height() - space + "px"
    	});
    	$(".dlg_path_tail").css({
	    	"left": curMapNodeData[curPathData["tailNodeID"]]["x"] * scale - ($(".dlg_path_tail").width() / 2) + "px",
    		"top": curMapNodeData[curPathData["tailNodeID"]]["y"] * scale - $(".dlg_path_tail").height() - space + "px"
    	});
		printPath();
	}
	
	//resize scale bar
	resizeScaleBar();
}

// ######################################## Slide the map scale slider ########################################
function slideScaleSlider() {
	preMapScaleChange();
	var curScale = $(".scale_slider").slider("option", "value");
	scale = curScale / 100;
	var vBox = $(".viewable_box");
	var map = $(".map_container");
	var mapPos = map.position();
	
	// if the map contact with the viewable area's center point, then change scale according this point
	if ( (mapPos.left < (vBox.width() / 2)) && ((mapPos.left + map.width()) > (vBox.width() / 2))
		&& (mapPos.top < (vBox.height() / 2)) && ((mapPos.top + map.height()) > (vBox.height() / 2)) ) {
		var mapLeft = (vBox.width() / 2) - mapPos.left;
		var mapTop = (vBox.height() / 2) - mapPos.top;
		changeMapScale(scale, mapLeft, mapTop);
	// else change scale according the map's center point
	} else {
		changeMapScale(scale, curMapWidth / 2, curMapHeight / 2);
	}
	$(".scale_percentage ul li a").html(curScale + "%");
}

// ######################################## Resize the scale bar ########################################
function resizeScaleBar() {
	var scaleMeter;
	var curScale = scale * 100;
	
	if (curScale <= 100 && curScale >= 80) {
		scaleMeter = 5;
	} else if (curScale <= 70 && curScale >= 50) {
		scaleMeter = 10;
	} else if (curScale <= 40 && curScale >= 30) {
		scaleMeter = 15;
	} else if (curScale == 20) {
		scaleMeter = 20;
	}
	$(".scale_meter").html(scaleMeter + "m");
	$(".scale_bar").stop(true, true).animate({ "width" : parseInt((scaleMeter / interfaceData["pixelToMeterScale"]) * scale) }, 300);
}

// ============================================================ Main Function ============================================================
// run this function once when the caller page startup
$(document).ready(function() {
	// ******************** Part 1/10: Initialize Global Variable: InterfaceData ********************
	$.ajax({
		type: "GET",
		url: "initialize_cgs.php",
		dataType: "json",
		async: false,
		success: function(data) {
			interfaceData = data;
		}
	});
	
	// ******************** Part 2/10: Left Menu: Search ********************
	// set related div to jQuery UI Tabs
	$(".search_tabs").tabs({
		selected: 0,
		show: function(event, ui) {
			$(".search_tabs ul li").removeClass("ui-state-focus");
			if (ui.index == 0) {
				$(".dlg_featured_location").dialog("close");
				$(".txb_from").select();
			} else if (ui.index == 1) {
				$(".dlg_featured_location").dialog("close");
				$(".txb_to_x").select();
			}
		}
	});
	
	// handle "Enter" key while focus on a input textbox
	$(".txb_from, .txb_to").keyup(function(e) {
		if (e.keyCode == 13) {
			$(".btn_show_path").click();
		}
	});
	$(".txb_to_x").keyup(function(e) {
		if (e.keyCode == 13) {
			$("#nest_lift_form").submit();
		}
	});
	
	// style the buttons
	$(".styled_btn").button().click(function() {
		$(this).blur();
	});
	$(".styled_btn span").css("padding", "0px");
	
	// register star buttons click event
	$(".btn_from_star").click(function() {
		showLocSelectorDialog("from");
		$(".txb_from").addClass("txb_highlight").select();
	});
	$(".btn_to_star").click(function() {
		showLocSelectorDialog("to");
		$(".txb_to").addClass("txb_highlight").select();
	});
	$(".btn_to_star_x").click(function() {
		showLocSelectorDialog("to_x");
		$(".txb_to_x").addClass("txb_highlight").select();
	});
	
	// "Reset" button clicked: focus related input textbox
	$(".btn_reset_xy, .btn_reset_x").click(function() {
		$(".dlg_info, .dlg_featured_location").dialog("close");
    	if ($(".search_tabs").tabs("option", "selected") == 0) {
    		$(".txb_to").val("");
    		$(".txb_from").val("").select();
		} else {
			$(".txb_to_x").val("").select();
    	}
	});
	
	// handle default location button click event
	$(".btn_default_location").click(function() {
		$(".txb_from").val(interfaceData["defaultStartNodeName"]).select();
	}).attr("title", "Fill \"" + interfaceData["defaultStartNodeName"] + "\" to \"From\"");
	
	// handle field exchange button click event
	$(".btn_field_exchange").click(function() {
		var temp = $(".txb_from").val();
		$(".txb_from").val($(".txb_to").val());
		$(".txb_to").val(temp).select();
	});

	// "Show Path" button clicked: get needed map and draw path
	$(".btn_show_path").click(function() {
		var mode;
		var keywordB_nearest;
		if ($(".txb_from").val() == "") {
				$(".dlg_warming").html("\"From\" location name is required!");
				$(".dlg_warming").dialog("open");
				$(".dlg_warming").dialog("option", "close", function() { $(".txb_from").select(); });
				return;
		}
		if ($(".txb_to").val() == "") {
				$(".dlg_warming").html("\"To\" location name is required!");
				$(".dlg_warming").dialog("open");
				$(".dlg_warming").dialog("option", "close", function() { $(".txb_to").select(); });
				return;
		}
		var fromLT = "";
		var toLT = "";
		if ($(".txb_from").val().toUpperCase().match(/LT[ABCDEFGHJK]/)) {
			var temp = $(".txb_from").val().toUpperCase().split("LT");
			fromLT = "LT-" + (temp[1].toUpperCase());
		}
		if ($(".txb_to").val().toUpperCase().match(/LT[ABCDEFGHJK]/)) {
			var temp = $(".txb_to").val().toUpperCase().split("LT");
			toLT = "LT-" + (temp[1].toUpperCase());
		}
		if ($(".txb_from").val() == $(".txb_to").val()) {
				$(".dlg_warming").html("\"From\" and \"To\" are the same!");
				$(".dlg_warming").dialog("open");
				$(".dlg_warming").dialog("option", "close", function() { $(".txb_to").select(); });
				return;
		}
		if ($(".txb_to:text[value^='nearest: ']").length) {
			for (var key in interfaceData["nearest"]) {
				if ($(".txb_to:text[value$='" + interfaceData["nearest"][key] + "']").length) {
					keywordB_nearest = interfaceData["nearest"][key];
					mode = "N";
					break;
				}
			}
// *Change the following error messages to more detail later!
			if (mode != "N") {
					$(".dlg_warming").html("Invalid nearest location type!");
					$(".dlg_warming").dialog("open");
					$(".dlg_warming").dialog("option", "close", function() { $(".txb_to").select(); });
					return;
			}
		} else if ($(".txb_from").val() == interfaceData["defaultStartNodeName"]) {
			mode = "D";
		} else {
			mode = "X";
		}
		$.ajax({
			type: "GET",
			url: "request_path.php",
			data: {
				keywordA: (fromLT)? fromLT : ($(".txb_from").val()),
				keywordB: (toLT)? toLT : ((mode != "N")? $(".txb_to").val() : keywordB_nearest),
				mode: mode,
				L: ($(".ckb_lift").attr("checked"))? "T" : "F",
				E: ($(".ckb_escalator").attr("checked"))? "T" : "F",
				S: ($(".ckb_stair").attr("checked"))? "T" : "F",
				costType: $(".ddl_search_opt").val()
			},
			dataType: "json",
			async: false,
			success: function(data) {
				var tempResultPathData = resultPathData;
				resultPathData = data;
// *Change the following error messages to more detail later!
				if (resultPathData["notExistOn"] != "null") {
					if (resultPathData["notExistOn"] == "keywordA") {
						$(".dlg_warming").html("Location \"" + $(".txb_from").val() + "\" does not exist!");
						$(".dlg_warming").dialog("open");
						$(".dlg_warming").dialog("option", "close", function() { $(".txb_from").select(); });
					} else if (resultPathData["notExistOn"] == "keywordB") {
						$(".dlg_warming").html("Location \"" + $(".txb_to").val() + "\" does not exist!");
						$(".dlg_warming").dialog("open");
						$(".dlg_warming").dialog("option", "close", function() { $(".txb_to").select(); });
					}
					resultPathData = tempResultPathData;
					return;
				}
				if (resultPathData["havePath"] == "T") {
					$(".dlg_featured_location").dialog("close");
					closePath();
					curStepNum = 0;
					drawPath();
				} else {
					$(".dlg_warming").html("No Path!");
					$(".dlg_warming").dialog("open");
					$(".dlg_warming").dialog("option", "close", function() { $(".txb_from").select(); });
					resultPathData = tempResultPathData;
					return;
				}
			}
		});
	});
	
	// "Suggest Nearest Lift" form submission
	$("#nest_lift_form").submit(function() {
		if ($(".txb_to_x").val() == "") {
// *Change the following error messages to more detail later!
			$(".dlg_warming").html("\"To\" location name is required!");
			$(".dlg_warming").dialog("open");
			$(".dlg_warming").dialog("option", "close", function() { $(".txb_to_x").select(); });
			$(".txb_to_x").select();
			return false;
		} else {
			$(".dlg_featured_location").dialog("close");
			var tempArray = $(".txb_to_x").val().split("-");
			$(".txb_to_x_copy").val("");
			for (var key in tempArray) {
				$(".txb_to_x_copy").val($(".txb_to_x_copy").val() + tempArray[key]);
			}
			$(".txb_to_x").select();
		}
	});	
	
	// "Suggest Nearest Lift" button clicked: trigger "Suggest Nearest Lift" form submission
	$(".btn_nest_lift").click(function() {
		$("#nest_lift_form").submit();
	});
	
	// "Go" button clicked: get needed map and show location
	$(".btn_go").click(function() {
		var toLT = "";
		if ($(".txb_to_x").val().toUpperCase().match(/LT[ABCDEFGHJK]/)) {
			var temp = $(".txb_to_x").val().toUpperCase().split("LT");
			toLT = "LT-" + (temp[1].toUpperCase());
		}
		var resultNodeData;
		var found = false;
		if ($(".txb_to_x").val() == "") {
			$(".dlg_warming").html("\"To\" location name is required!");
			$(".dlg_warming").dialog("open");
			$(".dlg_warming").dialog("option", "close", function() { $(".txb_to_x").select(); });
			return;
		}
		$.ajax({
			type: "GET",
			url: "request_node.php",
			data: {
				mode: "X",
				keyword: (toLT)? toLT : ($(".txb_to_x").val())
			},
			dataType: "json",
			async: false,
			success: function(data) {
				resultNodeData = data;
// *Change the following error messages to more detail later!
				if (resultNodeData["notExistOn"] != "null") {
					$(".dlg_warming").html("Location \"" + $(".txb_to_x").val() + "\" does not exist!");
					$(".dlg_warming").dialog("open");
					$(".dlg_warming").dialog("option", "close", function() { $(".txb_to_x").select(); });
					return;
				}
				found = true;
			}
		});
		if (found) {
    		$(".dlg_featured_location").dialog("close");
    		closePath();
    		isGo = "go";
    		isGoNodeID = resultNodeData["nodeID"];
    		drawMap(resultNodeData["mapID"]);
    		showInfoDialog("X", resultNodeData["nodeID"], resultNodeData["x"], resultNodeData["y"]);
    	}
	});
	
	// ******************** Part 3/10: Left Menu: Search: Featured Location Dialog ********************
	
	// set related div to jQuery UI Dialog (featured location dialog)
	$(".dlg_featured_location").dialog({
		autoOpen: false,
		resizable: false,
		closeOnEscape: false,
		bgiframe: true,
		width: 300,
		minHeight: 10,
		position: [205, 5],
   		//open: function() { $(".ui-dialog-titlebar-close").hide(); },
   		close: function() { $(".txb_from, .txb_to, .txb_to_x").removeClass("txb_highlight"); },
		buttons: { "Cancel": function() {
			var temp = $(".txb_highlight");
			$(this).dialog("close");
			temp.select();
		} }
	});
	
	// fill featured location dialog contents
	var featuredSubTypes = interfaceData["featured"];
	for (var keyA in featuredSubTypes) {
		var subTypeName = featuredSubTypes[keyA]["subType"];
		$(".type_title").append("<img src='" + interfaceData["subTypes"][subTypeName] + "' style='vertical-align:-10%'> &nbsp;" + subTypeName + ": <br />");
		
		var tempArray = subTypeName.split(" ");
		subTypeName = "";
		for (var key in tempArray) {
			subTypeName += tempArray[key];
		}
		
		$(".type_selector").append("<select class='ddl_" + subTypeName + "'><option value='select'>Select...</option></select><br />");
		for (var keyB in featuredSubTypes[keyA]["locationName"]) {
			var locationName = featuredSubTypes[keyA]["locationName"][keyB];
			$(".ddl_" + subTypeName).append("<option value='" + locationName + "'>" + locationName + "</option>");
		}
	}
	for (var key in interfaceData["nearest"]) {
		$(".ddl_nearest").append("<option value='nearest: " + interfaceData["nearest"][key] + "'>" + interfaceData["nearest"][key] + "</option>");
	}
	
	// register featured location dialog drop down lists change event
	$(".dlg_featured_location select").change(function() {
		var mode = $(".dlg_featured_location[class]").attr("id");
		if (mode == "from") {
			$(".search_tabs").tabs("option", "selected", 0);
			$(".txb_from").val($(this).val()).select();
		} else if (mode == "to") {
			$(".search_tabs").tabs("option", "selected", 0);
			$(".txb_to").val($(this).val()).select();
		} else {
			$(".search_tabs").tabs("option", "selected", 1);
			$(".txb_to_x").val($(this).val()).select();
		}
		$(".dlg_featured_location").dialog("close");
	});
	
	// ******************** Part 4/10: Left Menu: Navigator ********************
	// set related div to jQuery UI Tabs
	$(".navigator_tabs").tabs({ selected: 0 });
	
	// initialize floor drop down list
	var floors = interfaceData["floors"];
	for (var keyA in floors) {
		for (var keyB in floors[keyA]["maps"]) {
			var mapID = floors[keyA]["maps"][keyB];
			$(".ddl_floor").prepend("<option value='" + mapID + "'>" + interfaceData["maps"][mapID]["mapName"] + "</option>");
		}
	}
	
	// handle floor drop down list change event
	$(".ddl_floor").change(function() {
		closePath();
        drawMap($("option:selected", this).val());
	});
	
	// register navigator floor up/down buttons click event
	$(".btn_up").click(function() {
		var newIndex = $(".ddl_floor").attr("selectedIndex") - 1;
		if (newIndex >= 0) {
			$(".ddl_floor").attr("selectedIndex", newIndex).trigger("change");
		}
	});
	$(".btn_down").click(function() {
		var newIndex = $(".ddl_floor").attr("selectedIndex") + 1;
		if (newIndex < $(".ddl_floor option").length) {
			$(".ddl_floor").attr("selectedIndex", newIndex).trigger("change");
		}
	});
	
	// print location accordion's contents
	var tags = interfaceData["tags"];
	var contentString = "";
	for (var keyA in tags) {
		contentString += "<h3 class='accordion_title'><a>" + tags[keyA]["nodeCategory"] + "</a></h3><div>";
		for (var keyB in tags[keyA]["subTypes"]) {
			var subTypeName = tags[keyA]["subTypes"][keyB];
			contentString += "<input class='" + subTypeName + "' type='checkbox' /> "
							 + "<img src='" + interfaceData["subTypes"][subTypeName] + "' style='vertical-align:-10%'> &nbsp;"
							 + "<span href='#" + subTypeName + "' id='" + subTypeName + "' class='navType hover_highlight' title='Open &#34;" + subTypeName + "&#34; Navigator'>" + subTypeName + "</span>"
							 + "&nbsp;<div style='float:right;padding-top:0.7em'>(<span class='" + subTypeName + "'>0</span>)&nbsp;</div><br />";
		}
		contentString += "</div>";
	}
	$(".locations_accordion").append(contentString);
	
	// set related div to jQuery UI Accordion
	$(".locations_accordion").addClass("ui-accordion ui-widget ui-helper-reset")
	.find("h3")
		.addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom")
		.hover(
			function() { $(this).toggleClass("ui-state-hover"); },
			function() { $(this).toggleClass("ui-state-hover"); }
		)
		.prepend('<span class="ui-icon ui-icon-triangle-1-e"/>')
		.click(function() {
			$(this).toggleClass("ui-accordion-header-active").toggleClass("ui-state-active")
				.toggleClass("ui-state-default").toggleClass("ui-corner-bottom")
			.find("> .ui-icon").toggleClass("ui-icon-triangle-1-e").toggleClass("ui-icon-triangle-1-s")
			.end().next().toggleClass("ui-accordion-content-active").toggle();
			return false;
		})
		.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom").hide();
	
	// register "filters" and "categories" buttons' event handlers
	$(".btn_check_all").click(function() {
		$(".locations_accordion div input").attr("checked", true).trigger("change");
	});
	$(".btn_uncheck_all").click(function() {
		$(".locations_accordion div input").attr("checked", false).trigger("change");
	});
	$(".btn_expand_all").click(function() {
		$(".locations_accordion h3")
		.removeClass("ui-state-default ui-corner-bottom ui-accordion-header-active ui-state-active")
		.addClass("ui-accordion-header-active ui-state-active")
		.find("> .ui-icon")
		.removeClass("ui-icon-triangle-1-e ui-icon-triangle-1-s")
		.addClass("ui-icon-triangle-1-s")
		.end()
		.next()
		.removeClass("ui-accordion-content-active")
		.addClass("ui-accordion-content-active")
		.show();
	});
	$(".btn_collapse_all").click(function() {
		$(".locations_accordion h3")
		.removeClass("ui-state-default ui-corner-bottom ui-accordion-header-active ui-state-active")
		.addClass("ui-state-default ui-corner-bottom")
		.find("> .ui-icon")
		.removeClass("ui-icon-triangle-1-e ui-icon-triangle-1-s")
		.addClass("ui-icon-triangle-1-e")
		.end()
		.next()
		.removeClass("ui-accordion-content-active")
		.hide();
	});
	
	// register category names' click event handlers
	$(".navType").click(function() {
		$(".dlg_featured_location").dialog("close");
		$(".category_tabs").hide();
		showCategoryNavigator($(this).attr("id"), $(".ddl_floor").val(), "head");
	});
	
    // disable text selection of the accordion tabs' title
    if ($.browser.mozilla) { //Firefox
        $(".accordion_title").css("MozUserSelect", "none");
    } else if ($.browser.msie){ //IE
        $(".accordion_title").bind("selectstart", function() { return false; });
    } else{ //Opera, etc.
        $(".accordion_title").mousedown(function() { return false; });
    }
	
	// ******************** Part 5/10: Viewable Area: Path Showing Status Elements ********************
	// set related div to jQuery UI Tabs
	$(".dlg_path_head, .dlg_path_tail, .instruction_tabs").tabs();
	
	// set related div to jQuery UI Dialog (information dialog)
	$(".dlg_info").dialog({
		autoOpen: false,
		resizable: false,
		closeOnEscape: false,
		minHeight: 10,
		title: "Information",
   		//open: function() { $(".ui-dialog-titlebar-close").hide(); },
		buttons: {
			"Close": function() { $(this).dialog("close"); },
			"Open Navigator": function() {}
		},
		close: function() {
			if (isGo == "go") {
				isGo = null;
				hideShowAndFocusClass();
				$(".txb_to_x").select();
			} else if (isGo == "navigator_adjusting") {
				return;
			} else if (isGo == "navigator") {
				isGo = null;
				hideShowAndFocusClass();
				$(".category_tabs").fadeOut("fast");
			}
			$(".tag[class*='focusing']").not("[class*='visible']").not("[class*='showing']").removeClass("focusing").fadeOut("fast");
			$(".tag[class*='focusing']").removeClass("focusing");
			$(".tag_highlight").removeClass("tag_highlight").addClass("tag_no_shadow");
			$(".tag_no_shadow").addClass("tag_shadow");
		}
	});
	
	// ******************** Part 6/10: Viewable Area: Navigator Status Elements ********************
	// set related div to jQuery UI Tabs
	$(".category_tabs").tabs({ selected: 0 });
	
	// ******************** Part 7/10: Viewable Area: Scale Panel Elements ********************
	// set related div to jQuery UI Tabs
	$(".scale_percentage").tabs();
	$(".scale_percentage ul li a").html(scale * 100 + "%");
	
	// set related div to jQuery UI Slider
	$(".scale_slider").slider({
		orientation: "vertical",
		value: scale * 100,
		min: 20,
		max: 100,
		step: 10,
		slide: function(event, ui) {
			$(".scale_slider").slider("value", ui.value);
			slideScaleSlider();
		},
		change: function(event, ui) {
			$(".scale_percentage ul li a").html(ui.value + "%");
		}
	}).css("background", $(".ui-state-active").css("color"));
	
	// register scale panel buttons click event
	$(".btn_zoom_out").click(function() {
		var curScale = $(".scale_slider").slider("option", "value");
		if (curScale == 20) {
			return;
		}
		$(".scale_slider").slider("value", curScale - 10);
		slideScaleSlider();
	});
	$(".btn_zoom_in").click(function() {
		var curScale = $(".scale_slider").slider("option", "value");
		if (curScale == 100) {
			return;
		}
		$(".scale_slider").slider("value", curScale + 10);
		slideScaleSlider();
	});
	$(".btn_zoom_min").click(function() {
		$(".scale_slider").slider("value", 20);
		slideScaleSlider();
	});
	$(".btn_zoom_max").click(function() {
		$(".scale_slider").slider("value", 100);
		slideScaleSlider();
	});
	$(".btn_default_pos").click(function() {
		$(".map_container").animate({
			"left": (80 + mapShadowWidth) + "px",
			"top": (15 + mapShadowWidth) + "px"
		}, 500);
	});
	
	// remove slider handle's focus when mouse up and mouse out
	$(".ui-slider-handle").mouseup(function() {
		$(this).removeClass("ui-state-focus");
	});
	$(".ui-slider-handle").mouseout(function() {
		$(this).removeClass("ui-state-focus");
	});
	
	// ******************** Part 8/10: Viewable Area: Basic Elements ********************
	// set related div to jQuery UI Tabs
	$(".tooltip").tabs();
	
	// register tooltip from/to auto fill hover event hander
	$(".fill_from").hover(
			function() {
				$(".dlg_featured_location").dialog("close");
				$(".search_tabs").tabs("option", "selected", 0);
				$(".txb_from").addClass("txb_highlight").select();
			},
			function() { $(".txb_from").removeClass("txb_highlight"); }
	)
	$(".fill_to").hover(
			function() {
				$(".dlg_featured_location").dialog("close");
				$(".search_tabs").tabs("option", "selected", 0);
				$(".txb_to").addClass("txb_highlight").select();
				},
			function() { $(".txb_to").removeClass("txb_highlight"); }
	)

	// set the map to be draggable
	$(".map_container").draggable({ cursor: "move" });
	
	// set viewable box's width
	$(window).resize(function() {
		if (window.innerWidth) {
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;
		} else {
			windowWidth = (document.documentElement.clientWidth > 0) ? document.documentElement.clientWidth : document.body.clientWidth;
			windowHeight = (document.documentElement.clientHeight > 0) ? document.documentElement.clientHeight : document.body.clientHeight;
		}
		$(".viewable_box").width(windowWidth - 223);
		$(".viewable_box, .tabs_box").height(windowHeight - bannerHeight);
		/*(if ($(".dlg_info").dialog("isOpen")) {
			//$(".dlg_info").dialog("close").dialog("open");
			$(".dlg_info").dialog("option", "position", [(windowWidth - $(".dlg_info").dialog("option", "width") - 13),
														 (windowHeight / 2 - $(".dlg_info").closest(".ui-dialog").height() - 5 + bannerHeight)]);
		}*/
	});
	
	// register mouse wheel scroll event hander
	$(".map_container").mousewheel(function(event, delta) {
		// usage of delta:
		// var dir = delta > 0 ? 'Up' : 'Down', vel = delta;
		// $(".txb_from").val(dir + ' at a velocity of ' + vel);
		var curScale = $(".scale_slider").slider("option", "value");
		if ((curScale == 100 && delta > 0) || (curScale == 20 && delta < 0)) {
			return;
		}
		preMapScaleChange();

		var mapPos = $(this).position();
		var mapLeft = (event.pageX - mapPos.left - 223);
		var mapTop = (event.pageY - mapPos.top - 120);
		
		scale = ((delta > 0)? curScale + 10 : curScale - 10) / 100;
		changeMapScale(scale, mapLeft, mapTop);
		$(".scale_slider").slider("value", scale * 100);
	});
	
	// register tooltip hover event hander
	$(".tooltip").hover(
		function() {
			$(this).addClass("hovering");	
		},
		function() {
			if (!$(this).hasClass("ddl_hovering")) {
				$(this).removeClass("hovering").fadeOut("fast");
			}
		}
	);
	
	// register tooltip search button and from/to auto fill buttons event handers
	$(".tooltip_search").hover(function() {
		$(".tooltip_search").attr("title", "Show Path from \"" + $(".txb_from").val() + "\" to \"" + $(".txb_to").val() + "\"");
	})
	.click(function() {
		$(".search_tabs").tabs("option", "selected", 0);
		$(".btn_show_path").click();
		$(".tooltip").fadeOut("fast");
	});
	$(".fill_from").click(function() {
		$(".search_tabs").tabs("option", "selected", 0);
		$(".txb_from").val(hoverNodeName).select();
	});
	$(".fill_to").click(function() {
		$(".search_tabs").tabs("option", "selected", 0);
		$(".txb_to").val(hoverNodeName).select();
	});
	
	// register link's tooltip floor selector event hander
	function checkCursorOn(e) {
		if (!e) {
			e = window.event;
		}
		if (e.target) {
			curHoverObj = e.target;
		} else if (e.srcElement) {
			curHoverObj = e.srcElement;
		}
		if (curHoverObj.nodeType == 3) {
			curHoverObj = curHoverObj.parentNode;
		}
		if (!(curHoverObj.className == "ddl_floors" || curHoverObj.className == "ddl_floors_option")) {
			$(".ddl_floors").blur();
			$(".tooltip").removeClass("ddl_hovering hovering").hide();
			document.onmouseover = null;
			isGo = null;
		}
	} 
	$(".ddl_floors").click(function() {
		$(".tooltip").addClass("ddl_hovering");
		document.onmouseover = null;
		document.onmouseover = checkCursorOn;
	})
	.change(function() {
		if ($(this).val() != $(".ddl_floor").val()) {
			$(this).blur();
			$(".tooltip").removeClass("ddl_hovering hovering").hide();
			closePath();
			var previousMapData = mapData[parseInt($(".ddl_floor").val())];
			var previousLinkID = previousMapData["nodes"][hoverLinkNodeID]["linkID"];
			var previousX = parseInt(previousMapData["nodes"][hoverLinkNodeID]["x"]);
			var previousY = parseInt(previousMapData["nodes"][hoverLinkNodeID]["y"]);
			var previousPosLeft = parseInt($(".map_container").position().left);
			var previousPosTop = parseInt($(".map_container").position().top);
			drawMap($(this).val());
			var targetMapData = mapData[parseInt($(this).val())];
			var targetNodeID = targetMapData["linkIDToNodeID"][previousLinkID];
			var targetX = parseInt(targetMapData["nodes"][targetNodeID]["x"]);
			var targetY = parseInt(targetMapData["nodes"][targetNodeID]["y"]);
        	$(".map_container").css({
        		"left": (previousPosLeft + (previousX - targetX) * scale) + "px",
        		"top": (previousPosTop + (previousY - targetY) * scale) + "px"
        	});
			isGo = null;
		}
	});
	
	// register toggle title banner buttons click event
	$(".btn_toggle_banner").click(function() {
		$(".dlg_featured_location").dialog("close");
		this.blur();
		var minimized = (bannerHeight != 120)? true : false;
		bannerHeight = (minimized)? 120 : 15;
		$(".viewable_box").css("height", "1000px");
		$(".tabs_box, .viewable_box").animate({ "top": bannerHeight + "px" }, "fast", function() {
			$(window).trigger("resize");
		});
		if (minimized) {
			$(".img_ceiling_banner").fadeIn("fast");
			$(".minimized_banner").fadeOut("fast");
		} else {
			$(".img_ceiling_banner").fadeOut("fast");
			$(".minimized_banner").fadeIn("fast");
		}
	});
	
	// ******************** Part 9/10: Notice Dialog ********************
	// set related div to jQuery UI Dialog
	$(".dlg_warming").dialog({
		modal: true,
		autoOpen: false,
		resizable: false,
		width: 250,
		minHeight: 10,
		title: "Notice",
   		open: function() {
			//$(".ui-dialog-titlebar-close").hide();
			$("<span class='title_icon_dialog ui-icon ui-icon-alert'></span>").insertBefore("#ui-dialog-title-3");
			$("#ui-dialog-title-3").addClass("title_dialog");
			$(this).css("padding", "10px");
			$("[class*='ui-state-focus']").removeClass("ui-state-focus");
		},
		buttons: { "Close (ESC)": function() { $(this).dialog("close"); } }
	});

	// ******************** Part 10/10: Load Finished, Show Contents ********************
	$(".title_tab a").css("cursor", "default");
	$(".tabs_box, .viewable_box").css("top", bannerHeight + "px");
	$(window).trigger("resize");
	$(".ddl_floor").val(interfaceData["defaultStartMapID"]).trigger("change");
	$(".btn_check_all, .btn_expand_all").trigger("click");
	$("html, body").show();
	resizeScaleBar();
	$(".txb_from").select();
	if ($.browser.msie){ //IE
    	$(".map_container, .map_layer").show();
    	$(".path_layer, .tag_layer, .dlg_path_head, .dlg_path_tail").css("filter", "alpha(opacity=100");
    }
	firstStart = false;
});
