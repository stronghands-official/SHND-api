var express = require('express');
var router = express.Router();
var litecoin = require('node-litecoin');
var url = require('url');
var crypto = require('crypto');
var config = require('../config');
var jwt = require('jsonwebtoken');

var User = require('../models/user');

router.all('/register', function(req, res, next) {
    var email = req.body.email;
    var username = req.body.username;
    console.log(username);
    var password = req.body.password;
    var securityCode = req.body.securityCode;
    var isAdmin = req.body.isAdmin;

    if (email &&
        username &&
        password) {

        var userData = new User({
            'email': email,
            'username': username,
            'password': password,
            'securityCode': securityCode,
            'isAdmin': isAdmin
        });

        User.create(userData, function(err, user) {
            if (err) return next(err);
            res.json({
                success: true,
                message: 'User saved successfully'
            });
        });

    }
});

router.all('/login', function(req, res, next) {
    if (req.body.username && req.body.password || req.body.email && req.body.password) {
        if (req.body.username) {
            User.authenticateUsername(req.body.username, req.body.password, function(error, user) {
                if (error || !user) {
                    var err = new Error('Wrong email or password.');
                    err.status = 401;
                    return next(err);
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
        } else if (req.body.email) {
            User.authenticateEmail(req.body.email, req.body.password, function(error, user) {
                if (error || !user) {
                    var err = new Error('Wrong email or password.');
                    err.status = 401;
                    return next(err);
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
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});


router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if (err) {
                console.log(err);
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});
module.exports = router;