/**
 * Created by william on 15-7-14.
 */
var Promise     = require('bluebird');
var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;
var cfg         = require('../profile/config');

mongoose.connect(cfg.mongoDbConfig.url, cfg.mongoDbConfig.options);
var db          = mongoose.connection;


mongoose.set('debug', cfg.mongoDebugMode);

// When successfully connected
db.on('connected', function (err) {
    'use strict';
    console.log('Mongodb is connected');
});

// If the connection throws an error
db.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
db.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
    db.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
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

function findAndCountAllPlugin(schema, options) {
    schema.statics.findAndCountAll =
        function (terms, start, rows, fields, sort, cb) {
            start = start || 0;
            rows  = rows || 10;
            if (start < 0)
                throw new error.Arg('invalid parameter: start, should be >= 0;');
            if (rows <= 0)
                throw new error.Arg('invalid parameter: rows, should be >0;');

            terms = terms || {};
            sort  = sort || {};

            return Promise.resolve(this.count(terms).exec()).bind(this)
                .then(function (count) {
                    if (count <= start) {
                        var result = Promise.resolve({
                            data  : [],
                            length: 0,
                            total : count,
                            start : start,
                            rows  : rows
                        });

                        return cb ? result.nodeify(cb) : result;
                    }

                    var m = mongoose.model(schema.options.collection, schema);
                    return m.find(terms, fields, {sort: sort}).skip(start).limit(rows).exec()
                        .then(function (r) {
                            result = Promise.resolve({
                                data  : r,
                                length: r.length,
                                total : count,
                                start : start,
                                rows  : rows
                            });
                            return cb ? result.nodeify(cb) : result;
                        })
                })
        }
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
essaySchema.plugin(findAndCountAllPlugin);

function promisify(model) {
    Promise.promisifyAll(model);
    Promise.promisifyAll(model.collection);
    Promise.promisifyAll(model.prototype);
    return model;
}

exports.Essay         = promisify(mongoose.model('Essay', essaySchema));
