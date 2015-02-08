-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 20, 2010 at 01:15 AM
-- Server version: 5.1.39
-- PHP Version: 5.3.1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `svc_cgs`
--

-- --------------------------------------------------------

--
-- Table structure for table `config`
--

CREATE TABLE IF NOT EXISTS `config` (
  `defaultStartMapID` tinyint(3) unsigned NOT NULL COMMENT 'default mapID used for system startup',
  `defaultStartNodeID` mediumint(8) unsigned NOT NULL COMMENT 'default start node ID for path search',
  `defaultStartNodeName` varchar(50) NOT NULL COMMENT 'default start node name for path search',
  `pixelToMeterScale` float unsigned NOT NULL COMMENT 'e.g. 0.2 => 1 pixel on map equals to 20 cm',
  `pixelToTimeScale` float unsigned NOT NULL COMMENT 'e.g. 0.2 => 0.2 s is needed for a person to travel 1 pixel',
  `meterToTimeScale` float unsigned NOT NULL COMMENT 'e.g. 1 => 1 s is needed for a person to travel 1 m',
  `iconURLRoot` tinytext NOT NULL COMMENT 'icon images'' URL root',
  `mapURLRoot` tinytext NOT NULL COMMENT 'map images'' URL root',
  `xSnapshotURLRoot` tinytext NOT NULL COMMENT 'location node snapshots'' URL root',
  `lSnapshotURLRoot` tinytext NOT NULL COMMENT 'link node snapshots'' URL root',
  PRIMARY KEY (`pixelToMeterScale`,`pixelToTimeScale`,`meterToTimeScale`),
  KEY `defaultStartNodeID` (`defaultStartNodeID`),
  KEY `defaultStartMapID` (`defaultStartMapID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='system configs';

--
-- Dumping data for table `config`
--

INSERT INTO `config` (`defaultStartMapID`, `defaultStartNodeID`, `defaultStartNodeName`, `pixelToMeterScale`, `pixelToTimeScale`, `meterToTimeScale`, `iconURLRoot`, `mapURLRoot`, `xSnapshotURLRoot`, `lSnapshotURLRoot`) VALUES
(5, 47, 'Entrance', 0.04, 0.04, 1, 'images/svc/icons/', 'images/svc/maps/', 'images/svc/snapshots/locations/', 'images/svc/snapshots/links/');

-- --------------------------------------------------------

--
-- Table structure for table `featured_subtype`
--

CREATE TABLE IF NOT EXISTS `featured_subtype` (
  `subType` varchar(30) NOT NULL COMMENT 'featured subtype name',
  PRIMARY KEY (`subType`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='subtypes for featured locations selector';

--
-- Dumping data for table `featured_subtype`
--

INSERT INTO `featured_subtype` (`subType`) VALUES
('Landmark'),
('Restaurant');

-- --------------------------------------------------------

--
-- Table structure for table `keyword`
--

CREATE TABLE IF NOT EXISTS `keyword` (
  `nodeID` mediumint(8) unsigned NOT NULL COMMENT 'node''s ID',
  `keyword` varchar(50) NOT NULL COMMENT 'node''s keyword',
  PRIMARY KEY (`nodeID`,`keyword`),
  KEY `keyword` (`keyword`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='keyword for searching';

--
-- Dumping data for table `keyword`
--


-- --------------------------------------------------------

--
-- Table structure for table `link`
--

CREATE TABLE IF NOT EXISTS `link` (
  `linkID` smallint(5) unsigned NOT NULL AUTO_INCREMENT COMMENT 'link''s ID',
  `name` varchar(50) NOT NULL COMMENT 'link name',
  `subType` varchar(30) NOT NULL COMMENT 'e.g. Lift, Escalator, Stair, Linker...',
  `description` mediumtext COMMENT 'link description',
  `operationPeriod` tinytext COMMENT 'link operation period',
  `accessOverheadTime` smallint(5) unsigned NOT NULL COMMENT 'approximate time for waiting the lift (in second)',
  `floorTravelOverheadTime` smallint(5) unsigned NOT NULL COMMENT 'approximate time for waiting stop between each floor (in second)',
  `unitFloorTravelTime` smallint(5) unsigned NOT NULL COMMENT 'approximate time for the lift to travel one floor (in second)',
  PRIMARY KEY (`linkID`),
  KEY `subType` (`subType`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='e.g. lift, escalator, stair, linker...' AUTO_INCREMENT=6 ;

--
-- Dumping data for table `link`
--

INSERT INTO `link` (`linkID`, `name`, `subType`, `description`, `operationPeriod`, `accessOverheadTime`, `floorTravelOverheadTime`, `unitFloorTravelTime`) VALUES
(1, 'Lift 1', 'Lift', 'This is Lift 1.', '24 hours', 25, 4, 2),
(2, 'Lift 2', 'Lift', 'This is Lift 2.', '6:00am-12:00am', 25, 4, 2),
(3, 'Lift 3', 'Lift', 'This is Lift 3.', '24 hours', 25, 4, 2),
(4, 'Escalator 1', 'Escalator', 'This is Escalator 1.', '24 hours', 0, 0, 10),
(5, 'Stair 1', 'Stair', 'This is Stair 1.', NULL, 0, 0, 12);

-- --------------------------------------------------------

--
-- Table structure for table `link_node`
--

CREATE TABLE IF NOT EXISTS `link_node` (
  `nodeID` mediumint(8) unsigned NOT NULL COMMENT 'link node''s node ID',
  `linkID` smallint(5) unsigned NOT NULL COMMENT 'link number of this link node belongs to',
  `snapshotURL` tinytext COMMENT 'URL of the link snapshot',
  `snapshotWidth` smallint(5) unsigned DEFAULT NULL COMMENT 'snapshot width (in pixel)',
  `snapshotHeight` smallint(5) unsigned DEFAULT NULL COMMENT 'snapshot height (in pixel)',
  PRIMARY KEY (`nodeID`),
  KEY `linkID` (`linkID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='this table corresponds to table: link';

--
-- Dumping data for table `link_node`
--

INSERT INTO `link_node` (`nodeID`, `linkID`, `snapshotURL`, `snapshotWidth`, `snapshotHeight`) VALUES
(23, 1, NULL, NULL, NULL),
(24, 1, NULL, NULL, NULL),
(25, 2, NULL, NULL, NULL),
(26, 2, NULL, NULL, NULL),
(27, 3, NULL, NULL, NULL),
(28, 3, NULL, NULL, NULL),
(29, 1, NULL, NULL, NULL),
(30, 2, NULL, NULL, NULL),
(31, 3, NULL, NULL, NULL),
(32, 4, NULL, NULL, NULL),
(33, 4, NULL, NULL, NULL),
(34, 5, NULL, NULL, NULL),
(35, 5, NULL, NULL, NULL),
(36, 5, NULL, NULL, NULL),
(37, 5, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `location_node`
--

CREATE TABLE IF NOT EXISTS `location_node` (
  `nodeID` mediumint(8) unsigned NOT NULL COMMENT 'location node''s node ID',
  `name` varchar(50) NOT NULL COMMENT 'location name',
  `subType` varchar(30) NOT NULL COMMENT 'e.g. Room, Landmark...',
  `description` mediumtext COMMENT 'location description',
  `openPeriod` tinytext COMMENT 'location open period',
  `url` tinytext COMMENT 'location website URL',
  `snapshotURL` tinytext COMMENT 'URL of the location snapshot',
  `snapshotWidth` smallint(5) unsigned DEFAULT NULL COMMENT 'snapshot width (in pixel)',
  `snapshotHeight` smallint(5) unsigned DEFAULT NULL COMMENT 'snapshot height (in pixel)',
  PRIMARY KEY (`nodeID`),
  KEY `subType` (`subType`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='e.g. room, landmark...';

--
-- Dumping data for table `location_node`
--

INSERT INTO `location_node` (`nodeID`, `name`, `subType`, `description`, `openPeriod`, `url`, `snapshotURL`, `snapshotWidth`, `snapshotHeight`) VALUES
(1, 'Happy Restaurant', 'Restaurant', 'Best taste!', '7:00am-10:00pm', 'http://happyrestaurant.com', 'happy_restaurant.jpg', 499, 299),
(2, 'Room 02', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Room 01', 'Room', 'This property specifies whther the current rendered line should break if the content exceeds the boundary of the specified rendering box for an element (this is similar in some ways to the ''clip'' and ''overflow'' properties in intent.) This property should only apply if the element has a visual rendering, is an inline element with explicit height/width, is absolutely positioned and/or is a block element. ', NULL, 'http://abc.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxEND', NULL, NULL, NULL),
(4, 'Room 04', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Room 03', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Room 05', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'WC-Men (1A)', 'WC-Men', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'WC-Women (1A)', 'WC-Women', NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'Room 11', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'Room 12', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'Room 13', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'Room 23', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'Room 21', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Room 24', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'Room 22', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'WC-Men (3A)', 'WC-Men', NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'WC-Women (3A)', 'WC-Women', NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'Room 31', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'Room 42', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Room 41', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'Room 44', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'Room 43', 'Room', NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'E-Board', 'Landmark', NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'Entrance', 'Landmark', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `map`
--

CREATE TABLE IF NOT EXISTS `map` (
  `mapID` tinyint(3) unsigned NOT NULL AUTO_INCREMENT COMMENT 'map''s ID',
  `mapName` varchar(40) NOT NULL COMMENT 'map''s name (e.g. Ground Floor)',
  `floorID` tinyint(3) unsigned NOT NULL COMMENT 'floor number of this map represents (e.g. LG1=>0, F1=>2)',
  `mapURL` tinytext NOT NULL COMMENT 'URL of the map',
  `mapWidth` smallint(5) unsigned NOT NULL COMMENT 'map''s width (in pixel)',
  `mapHeight` smallint(5) unsigned NOT NULL COMMENT 'map''s height (in pixel)',
  `xRelativeToStartMap` smallint(5) NOT NULL COMMENT 'x coordinate for aligning to start map',
  `yRelativeToStartMap` smallint(5) NOT NULL COMMENT 'y coordinate for aligning to start map',
  PRIMARY KEY (`mapID`),
  UNIQUE KEY `mapName` (`mapName`),
  KEY `floorID` (`floorID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='storing information of each map image' AUTO_INCREMENT=6 ;

--
-- Dumping data for table `map`
--

INSERT INTO `map` (`mapID`, `mapName`, `floorID`, `mapURL`, `mapWidth`, `mapHeight`, `xRelativeToStartMap`, `yRelativeToStartMap`) VALUES
(1, 'Floor 1', 1, 'floor_1.gif', 1010, 710, 0, 0),
(2, 'Floor 2', 2, 'floor_2.gif', 1010, 710, 0, 0),
(3, 'Floor 3', 3, 'floor_3.gif', 1010, 710, 0, 0),
(4, 'Floor 4', 4, 'floor_4.gif', 1010, 710, 0, 0),
(5, 'Ground Floor', 0, 'floor_0.gif', 1010, 1410, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `nearest_subtype`
--

CREATE TABLE IF NOT EXISTS `nearest_subtype` (
  `subType` varchar(30) NOT NULL COMMENT 'nearest subtype name',
  PRIMARY KEY (`subType`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='subtypes for nearest locations selector';

--
-- Dumping data for table `nearest_subtype`
--

INSERT INTO `nearest_subtype` (`subType`) VALUES
('Landmark'),
('WC-Men'),
('WC-Women');

-- --------------------------------------------------------

--
-- Table structure for table `node`
--

CREATE TABLE IF NOT EXISTS `node` (
  `nodeID` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'unified node ID',
  `nodeType` enum('X','L','P') NOT NULL COMMENT 'X / L / P',
  `x` smallint(5) unsigned NOT NULL COMMENT 'node''s x coordinate',
  `y` smallint(5) unsigned NOT NULL COMMENT 'node''s y coordinate',
  `floorID` tinyint(3) unsigned NOT NULL COMMENT 'floor number of this node on',
  `mapID` tinyint(3) unsigned NOT NULL COMMENT 'map number of this node on',
  PRIMARY KEY (`nodeID`),
  UNIQUE KEY `x` (`x`,`y`,`mapID`),
  KEY `floorID` (`floorID`),
  KEY `nodeType` (`nodeType`),
  KEY `mapID` (`mapID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='for searching Location / Path /Link nodes' AUTO_INCREMENT=98 ;

--
-- Dumping data for table `node`
--

INSERT INTO `node` (`nodeID`, `nodeType`, `x`, `y`, `floorID`, `mapID`) VALUES
(1, 'X', 405, 215, 0, 5),
(2, 'X', 105, 775, 0, 5),
(3, 'X', 105, 1195, 0, 5),
(4, 'X', 905, 775, 0, 5),
(5, 'X', 905, 1195, 0, 5),
(6, 'X', 505, 985, 0, 5),
(7, 'X', 905, 110, 0, 5),
(8, 'X', 905, 315, 0, 5),
(9, 'X', 105, 495, 1, 1),
(10, 'X', 505, 355, 1, 1),
(11, 'X', 905, 215, 1, 1),
(12, 'X', 105, 145, 2, 2),
(13, 'X', 105, 495, 2, 2),
(14, 'X', 505, 145, 2, 2),
(15, 'X', 505, 425, 2, 2),
(16, 'X', 105, 495, 3, 3),
(17, 'X', 105, 635, 3, 3),
(18, 'X', 905, 495, 3, 3),
(19, 'X', 305, 390, 4, 4),
(20, 'X', 305, 600, 4, 4),
(21, 'X', 605, 355, 4, 4),
(22, 'X', 655, 565, 4, 4),
(23, 'L', 105, 75, 0, 5),
(24, 'L', 105, 75, 1, 1),
(25, 'L', 505, 75, 1, 1),
(26, 'L', 705, 75, 2, 2),
(27, 'L', 905, 75, 2, 2),
(28, 'L', 905, 75, 3, 3),
(29, 'L', 105, 75, 4, 4),
(30, 'L', 505, 75, 4, 4),
(31, 'L', 905, 75, 4, 4),
(32, 'L', 505, 635, 0, 5),
(33, 'L', 505, 635, 1, 1),
(34, 'L', 905, 495, 0, 5),
(35, 'L', 905, 635, 1, 1),
(36, 'L', 905, 635, 2, 2),
(37, 'L', 905, 635, 3, 3),
(38, 'X', 105, 250, 3, 3),
(40, 'P', 105, 495, 0, 5),
(41, 'P', 305, 215, 0, 5),
(42, 'P', 305, 495, 0, 5),
(43, 'P', 305, 775, 0, 5),
(44, 'P', 305, 1195, 0, 5),
(45, 'P', 505, 775, 0, 5),
(46, 'P', 505, 1195, 0, 5),
(47, 'X', 505, 1335, 0, 5),
(48, 'P', 705, 110, 0, 5),
(49, 'P', 705, 315, 0, 5),
(50, 'P', 705, 495, 0, 5),
(51, 'P', 705, 775, 0, 5),
(52, 'P', 705, 1195, 0, 5),
(53, 'P', 105, 215, 1, 1),
(54, 'P', 305, 215, 1, 1),
(55, 'P', 305, 495, 1, 1),
(56, 'P', 505, 215, 1, 1),
(57, 'P', 505, 495, 1, 1),
(58, 'P', 705, 75, 1, 1),
(59, 'P', 705, 215, 1, 1),
(60, 'P', 705, 495, 1, 1),
(61, 'P', 705, 635, 1, 1),
(62, 'P', 905, 75, 1, 1),
(63, 'P', 305, 145, 2, 2),
(64, 'P', 305, 425, 2, 2),
(65, 'P', 305, 635, 2, 2),
(66, 'P', 705, 635, 2, 2),
(67, 'P', 905, 215, 2, 2),
(68, 'P', 105, 425, 2, 2),
(69, 'P', 240, 250, 3, 3),
(70, 'P', 305, 180, 3, 3),
(71, 'P', 305, 320, 3, 3),
(72, 'P', 255, 460, 3, 3),
(73, 'P', 255, 495, 3, 3),
(74, 'P', 255, 635, 3, 3),
(75, 'P', 405, 320, 3, 3),
(76, 'P', 470, 390, 3, 3),
(77, 'P', 405, 460, 3, 3),
(78, 'P', 905, 180, 3, 3),
(79, 'P', 705, 495, 3, 3),
(80, 'P', 705, 635, 3, 3),
(81, 'P', 105, 215, 4, 4),
(82, 'P', 105, 600, 4, 4),
(83, 'P', 255, 390, 4, 4),
(86, 'P', 255, 600, 4, 4),
(87, 'P', 355, 215, 4, 4),
(88, 'P', 355, 390, 4, 4),
(89, 'P', 505, 215, 4, 4),
(90, 'P', 455, 460, 4, 4),
(91, 'P', 455, 600, 4, 4),
(92, 'P', 455, 670, 4, 4),
(93, 'P', 555, 460, 4, 4),
(94, 'P', 555, 565, 4, 4),
(95, 'P', 905, 215, 4, 4),
(96, 'P', 905, 355, 4, 4),
(97, 'P', 905, 670, 4, 4);

-- --------------------------------------------------------

--
-- Table structure for table `node_icon`
--

CREATE TABLE IF NOT EXISTS `node_icon` (
  `subType` varchar(30) NOT NULL COMMENT 'subtype name',
  `nodeCategory` enum('Access','Education','Services','Utilities') NOT NULL COMMENT 'node''s categories name',
  `iconURL` tinytext NOT NULL COMMENT 'URL of the subtype icon',
  PRIMARY KEY (`subType`),
  KEY `nodeCategories` (`nodeCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='storing information of each subtype icon';

--
-- Dumping data for table `node_icon`
--

INSERT INTO `node_icon` (`subType`, `nodeCategory`, `iconURL`) VALUES
('Escalator', 'Access', 'escalator.png'),
('Landmark', 'Utilities', 'landmark.png'),
('Lift', 'Access', 'lift.png'),
('Restaurant', 'Services', 'restaurant.png'),
('Room', 'Education', 'room.png'),
('Stair', 'Access', 'stair.png'),
('WC-Men', 'Utilities', 'wc_men.png'),
('WC-Women', 'Utilities', 'wc_women.png');

-- --------------------------------------------------------

--
-- Table structure for table `path_unit`
--

CREATE TABLE IF NOT EXISTS `path_unit` (
  `nodeID` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'location / path / link''s node ID',
  `neighborNodeID` mediumint(8) unsigned NOT NULL COMMENT 'node''s neighbor node ID',
  `pathType` enum('P','L','E','S') NOT NULL DEFAULT 'P' COMMENT 'P / L / E / S',
  `distanceCost` float unsigned NOT NULL COMMENT 'walking cost between node and neighbor (in meter)',
  `timeCost` float unsigned NOT NULL COMMENT 'time cost between node and neighbor (in second)',
  `floorID` tinyint(3) unsigned DEFAULT NULL COMMENT 'floor number of this path unit on (link to link: null)',
  `mapID` tinyint(3) unsigned DEFAULT NULL COMMENT 'map number of this path unit on (link to link: null)',
  PRIMARY KEY (`nodeID`,`neighborNodeID`),
  UNIQUE KEY `nodeID` (`nodeID`,`neighborNodeID`,`mapID`),
  KEY `floorID` (`floorID`),
  KEY `neighborNodeID` (`neighborNodeID`),
  KEY `mapID` (`mapID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='path between two nodes' AUTO_INCREMENT=97 ;

--
-- Dumping data for table `path_unit`
--

INSERT INTO `path_unit` (`nodeID`, `neighborNodeID`, `pathType`, `distanceCost`, `timeCost`, `floorID`, `mapID`) VALUES
(1, 41, 'P', 4, 4, 0, 5),
(2, 43, 'P', 8, 8, 0, 5),
(3, 44, 'P', 8, 8, 0, 5),
(4, 51, 'P', 8, 8, 0, 5),
(5, 52, 'P', 8, 8, 0, 5),
(6, 46, 'P', 8.4, 8.4, 0, 5),
(7, 48, 'P', 8, 8, 0, 5),
(8, 49, 'P', 8, 8, 0, 5),
(9, 55, 'P', 8, 8, 1, 1),
(10, 57, 'P', 5.6, 5.6, 1, 1),
(11, 62, 'P', 5.6, 5.6, 1, 1),
(12, 63, 'P', 8, 8, 2, 2),
(13, 68, 'P', 2.8, 2.8, 2, 2),
(14, 63, 'P', 8, 8, 2, 2),
(15, 64, 'P', 8, 8, 2, 2),
(16, 73, 'P', 6, 6, 3, 3),
(17, 74, 'P', 6, 6, 3, 3),
(18, 79, 'P', 8, 8, 3, 3),
(19, 83, 'P', 2, 2, 4, 4),
(19, 88, 'P', 2, 2, 4, 4),
(20, 86, 'P', 2, 2, 4, 4),
(20, 91, 'P', 6, 6, 4, 4),
(21, 96, 'P', 12, 12, 4, 4),
(22, 94, 'P', 4, 4, 4, 4),
(23, 24, 'L', 0, 31, NULL, NULL),
(23, 29, 'L', 0, 49, NULL, NULL),
(23, 40, 'P', 16.8, 16.8, 0, 5),
(24, 29, 'L', 0, 43, NULL, NULL),
(24, 53, 'P', 5.6, 5.6, 1, 1),
(25, 26, 'L', 0, 31, NULL, NULL),
(25, 30, 'L', 0, 43, NULL, NULL),
(25, 56, 'P', 5.6, 5.6, 1, 1),
(26, 30, 'L', 0, 37, NULL, NULL),
(26, 66, 'P', 22.4, 22.4, 2, 2),
(27, 28, 'L', 0, 31, NULL, NULL),
(27, 31, 'L', 0, 37, NULL, NULL),
(27, 67, 'P', 5.6, 5.6, 2, 2),
(28, 31, 'L', 0, 31, NULL, NULL),
(28, 78, 'P', 4.2, 4.2, 3, 3),
(29, 81, 'P', 5.6, 5.6, 4, 4),
(30, 89, 'P', 5.6, 5.6, 4, 4),
(31, 95, 'P', 5.6, 5.6, 4, 4),
(32, 33, 'E', 0, 10, NULL, NULL),
(32, 45, 'P', 5.6, 5.6, 0, 5),
(33, 57, 'P', 5.6, 5.6, 1, 1),
(34, 35, 'S', 12, 12, NULL, NULL),
(34, 36, 'S', 24, 24, NULL, NULL),
(34, 37, 'S', 36, 36, NULL, NULL),
(34, 50, 'P', 8, 8, 0, 5),
(35, 36, 'S', 12, 12, NULL, NULL),
(35, 37, 'S', 24, 24, NULL, NULL),
(35, 61, 'P', 8, 8, 1, 1),
(36, 37, 'S', 12, 12, NULL, NULL),
(36, 66, 'P', 8, 8, 2, 2),
(37, 80, 'P', 8, 8, 3, 3),
(38, 69, 'P', 5.4, 5.4, 3, 3),
(40, 42, 'P', 8, 8, 0, 5),
(41, 42, 'P', 11.2, 11.2, 0, 5),
(42, 43, 'P', 11.2, 11.2, 0, 5),
(42, 50, 'P', 16, 16, 0, 5),
(43, 44, 'P', 16.8, 16.8, 0, 5),
(43, 45, 'P', 8, 8, 0, 5),
(44, 46, 'P', 8, 8, 0, 5),
(45, 51, 'P', 8, 8, 0, 5),
(46, 47, 'P', 5.6, 5.6, 0, 5),
(46, 52, 'P', 8, 8, 0, 5),
(48, 49, 'P', 8.2, 8.2, 0, 5),
(49, 50, 'P', 7.2, 7.2, 0, 5),
(50, 51, 'P', 11.2, 11.2, 0, 5),
(51, 52, 'P', 16.8, 16.8, 0, 5),
(53, 54, 'P', 8, 8, 1, 1),
(54, 55, 'P', 11.2, 11.2, 1, 1),
(55, 57, 'P', 8, 8, 1, 1),
(56, 59, 'P', 8, 8, 1, 1),
(57, 60, 'P', 8, 8, 1, 1),
(58, 59, 'P', 5.6, 5.6, 1, 1),
(58, 62, 'P', 8, 8, 1, 1),
(59, 60, 'P', 11.2, 11.2, 1, 1),
(60, 61, 'P', 5.6, 5.6, 1, 1),
(63, 64, 'P', 11.2, 11.2, 2, 2),
(64, 65, 'P', 8.4, 8.4, 2, 2),
(64, 68, 'P', 8, 8, 2, 2),
(65, 66, 'P', 16, 16, 2, 2),
(66, 67, 'P', 18.6075, 18.6075, 2, 2),
(69, 70, 'P', 3.82099, 3.82099, 3, 3),
(69, 71, 'P', 3.82099, 3.82099, 3, 3),
(70, 78, 'P', 24, 24, 3, 3),
(71, 75, 'P', 4, 4, 3, 3),
(72, 73, 'P', 1.4, 1.4, 3, 3),
(72, 77, 'P', 6, 6, 3, 3),
(73, 74, 'P', 5.6, 5.6, 3, 3),
(74, 80, 'P', 18, 18, 3, 3),
(75, 76, 'P', 3.1305, 3.1305, 3, 3),
(76, 77, 'P', 3.1305, 3.1305, 3, 3),
(79, 80, 'P', 5.6, 5.6, 3, 3),
(81, 82, 'P', 15.4, 15.4, 4, 4),
(81, 87, 'P', 10, 10, 4, 4),
(82, 86, 'P', 6, 6, 4, 4),
(83, 86, 'P', 8.4, 8.4, 4, 4),
(87, 88, 'P', 7, 7, 4, 4),
(87, 89, 'P', 6, 6, 4, 4),
(89, 95, 'P', 16, 16, 4, 4),
(90, 91, 'P', 5.6, 5.6, 4, 4),
(90, 93, 'P', 4, 4, 4, 4),
(91, 92, 'P', 2.8, 2.8, 4, 4),
(92, 97, 'P', 18, 18, 4, 4),
(93, 94, 'P', 4.2, 4.2, 4, 4),
(95, 96, 'P', 5.6, 5.6, 4, 4),
(96, 97, 'P', 12.6, 12.6, 4, 4);
