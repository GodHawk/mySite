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

app.get('/blogs/:blogId',function(req,res,next){
    var blogId = req.params["blogId"];

    blogService.getEssayById(blogId)
        .then(function(essay){
            res.render('essay.html',{essay:essay});
        })
});


exports.router = app;
