var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        maxlength: 200
    },
    seccurityCode: {
        type: Number,
        required: false,
        default: null
    },
    isAdmin: {
        type: Boolean,
        required: false,
        default: false
    },
    addressses: [{
        type: String,
        required: false,
        default: []
    }],
    isConfirmed: {
        type: Boolean,
        required: true,
        default: false
    },
    confirmationToken: {
        type: String,
        required: false,
        default: null
    },
    createDate: {
        type: Date,
        required: false
    },
    lastLoginDate: {
        type: Date,
        required: false
    },
    lastLoginIpAddress: {
        type: String,
        required: false
    }
});

//authenticate input with password against database
UserSchema.statics.authenticateEmail = function(email, password, callback) {
        User.findOne({ email: email }).exec(function(err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function(err, result) {
                if (err) {
                    return callback(err);
                }
                if (result) {
                    return callback(null, user);
                } else {}
                return callback();
            });
        });
    }
    //authenticate input with username against database
UserSchema.statics.authenticateUsername = function(username, password, callback) {
    User.findOne({ username: username }).exec(function(err, user) {
        if (err) {
            return callback(err)
        } else if (!user) {
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function(err, result) {
            console.log(password, " ", user.password);
            if (err) {
                return callback(err);
            }
            if (result) {
                return callback(null, user);
            }
            return callback();
        });
    });
}


//hashing a password before saving it to the database
UserSchema.pre('save', function(next) {
    var user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;