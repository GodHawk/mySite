/**
 * Created by william on 15-7-14.
 */
var express = require('express');
var router  = express.Router();

var Essay = require("../model/db").Essay;


function decorator(f) {
    var temp = function (req, res, next) {
        return f(req, res, next)
            .then(function (data) {
                var obj = {err: 0, msg: ""};                                   // it's a pure data result

                obj.data = data;
                res.json(obj);
            })
            .catch(function (err) {
                return next(err);
            })
    };
    return temp;
}

var _getEssaies = function(req,res,next){

};

var getEssaies = function(start,rows){
    return Essay.findAndCountAll({},start,rows,null);
};

var apiProfile = [
    {
        method     : 'get',
        path       : '/a/essaies',
        description: '获得所有的文章列表',
        params     : [],
        handler    : [decorator(_getEssaies)]
    }
];

apiProfile.forEach(function (p) {
    var method  = p.method;
    var path    = p.path;
    var handler = p.handler;

    var profileMW = function (req, res, next) {
        req.profile = p;
        next();
    };

    if (!Array.isArray(handler)) throw new Error('handlers middleware must be Array');

    handler.unshift(profileMW);
    var fn        = router[method];

    if (fn && fn instanceof Function) {
        fn.call(router, path, handler);
    }
});

module.exports = {
    router              : router,
    profile             : apiProfile,
    getEssaies          : getEssaies
};