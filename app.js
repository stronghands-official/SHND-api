var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var jwt = require('jsonwebtoken');
var app = express();

var index = require('./routes/index');
var users = require('./routes/users');
var wallets = require('./routes/wallet');
var docs = require('./routes/docs');
var supply = require('./routes/supply');
var cert = require('./routes/cert');
var qrimg = require('./routes/qrimage');

mongoose.connect('mongodb://localhost/apidatabase')
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));
var db = mongoose.connection;

//use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/v1/users', users);
app.use('/v1/users/wallets', wallets);
app.use('/docs', docs);
app.use('/.well-known/acme-challenge/Ea8BhqRXuOQ32AbbBEmPn9Qe1dhd7gWSKb2VjaB-YfA', cert);
app.use('/moneysupply', supply);
app.use('/qrimage', qrimg);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;