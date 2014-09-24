# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.6.12)
# Database: rehearsal
# Generation Time: 2014-09-19 23:01:36 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table actors
# ------------------------------------------------------------

CREATE TABLE `actors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `repository` varchar(255) DEFAULT NULL,
  `language` varchar(20) DEFAULT NULL,
  `install_command` varchar(20) DEFAULT NULL,
  `start_command` varchar(255) DEFAULT NULL,
  `rehearsal_port` int(11) DEFAULT NULL,
  `rehearsal_path` varchar(255) DEFAULT '/',
  `rehearsal_method` varchar(20) DEFAULT 'POST',
  `rehearsal_style_out` varchar(100) DEFAULT 'text/html',
  `rehearsal_style_in` varchar(100) DEFAULT 'text/html',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `actors` WRITE;
/*!40000 ALTER TABLE `actors` DISABLE KEYS */;

INSERT INTO `actors` (`id`, `name`, `repository`, `language`, `install_command`, `start_command`, `rehearsal_port`, `rehearsal_path`, `rehearsal_method`, `rehearsal_style_out`, `rehearsal_style_in`, `createdAt`, `updatedAt`)
VALUES
	(1,'Curl',NULL,NULL,NULL,NULL,NULL,NULL,'POST','application/json','text/html','2014-09-17 00:00:00','2014-09-17 00:00:00'),
	(2,'SFX Service','https://github.com/cdlib/cedilla_services.git','ruby','bundle install','thin -R config.ru start -p 3101',9101,'/sfx','POST','text/html','application/json','2014-09-17 00:00:00','2014-09-17 00:00:00'),
	(3,'SFX',NULL,NULL,NULL,NULL,8101,'/','GET','application/xml','text/html','2014-09-17 00:00:00','2014-09-17 00:00:00');

/*!40000 ALTER TABLE `actors` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table actors_old
# ------------------------------------------------------------

CREATE TABLE `actors_old` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  `repository` varchar(200) NOT NULL DEFAULT '',
  `configurations` varchar(2000) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `actors_old` WRITE;
/*!40000 ALTER TABLE `actors_old` DISABLE KEYS */;

INSERT INTO `actors_old` (`id`, `name`, `repository`, `configurations`)
VALUES
	(1,'SFX Service','https://github.com/cdlib/cedilla_services.git','./config/app.yml'),
	(3,'SFX','',''),
	(4,'Curl','',''),
	(5,'Cedilla','https://github.com/cdlib/cedilla.git','./config/services.yaml');

/*!40000 ALTER TABLE `actors_old` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table acts
# ------------------------------------------------------------

CREATE TABLE `acts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `playsId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `acts` WRITE;
/*!40000 ALTER TABLE `acts` DISABLE KEYS */;

INSERT INTO `acts` (`id`, `title`, `active`, `createdAt`, `updatedAt`, `playsId`)
VALUES
	(1,'With an OCLC Number and Title',1,'2014-09-17 00:00:00','2014-09-17 00:00:00',1),
	(2,'With only an ISBN',1,'2014-09-17 00:00:00','2014-09-17 00:00:00',1);

/*!40000 ALTER TABLE `acts` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table acts_old
# ------------------------------------------------------------

CREATE TABLE `acts_old` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `play_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `acts_old` WRITE;
/*!40000 ALTER TABLE `acts_old` DISABLE KEYS */;

INSERT INTO `acts_old` (`id`, `title`, `play_id`)
VALUES
	(1,'rft.genre=book&rft.title=Unix+in+a+nutshell&rft.oclcnum=613266745',1),
	(2,'rft.isbn=9780300177619&rft.genre=book',1),
	(3,'&rft.genre=book&rft.content=full_text&rft.title=Emma&rft.aulast=Austen&rft.isbn=1593081529&rft.atitle=When%20zombies%20attack&rft.spage=13&rft.epage=27\'',1);

/*!40000 ALTER TABLE `acts_old` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table cast
# ------------------------------------------------------------

CREATE TABLE `cast` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `actorId` int(11) NOT NULL DEFAULT '0',
  `playsId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`actorId`,`playsId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `cast` WRITE;
/*!40000 ALTER TABLE `cast` DISABLE KEYS */;

