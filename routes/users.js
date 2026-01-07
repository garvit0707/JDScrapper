var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource this is the testing i guesss thats why it is visible on my screen');
});

module.exports = router;
