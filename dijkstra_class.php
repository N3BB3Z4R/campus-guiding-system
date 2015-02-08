<?php

class Dijkstra {
	// the result array
	var $resultPath = array();
	var $visited = array();
	var $distance = array();
	var $previousNode = array();
	var $startnode =null;
	var $map = array();
	var $infiniteDistance = 0;
	var $bestPath = 0;
	var $matrixWidth = 0;
 
	function Dijkstra(&$ourMap, $infiniteDistance) {
		$this->infiniteDistance = $infiniteDistance;
		$this->map = &$ourMap;
		$this->bestPath = 0;
	}

	function findShortestPath($start,$to = null) {
		$this->startnode = $start;
		foreach (array_keys($this->map) as $i) {
			if ($i == $this->startnode) {
				$this->visited[$i] = true;
				$this->distance[$i] = 0;
			} else {
				$this->visited[$i] = false;
				$this->distance[$i] = isset($this->map[$this->startnode][$i]["mainCost"]) 
					? $this->map[$this->startnode][$i]["mainCost"]
					: $this->infiniteDistance;
			}
			$this->previousNode[$i] = $this->startnode;
		}
 
		$maxTries = count($this->map);
		$tries = 0;
		while (in_array(false,$this->visited,true) && $tries <= $maxTries) {			
			$this->bestPath = $this->findBestPath($this->distance,array_keys($this->visited,false,true));
			if($to !== null && $this->bestPath === $to) {
				break;
			}
			$this->updateDistanceAndPrevious($this->bestPath);			
			$this->visited[$this->bestPath] = true;
			$tries++;
		}
	}

	function findBestPath($ourDistance, $ourNodesLeft) {
		$bestPath = $this->infiniteDistance;
		$bestNode = 0;
		for ($i = 0,$m=count($ourNodesLeft); $i < $m; $i++) {
			if($ourDistance[$ourNodesLeft[$i]] < $bestPath) {
				$bestPath = $ourDistance[$ourNodesLeft[$i]];
				$bestNode = $ourNodesLeft[$i];
			}
		}
		return $bestNode;
	}
 
	function updateDistanceAndPrevious($obp) {		
		foreach (array_keys($this->map) as $i) {
			if( 	(isset($this->map[$obp][$i]["mainCost"])) 
			    &&	(!($this->map[$obp][$i]["mainCost"] == $this->infiniteDistance) || ($this->map[$obp][$i]["mainCost"] == 0 ))	
				&&	(($this->distance[$obp] + $this->map[$obp][$i]["mainCost"]) < $this->distance[$i])
			) 	
			{
					$this->distance[$i] = $this->distance[$obp] + $this->map[$obp][$i]["mainCost"];
					$this->previousNode[$i] = $obp;
			}
		}
	}
  
	function printMap(&$map) {
		$placeholder = ' %' . strlen($this->infiniteDistance) .'d';
		$foo = '';
		for($i=0,$im=count($map);$i<$im;$i++) {
			for ($k=0,$m=$im;$k<$m;$k++) {
				$foo.= sprintf($placeholder, isset($map[$i][$k]) ? $map[$i][$k]["mainCost"] : $this->infiniteDistance);
			}
			$foo.= "\n";
		}
		return $foo;
	}

	function getResults($to = null, &$result) {
		$ourShortestPath = array();
		$foo = '';
		foreach (array_keys($this->map) as $i) {
			if($to !== null && $to !== $i) {
				continue;
			}
			$ourShortestPath[$i] = array();
			$endNode = null;
			$currNode = $i;
			$ourShortestPath[$i][] = $i;
			while ($endNode === null || $endNode != $this->startnode) {
				$ourShortestPath[$i][] = $this->previousNode[$currNode];
				$endNode = $this->previousNode[$currNode];
				$currNode = $this->previousNode[$currNode];
			}
			$ourShortestPath[$i] = array_reverse($ourShortestPath[$i]);
			if ($to === null || $to === $i) {
				if($this->distance[$i] >= $this->infiniteDistance) {
					// if there is no rounte.
					$result["pathNodes"] = null;
				} 
				else {
					$subCost = 0;
					foreach ($ourShortestPath as $temp) {
        				foreach ($temp as $node) {
							if (count($resultPath) != 0) {
								$subCost += $this->map[$resultPath[count($resultPath)-1]][$node]["subCost"];
							}
							$resultPath[] = $node;
        				}
        			}
        			$result["pathNodes"] = &$resultPath;
        			$result["mainCost"] = $this->distance[$i];
        			$result["subCost"] = $subCost;
				}
			}
		}
		return $foo;
	}
} // end class

?>
