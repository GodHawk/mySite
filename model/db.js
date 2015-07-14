/**
 * Created by william on 15-7-14.
 */
var Promise     = require('bluebird');
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;
var cfg         = require('../profile/config');

mongoose.connect(cfg.mongoDbConfig.url, cfg.mongoDbConfig.options);
var db          = mongoose.connection;

var ObjectId = require('mongodb').ObjectID;

mongoose.set('debug', cfg.mongoDebugMode);

// When successfully connected
db.on('connected', function (err) {
    'use strict';
    log.info('Mongodb is connected');
});

// If the connection throws an error
db.on('error', function (err) {
    log.error('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
db.on('disconnected', function () {
    log.warn('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
    db.close(function () {
        log.warn('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

function commonPlugin(schema, options) {

    schema.pre('save', function (next) {
        if (this.isNew) {
            this.createdAt = this.updatedAt = new Date;
        } else {
            this.updatedAt = new Date;
        }
        next();
    });

    schema.pre('update', function (next) {
        this.updatedAt = new Date();
        next();
    });

    schema.pre('remove', function (next) { // TODO: need testing ?
        this.deleted = true;
        next();
    });
}

function transformToJSON(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
}


var essaySchema = new Schema({
    title    : String,
    content  : String,
    author   : String,
    deleted: {type: Boolean, default: false}
}, {
    collection: 'Essay',
    timestamps: true,
    toJSON    : {
        transform: transformToJSON
    }
});
essaySchema.plugin(commonPlugin);

function promisify(model) {
    Promise.promisifyAll(model);
    Promise.promisifyAll(model.collection);
    Promise.promisifyAll(model.prototype);
    return model;
}

exports.Essay         = promisify(mongoose.model('Essay', essaySchema));
