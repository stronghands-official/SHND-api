var express = require('express');
var router = express.Router();
var stronghands = require('node-litecoin');
var url = require('url');
var config = require('../config');
var jwt = require('jsonwebtoken');
var request = require('request');

var User = require('../models/user');

router.post('/register', function(req, res) {
    var email = req.get("email") || req.body.email;
    var username = req.get("username") || req.body.username;
    var password = req.get("password") || req.body.password;
    var { URL } = require('url');

    client = new stronghands.Client({
        host: 'localhost',
        port: 1111,
        user: 'stronghandsrpc',
        pass: 'stronghands'
    });

    if (email &&
        username &&
        password) {
        var emailhosts = [];
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('../disposable_email_blacklist.conf.txt')
        });

        lineReader.on('line', function(line) {
            emailhosts.push(line);
        }).on("close", function() {
            if (emailhosts.includes(email.split('@')[1])) {
                res.send({ success: false, message: 'Email provider is blacklisted.' });
            } else {
                require('crypto').randomBytes(30, function(err, buffer) {
                    var token = buffer.toString('hex');
                    var userData = new User({
                        'email': email,
                        'username': username,
                        'password': password,
                        'securityCode': null,
                        'isAdmin': false,
                        'isConfirmed': false,
                        'confirmationToken': token,
                        'createDate': Date.now(),
                        'lastLoginDate': null,
                        'lastLoginIpAddress': null,
                        'addressses': [],
                        'balance': 0
                    });
                    var payload = {
                        username: username,
                        confirmationToken: token
                    };
                    var confirmationJWT = jwt.sign(payload, config.secret, {
                        expiresIn: 15 * 60 // expires in 15min
                    });
                    var confirmationLink = new URL('https://api.stronghands.info/v1/users/confirm');
                    confirmationLink.searchParams.append('token', confirmationJWT);
                    var emailEndpoint = new URL('https://mail.zoho.eu/api/accounts/419662000000002002/messages');
                    User.create(userData, function(error, user) {
                        if (error) {
                            res.send({ success: false, message: 'Username or email already taken.' });
                        } else {
                            request({
                                url: emailEndpoint.toString(),
                                method: 'POST',
                                headers: {
                                    Authorization: "Zoho-authtoken 9a8d884b2bbdf359499ee6fcf6c3dde1",
                                },
                                json: true,
                                body: {
                                    'fromAddress': 'contact@stronghands.info',
                                    'toAddress': email,
                                    'subject': 'StrongHands - Email confirmation',
                                    'content': '<h4>Welcome to the StrongHands community!</h4> Click the link down below to confirm your email address.<br /><br /><a href="' + confirmationLink.toString() + '"> Confirm </a><br /><br /> Enjoy your stay! <br /><b> the StrongHands Team</b>'
                                }
                            }, function(err, httpResponse, body) {
                                if (err) {
                                    User.remove({ _id: user._id }, function(err) {
                                        if (err) res.status(500).send({ success: false, message: 'Something went wrong. Please try again later.' });
                                    });
                                    res.status(500).send({ success: false, message: 'Unable to send confirmation email.' });
                                }
                                client.getNewAddress(function(err, address) {
                                    if (err) res.status(500).send({ success: false, message: err });

                                    User.findOneAndUpdate({ _id: user._id }, { "$push": { "addresses": address } }, function(err, updatedUser) {
                                        if (err) res.status(500).send({ success: false, message: err });
                                        res.send({
                                            success: true,
                                            message: 'User saved successfully'
                                        });
                                    });
                                });
                            });
                        }
                    });
                });
            }
        });

    }
});