INSERT INTO `cast` (`createdAt`, `updatedAt`, `actorId`, `playsId`)
VALUES
	('2014-09-17 00:00:00','2014-09-17 00:00:00',1,1),
	('2014-09-17 00:00:00','2014-09-17 00:00:00',2,1),
	('2014-09-17 00:00:00','2014-09-17 00:00:00',3,1);

/*!40000 ALTER TABLE `cast` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table plays
# ------------------------------------------------------------

CREATE TABLE `plays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `plays` WRITE;
/*!40000 ALTER TABLE `plays` DISABLE KEYS */;

INSERT INTO `plays` (`id`, `description`, `active`, `createdAt`, `updatedAt`)
VALUES
	(1,'Monograph Testing',1,'2014-09-17 00:00:00','2014-09-17 00:00:00');

/*!40000 ALTER TABLE `plays` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table reviews
# ------------------------------------------------------------

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_date` datetime DEFAULT NULL,
  `scene_id` int(11) DEFAULT NULL,
  `rating` varchar(255) DEFAULT NULL,
  `protagonist_response` text,
  `expected_response` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table roles_old
# ------------------------------------------------------------

CREATE TABLE `roles_old` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` int(11) NOT NULL,
  `title` varchar(2000) NOT NULL DEFAULT '',
  `webservice` tinyint(1) DEFAULT '1',
  `method` varchar(20) DEFAULT 'GET',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `roles_old` WRITE;
/*!40000 ALTER TABLE `roles_old` DISABLE KEYS */;

INSERT INTO `roles_old` (`id`, `actor_id`, `title`, `webservice`, `method`)
VALUES
	(1,1,'/sfx',0,'POST'),
	(2,3,'http://ucelinks.cdlib.org:8888/sfx_test?sfx.response_type=multi_obj_detailed_xml&sfx.show_availability=1&rfr_id=info:sid/CDL:CDLA&',0,'GET');

/*!40000 ALTER TABLE `roles_old` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table scene_actors
# ------------------------------------------------------------

CREATE TABLE `scene_actors` (
  `role` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `sceneId` int(11) NOT NULL DEFAULT '0',
  `actorId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`sceneId`,`actorId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table scenes
# ------------------------------------------------------------

CREATE TABLE `scenes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  `antagonist_question` text,
  `protagonist_deferral` text,
  `tritagonist_response` text,
  `protagonist_answer` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `actId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `scenes` WRITE;
/*!40000 ALTER TABLE `scenes` DISABLE KEYS */;

INSERT INTO `scenes` (`id`, `title`, `active`, `sort_order`, `antagonist_question`, `protagonist_deferral`, `tritagonist_response`, `protagonist_answer`, `createdAt`, `updatedAt`, `actId`)
VALUES
	(1,'Where Curl tests SFX Service',1,2,'{\"foo\":\"bar\"}','{\"time\":\"2014-09-18T16:09:38.642Z\",\"id\":\"fbd70373-1be1-4bbb-870b-084d9fbdf737\",\"api_ver\":\"1.1\",\"referrers\":[],\"requestor_affiliation\":\"unknown\",\"requestor_language\":\"en-US,en;q=0.8\",\"unmapped\":\"sid=google&id=doi%3A10.1046%2Fj.1526-100x.2000.80033.x\",\"original_request\":\"&sid=google&auinit=AM&aulast=Ellison&atitle=Mangrove+restoration:+do+we+know+enough%3F&id=doi:10.1046/j.1526-100x.2000.80033.x&title=Restoration+ecology&volume=8&issue=3&date=2000&spage=219&issn=1061-2971&rft.genre=article\",\"citation\":{\"article_title\":\"Mangrove restoration: do we know enough?\",\"title\":\"Restoration ecology\",\"volume\":\"8\",\"issue\":\"3\",\"publication_date\":\"2000\",\"start_page\":\"219\",\"issn\":\"1061-2971\",\"genre\":\"article\",\"content_type\":\"full_text\",\"authors\":[{\"initials\":\"AM\",\"last_name\":\"Ellison\",\"full_name\":\"undefined Ellison\"}],\"oclc\":\"712801928\",\"publisher\":\"Cambridge, Mass. : Blackwell Scientific Publications, ©\",\"doi\":\"http://dx.doi.org/10.1111/j.1526-100x.2006.00153.x\",\"journal_title\":\"Restoration Ecology\",\"end_page\":\"460\"}}','','{\"time\":\"2014-09-18 09:09:39 -0700\",\"id\":\"fbd70373-1be1-4bbb-870b-084d9fbdf737\",\"citations\":[{\"resources\":[{\"source\":\"Synergy Blackwell Premium\",\"target\":\"http://onlinelibrary.wiley.com/doi/10.1046/j.1526-100x.2000.80033.x/abstract\",\"local_id\":\"1000000000001716\",\"format\":\"electronic\",\"description\":\"\",\"charset\":\"\",\"availability\":true,\"extras\":{}},{\"source\":\"EBSCOhost Academic Search Complete\",\"target\":\"http://openurl.ebscohost.com/linksvc/linking.aspx?sid=a9h&volume=8&date=2000-09&spage=219&issn=1061-2971&stitle=&genre=article&issue=3&title=Restoration+ecology&epage=229\",\"local_id\":\"1000000000002159\",\"format\":\"electronic\",\"description\":\"\",\"charset\":\"iso-8859-1\",\"availability\":true,\"extras\":{}}]}]}','2014-09-17 00:00:00','2014-09-17 00:00:00',1);

