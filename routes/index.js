var express = require('express');
var router = express.Router();
const util = require('util');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("GOT INDEX");
  res.render('index', { title: 'Express' });

});

router.post("/", function(req, res, next) {
	var hashtag, startDate, endDate;
	hashtag = req.body.hashtag;
	startDate = req.body.startDate;
	endDate = req.body.endDate;

  console.log("req start : " + req.body.startDate);
  //console.log("res: " + res.body.startDate);
  console.log("req hashtag: " + req.body.hashtag);
  console.log(util.inspect(req.body, {showHidden: false, depth: null}))
  
	return response.json({},200);



});




module.exports = router;