router.post('/login', function(req, res) {
    var email = req.get("email") || req.body.email;
    var username = req.get("username") || req.body.username;
    var password = req.get("password") || req.body.password;

    if (password) {
        if (username) {
            User.authenticateUsername(username, password, function(error, user) {
                if (error || !user) {
                    res.send({ success: false, message: 'Wrong email or password.' + error });
                } else if (!user.isConfirmed) {
                    res.send({ success: false, message: 'Account not verified.' });
                } else {
                    var payload = {
                        email: user.email,
                        username: user.username,
                        admin: user.isAdmin
                    };
                    var token = jwt.sign(payload, config.secret, {
                        expiresIn: 1440 * 60 // expires in 24 hours
                    });
                    res.json({
                        success: true,
                        message: 'successfully authenticated',
                        token: token
                    })
                }
            });
        } else if (email) {
            User.authenticateEmail(email, password, function(error, user) {
                if (error || !user) {
                    res.send({ success: 'false', message: 'Wrong email or password.' });
                } else {
                    var payload = {
                        email: user.email,
                        username: user.username,
                        admin: user.isAdmin
                    };
                    var token = jwt.sign(payload, config.secret, {
                        expiresIn: 1440 * 60 // expires in 24 hours
                    });
                    res.json({
                        success: true,
                        message: 'successfully authenticated',
                        token: token
                    });
                }
            });
        }

    } else {
        res.send(400).send({ success: false, message: 'All fields required.' });
    }
});

router.get('/', function(req, res) {
    var token = req.get("token") || req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['token'];
    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                User.findOne({
                    username: decoded.username
                }, function(err, user) {
                    if (err) res.status(404).send({ success: false, message: "User not found" });
                    res.send(JSON.stringify({ success: true, isAdmin: user.isAdmin, _id: user._id, email: user.email, username: user.username, isConfirmed: user.isConfirmed, createDate: user.createDate, lastLoginDate: user.lastLoginDate, lastLoginIpAddress: user.lastLoginIpAddress }));
                });
            }
        })
    }
});
router.get('/confirm', function(req, res) {
    var token = req.query.token;
    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.status(401).json({ success: false, message: 'Failed to authenticate token. Request a new one.' });
            } else {
                User.findOneAndUpdate({ username: decoded.username, confirmationToken: decoded.confirmationToken }, { isConfirmed: true, confirmationToken: null }, function(err, user) {
                    if (err) res.status(500).send({ success: false, message: 'Failed to update user. Try again later.' });
                    //TODO: respond with html:
                    res.send({ success: true, message: 'Successfully confirmed email address.' })
                });
            }
        });
    }
});

router.post('/confirm', function(req, res) {
    var username = req.get('username') || req.body.username;
    var email = req.get('email') || req.body.email;
    require('crypto').randomBytes(30, function(err, buffer) {
        var token = buffer.toString('hex');
        User.findOneAndUpdate({ username: username, email: email }, { confirmationToken: token }, function(err, user) {
            if (err) res.send({ success: false, message: 'User doesn\'t exist.' })
            else {
                if (user.isConfirmed) res.send({ success: true, message: 'Email address is already verified.' });
                else {
                    var payload = {
                        username: username,
                        confirmationToken: token
                    };

                    var confirmationJWT = jwt.sign(payload, config.secret, {
                        expiresIn: 15 * 60 // expires in 1 hours
                    });

                    var confirmationLink = new URL('https://api.stronghands.info/users/confirm');
                    confirmationLink.searchParams.append('token', confirmationJWT);
                    var emailEndpoint = 'https://mail.zoho.eu/api/accounts/419662000000002002/messages'

                    request({
                        url: emailEndpoint,
                        method: 'POST',
                        headers: {
                            Authorization: "Zoho-authtoken 9a8d884b2bbdf359499ee6fcf6c3dde1",
                        },
                        json: true,
                        body: {
                            'fromAddress': 'contact@stronghands.info',
                            'toAddress': email,
                            'subject': 'StrongHands - Email confirmation',
                            'content': '<h4>Welcome to the StrongHands community!</h4> Click the link down below to confirm your email address.<br /><br /><a href="' + confirmationLink.toString() + '"> Confirm </a><br /><br /> Enjoy your stay! <br /><b> the StrongHands Team</b>'
                        }
                    }, function(err, httpResponse, body) {
                        if (err) res.send({ success: false, message: 'Unable to send confirmation mail.' });
                    });
                }
            }
        });
    });
});

module.exports = router;