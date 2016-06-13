var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

var db = mongojs('localhost/countergg', ['winrates', 'datastats', 'champroles', 'staticdata']);

var lastquery = 0;
var gamesanalysed = 0;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/matchupsanalysed', function(req, res, next) {
  db.datastats.findOne(function(err, doc) {
    res.json(doc)
  });
});

router.get('/getchampdata', function(req, res, next) {
  db.staticdata.findOne({'champs' : {$exists : true}}, function(err, doc) {
    res.json(doc)
  })
});

router.get('/primaryrole/:cid', function(req, res, next) {
  db.champroles.findOne({'cid1' : (+req.params.cid)}, function(err, doc) {
    res.json(doc)
  })
})

router.get('/getmatchups/:cid/:role/', function(req, res, next) {
  // Search database for all entries with this champion with specific roles
  db.winrates.find({'cid1' : (+req.params.cid), 'c1role' : (req.params.role), 'c2role' : (req.params.role)}, function(err, docs) {
    // Check that response wasn't empty
    resdocs = []
    // Loop through every document or perhaps just a certain number.
    for (var i = 0; i < docs.length; i++) {
      // If matchup has more than 150 games
      if ((docs[i].c1wins + docs[i].c2wins) > 20) {
        // Push onto the response object the new json
        resdocs.push(docs[i])
      }
    }
    // Send back the documents
    res.json(resdocs)
  });
});

router.get('/compare/:c1/:c2', function(req, res, next) {
  db.winrates.findOne({ 'cid1' : (+req.params.c1), 'cid2' : (+req.params.c2)}, function(err, doc) {
    res.json(doc)
  });
});

module.exports = router;
