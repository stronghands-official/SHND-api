var express = require('express');
var router = express.Router();

var stronghands = require('node-litecoin');

router.get('/', function(req, res) {

    var client = new stronghands.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });
    var totalSupply = client.getInfo(function(err, info) {
        if (err) res.send(err);
        var supply = info.moneysupply;
        res.send(JSON.stringify({ moneysupply: supply }));
    });
});

module.exports = router;