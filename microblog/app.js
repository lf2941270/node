
/**
 * Module dependencies.
 */
//日志功能
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});

var express = require('express');
var routes = require('./routes');

var http = require('http');
var path = require('path');

var app = express();
var MongoStore = require('connect-mongo')(express);//增加(express)
var settings = require('./settings');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.logger({stream: accessLogfile}));//访问日志
app.configure('production', function(){
    app.error(function (err, req, res, next) {
        var meta = '[' + new Date() + '] ' + req.url + '\n';
        errorLogfile.write(meta + err.stack + '\n');
        next();
    });
});

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.session({
    secret: settings.cookieSecret
}))
app.use(express.session({

    store: new MongoStore({
        db: settings.db
    })
}));
//app.helpers()
var util = require('util');
app.locals({
    inspect: function(obj) {
        return util.inspect(obj, true);
    }
});
app.use(function(req, res, next){
    //res.locals.title = config['title']
    //res.locals.csrf = req.session ? req.session._csrf : '';
    res.locals.headers=req.headers;
    res.locals.req = req;
    res.locals.session = req.session;
    res.locals.user=req.session.user;
    res.locals.error= req.session.error ? req.session.error : null;
    res.locals.success =req.session.success? req.session.success : null;
    req.session.error=null;
    req.session.success=null;
    next();
});//locals

app.use(app.router); //改为(app.router)
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port')+' in '+process.env.NODE_ENV+' mode');
});
routes(app);//额外加上