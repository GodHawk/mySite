/**
 * Created by william on 15-7-15.
 */
var app = require('express').Router(),
    Promise = require('bluebird'),
    blogService = require('./blog');

app.get('/',function(req,res,next){
    res.render('index.html',{});
});

app.get('/blogs',function(req,res,next){
    var start = req.query.start || 0,
        rows  = req.query.rows  || 10;
    blogService.getEssaies({},start,rows)
        .then(function(essaies){
            res.render('blogs.html', {essaies:essaies.data,count:essaies.total,
                start:essaies.start,rows:essaies.rows})
        });
});


exports.router = app;
