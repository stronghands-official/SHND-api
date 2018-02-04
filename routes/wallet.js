var express = require('express');
var router = express.Router();

var litecoin = require('node-litecoin');
var crypto = require('crypto');
var config = require('../config');
var jwt = require('jsonwebtoken');
var User = require('../models/user');

router.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });

    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});


router.get('/balance', function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    var client = new litecoin.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });
    var user = jwt.verify(token, config.secret, function(err, decodedToken) {
        if (err) throw err;
        var user = User.findOne({
            username: decodedToken.username
        }, function(err, user) {
            if (err) throw err;
            var total = 0;
            if (user.accounts.length > 0) {
                user.accounts.forEach(acc => {
                    var bal = client.getBalance(acc, 6, function(err, balance) {
                        total += balance;
                    });
                });
            }
            res.send(JSON.stringify({ 'balance': total }));
        });
    });
});

router.get('/balance/:account', function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var account = req.params.account;

    var client = new litecoin.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });

    var user = jwt.verify(token, config.secret, function(err, decodedToken) {
        if (err) throw err;
        var user = User.findOne({
            username: decodedToken.username
        }, function(err, user) {
            if (err) throw err;
            if (account != null) {
                if (user.accounts.includes())
                    var response = client.getBalance(account, 6, function(err, balance) {
                        if (err) throw err;
                        res.send(JSON.stringify(balance));
                    });
            } else {
                var total = 0;
                if (user.accounts.length > 0) {
                    user.accounts.forEach(acc => {
                        var bal = client.getBalance(acc, 6, function(err, balance) {
                            total += balance;
                        });
                    });
                }
                res.send(JSON.stringify({ 'balance': total }));
            }
        });
    });
});

router.get('/balance/:address', function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var address = req.params.address;

    var client = new litecoin.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });
    var user = jwt.verify(token, config.secret, function(err, decodedToken) {
        if (err) throw err;
        var user = User.findOne({
            username: decodedToken.username
        }, function(err, user) {
            if (err) throw err;
            client.getAccount(address, function(err, account) {
                if (err) throw err;
                if (!user.accounts.includes(account))
                    throw new Error('Permission denied! The user doesn\' own the address');
                var response = client.getBalance(account, 6, function(err, balance) {
                    if (err) throw err;
                    res.send(JSON.stringify({ 'balance': balance }));
                });
            });
        });
    });
});

router.put('/accounts', function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    var client = new litecoin.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });
    crypto.randomBytes(48, function(err, buffer) {
        if (err) throw err;
        var accountId = buffer.toString('hex');
        var decodedJwt = jwt.verify(token, config.secret, function(err, decodedToken) {
            if (err) res.send(err);
            var username = decodedToken.username;
            var user = User.findOne({
                username: username
            }, function(err, user) {
                if (err) res.send(err);
                client.getAccountAddress(accountId, function(err, address) {
                    if (err) throw err;
                    user.accounts.push(accountId);
                    user.save();
                    res.send(JSON.stringify({ success: true, 'address': address, 'account': accountId }));
                });
            });
        });
    });
});

router.get('/accounts/', function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    var client = new litecoin.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });
    var decodedJwt = jwt.verify(token, config.secret, function(err, decodedToken) {
        if (err) throw err;
        var username = decodedToken.username;
        var user = User.findOne({
            username: username
        }, function(err, user) {
            if (err) throw err;
            var accs = user.accounts;
            res.send(JSON.stringify({ success: true, 'accounts': accs }));
        });
    });
});
router.get('/accounts/addresses', function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    var client = new litecoin.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });
    var decodedJwt = jwt.verify(token, config.secret, function(err, decodedToken) {
        if (err) throw err;
        var username = decodedToken.username;
        var user = User.findOne({
            username: username
        }, function(err, user) {
            if (err) throw err;
            var accs = user.accounts;
            var addresses = [];
            addresses.forEach(addr => {
                addresses.push(addr);
            });
            res.send(JSON.stringify({ success: true, 'addresses': addresses }));
        });
    });
});
router.get('/accounts/addresses/:account', function(req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var account = req.params.account;

    var client = new litecoin.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });
    var decodedJwt = jwt.verify(token, config.secret, function(err, decodedToken) {
        if (err) res.send(err);
        var username = decodedToken.username;
        var user = User.findOne({
            username: username
        }, function(err, user) {
            if (err) res.send(err);
            client.getAccountAddress(account, function(err, address) {
                if (err) res.send(err);
                res.send(JSON.stringify({ success: true, 'account': account, 'addresses': addresses }));
            });
        });
    });
});

module.exports = router;