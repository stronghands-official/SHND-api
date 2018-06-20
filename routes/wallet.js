var express = require('express');
var router = express.Router();

var stronghands = require('node-litecoin');
var crypto = require('crypto');
var config = require('../config');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var async = require('async');
router.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.get('token');
    req.stronghandsclient = new stronghands.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });
    req.token = token;

    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' }).end();
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.send({
            success: false,
            message: 'No token provided.'
        });
    }
});

router.get('/balance', function(req, res) {
    var token = req.token;
    var client = req.stronghandsclient;
    var decodedToken = req.decoded;

    User.findOne({
        username: decodedToken.username
    }, function(err, user) {
        if (err) res.status(404).send({ success: false, message: 'User doesn\'t exist.' });
        else {
            client.getBalance(user._id, function(err, balance) {
                res.send({ success: true, balance: balance });
            });
        }
    });
});

router.put('/addresses', function(req, res) {
    var token = req.token;
    var client = req.stronghandsclient;
    var decodedToken = req.decoded;
    client.getNewAddress(decodedToken._id, function(err, address) {
        User.findOneAndUpdate({ username: decodedToken.username }, { "$push": { "addresses": {address:address, description:''} } }, function(err, user) {
            if (err) res.send({ success: false, message: err });
            else {
                res.send({ success: true, address: address });
            }
        });
        if (err) res.send({ success: false, message: err });
    });
});

router.get('/addresses', function(req, res) {
    var token = req.token;
    var client = req.stronghandsclient;
    var decodedToken = req.decoded;

    User.findOne({
        username: decodedToken.username
    }, function(err, user) {
        if (err) res.status(404).send({ success: false, message: 'User doesn\'t exist.' });
        var addresses = user.addresses;
        res.send({ success: true, addresses: addresses });
    });
});

function preValidateAddress(address) {
    var alphanumericpattern = /^[a-zA-Z0-9]+$/i;
    if (address.charAt(0) != 'S') {
        return false;
    }
    if (address.length < 34) {
        return false;
    }
    return alphanumericpattern.test(address);
}
router.post('/send', function(req, res) {
    var client = req.stronghandsclient;
    var decodedToken = req.decoded;
    var amount = parseInt(req.get("amount"));
    var targetAddress = req.get("address");

    User.findOne({
        username: decodedToken.username
    }, function(err, user) {
        if (err) res.status(404).send({ success: false, message: 'User doesn\'t exist.' });
        else if (user.addresses.includes(targetAddress)) {
            res.status(403).send({ success: false, message: "You cannot send coins to yourself" });
        } else {
            client.getBalance(user._id, function(err, balance) {
                if (err) {
                    res.status(404).send({ success: false, message: "User not found." });
                } else if (balance > amount + 0.1) { //0.1 is the fee
                    client.sendToAddress(targetAddress, amount, 6, function(err, transactionId) {
                        if (err) {
                            res.status(500).send({ success: false, message: "An error occured. Please try again later." });
                        } else {
                            res.send({ success: true, transactionId: transactionId });
                        }
                    });
                }
                res.status(403).send({ success: false, message: 'Not enough coins.' });
            });
        }
    });
});

module.exports = router;