/*!40000 ALTER TABLE `scenes` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table scenes_old
# ------------------------------------------------------------

CREATE TABLE `scenes_old` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `act_id` int(11) NOT NULL,
  `antagonist` int(11) NOT NULL,
  `protagonist` int(11) NOT NULL,
  `tritagonist` int(11) NOT NULL,
  `antagonist_line` text,
  `protagonist_line` text,
  `protagonist_response` text,
  `tritagonist_response` text,
  `sort_order` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `scenes_old` WRITE;
/*!40000 ALTER TABLE `scenes_old` DISABLE KEYS */;

INSERT INTO `scenes_old` (`id`, `act_id`, `antagonist`, `protagonist`, `tritagonist`, `antagonist_line`, `protagonist_line`, `protagonist_response`, `tritagonist_response`, `sort_order`)
VALUES
	(1,1,5,1,3,'{\"time\":\"2014-09-18T16:09:38.642Z\",\"id\":\"fbd70373-1be1-4bbb-870b-084d9fbdf737\",\"api_ver\":\"1.1\",\"referrers\":[],\"requestor_affiliation\":\"unknown\",\"requestor_language\":\"en-US,en;q=0.8\",\"unmapped\":\"sid=google&id=doi%3A10.1046%2Fj.1526-100x.2000.80033.x\",\"original_request\":\"&sid=google&auinit=AM&aulast=Ellison&atitle=Mangrove+restoration:+do+we+know+enough%3F&id=doi:10.1046/j.1526-100x.2000.80033.x&title=Restoration+ecology&volume=8&issue=3&date=2000&spage=219&issn=1061-2971&rft.genre=article\",\"citation\":{\"article_title\":\"Mangrove restoration: do we know enough?\",\"title\":\"Restoration ecology\",\"volume\":\"8\",\"issue\":\"3\",\"publication_date\":\"2000\",\"start_page\":\"219\",\"issn\":\"1061-2971\",\"genre\":\"article\",\"content_type\":\"full_text\",\"authors\":[{\"initials\":\"AM\",\"last_name\":\"Ellison\",\"full_name\":\"undefined Ellison\"}],\"oclc\":\"712801928\",\"publisher\":\"Cambridge, Mass. : Blackwell Scientific Publications, ©\",\"doi\":\"http://dx.doi.org/10.1111/j.1526-100x.2006.00153.x\",\"journal_title\":\"Restoration Ecology\",\"end_page\":\"460\"}}','http://ucelinks.cdlib.org:8888/sfx_test?sfx.response_type=multi_obj_detailed_xml&sfx.show_availability=1&rfr_id=info:sid/CDL:CDLA&req.ip=&&sid=google&auinit=AM&aulast=Ellison&atitle=Mangrove+restoration:+do+we+know+enough%3F&id=doi:10.1046/j.1526-100x.2000.80033.x&title=Restoration+ecology&volume=8&issue=3&date=2000&spage=219&issn=1061-2971&rft.genre=article&rft_id=info:oclcnum/712801928&rft_id=info:doi/http://dx.doi.org/10.1111/j.1526-100x.2006.00153.x&rft.atitle=Mangrove%20restoration:%20do%20we%20know%20enough?&rft.jtitle=Restoration%20Ecology&rft.pub=Cambridge,%20Mass.%20:%20Blackwell%20Scientific%20Publications,%20%C2%A9&rft.date=2000&rft.spage=219&rft.epage=460','{\"time\":\"2014-09-18 09:09:39 -0700\",\"id\":\"fbd70373-1be1-4bbb-870b-084d9fbdf737\",\"citations\":[{\"resources\":[{\"source\":\"Synergy Blackwell Premium\",\"target\":\"http://onlinelibrary.wiley.com/doi/10.1046/j.1526-100x.2000.80033.x/abstract\",\"local_id\":\"1000000000001716\",\"format\":\"electronic\",\"description\":\"\",\"charset\":\"\",\"availability\":true,\"extras\":{}},{\"source\":\"EBSCOhost Academic Search Complete\",\"target\":\"http://openurl.ebscohost.com/linksvc/linking.aspx?sid=a9h&volume=8&date=2000-09&spage=219&issn=1061-2971&stitle=&genre=article&issue=3&title=Restoration+ecology&epage=229\",\"local_id\":\"1000000000002159\",\"format\":\"electronic\",\"description\":\"\",\"charset\":\"iso-8859-1\",\"availability\":true,\"extras\":{}}]}]}','',1),
	(2,1,4,5,1,'{\"foo\":\"bar\"}','{\"time\":\"2014-09-18T16:09:38.642Z\",\"id\":\"fbd70373-1be1-4bbb-870b-084d9fbdf737\",\"api_ver\":\"1.1\",\"referrers\":[],\"requestor_affiliation\":\"unknown\",\"requestor_language\":\"en-US,en;q=0.8\",\"unmapped\":\"sid=google&id=doi%3A10.1046%2Fj.1526-100x.2000.80033.x\",\"original_request\":\"&sid=google&auinit=AM&aulast=Ellison&atitle=Mangrove+restoration:+do+we+know+enough%3F&id=doi:10.1046/j.1526-100x.2000.80033.x&title=Restoration+ecology&volume=8&issue=3&date=2000&spage=219&issn=1061-2971&rft.genre=article\",\"citation\":{\"article_title\":\"Mangrove restoration: do we know enough?\",\"title\":\"Restoration ecology\",\"volume\":\"8\",\"issue\":\"3\",\"publication_date\":\"2000\",\"start_page\":\"219\",\"issn\":\"1061-2971\",\"genre\":\"article\",\"content_type\":\"full_text\",\"authors\":[{\"initials\":\"AM\",\"last_name\":\"Ellison\",\"full_name\":\"undefined Ellison\"}],\"oclc\":\"712801928\",\"publisher\":\"Cambridge, Mass. : Blackwell Scientific Publications, ©\",\"doi\":\"http://dx.doi.org/10.1111/j.1526-100x.2006.00153.x\",\"journal_title\":\"Restoration Ecology\",\"end_page\":\"460\"}}',NULL,'{\"time\":\"2014-09-18 09:09:39 -0700\",\"id\":\"fbd70373-1be1-4bbb-870b-084d9fbdf737\",\"citations\":[{\"resources\":[{\"source\":\"Synergy Blackwell Premium\",\"target\":\"http://onlinelibrary.wiley.com/doi/10.1046/j.1526-100x.2000.80033.x/abstract\",\"local_id\":\"1000000000001716\",\"format\":\"electronic\",\"description\":\"\",\"charset\":\"\",\"availability\":true,\"extras\":{}},{\"source\":\"EBSCOhost Academic Search Complete\",\"target\":\"http://openurl.ebscohost.com/linksvc/linking.aspx?sid=a9h&volume=8&date=2000-09&spage=219&issn=1061-2971&stitle=&genre=article&issue=3&title=Restoration+ecology&epage=229\",\"local_id\":\"1000000000002159\",\"format\":\"electronic\",\"description\":\"\",\"charset\":\"iso-8859-1\",\"availability\":true,\"extras\":{}}]}]}',2);

/*!40000 ALTER TABLE `scenes_old` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
