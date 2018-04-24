var express = require('express');
var router = express.Router();
var stronghands = require('node-litecoin');
var request = require('request');
router.get('/', function(req, res) {

    var client = new stronghands.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });
    client.getInfo(function(err, info) {
        if (err) res.status(503).send(JSON.stringify({ error: "Service unavailable." }));
        var response = request("https://cryptobe.com/chain/StrongHands/q/totalbc", function(error, response, body) {
            res.send(JSON.stringify({ moneysupply: body }));
        });
    });
});

router.get('/history', function(req, res) {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('../moneysupply.txt')
    });
    var moneysupply = [];
    lineReader.on('line', function(line) {
        moneysupply.push(line);
    }).on("close", function() {
        res.send(JSON.stringify(moneysupply));
    });


});

module.exports = router;