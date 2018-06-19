var compression = require('compression');
var express = require('express')();
//require('dotenv').config();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Players = require('./models/Players.js');
var serve = require('serve-static');
var s3Proxy = require('s3-proxy');
var elo = require('./elo.js');

var app = express;
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Set module settings
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());
app.use('/static', s3Proxy({
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    overrideCacheControl: 'max-age=100000'
}));

// db connection
var mongoDB = process.env.MONGO_URL;
mongoose.connect(mongoDB, {user:process.env.MONGO_USER, pass:process.env.MONGO_PASSWORD});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Routes
app.get('/', function (req, res){
    Players.aggregate().sample(2).then(function(d){
        res.render('index', {r: d, route: ''});
    });
});

app.get('/hof', function (req, res){
    Players.aggregate().match({bling: "Hall of Fame"}).sample(2).then(function(d){
        res.render('index', {r: d, route: 'hof'});
    });
});

app.get('/active', function (req, res){
    Players.aggregate().match({active: true}).sample(2).then(function(d){
        res.render('index', {r: d, route: 'active'});
    });
});

app.get('/retired', function (req, res){
    Players.aggregate().match({active: false}).sample(2).then(function(d){
        res.render('index', {r: d, route: 'retired'});
    });
});

update_scores = function(req, res, path){
    var playerIds = req.body.playerids.split(":");
    var winner = playerIds[0];
    var loser = playerIds[1];

    Players.findById(winner).then(function(w){
        Players.findById(loser).then(function(l){
            var newScores = elo.EloUpdate(w.score, l.score, 30);
            var newWinScore = newScores[0];
            var newLoseScore = newScores[1];

            Players.findByIdAndUpdate(winner, {score: newWinScore}).then(function(d){
                Players.findByIdAndUpdate(loser, {score: newLoseScore}).then(function(d){
                    if(path=='hof'){
                        Players.aggregate().match({bling: "Hall of Fame"}).sample(2).then(function(d){
                            res.render('index', {r: d, route: 'hof'});
                        });
                    } else if(path=='active'){
                        Players.aggregate().match({active: true}).sample(2).then(function(d){
                            res.render('index', {r: d, route: 'active'});
                        });
                    } else if(path=='retired'){
                    Players.aggregate().match({active: false}).sample(2).then(function(d){
                        res.render('index', {r: d, route: 'retired'});
                    });
                    } else {
                        Players.aggregate().sample(2).then(function(d){
                            res.render('index', {r: d, route: ''});
                        });
                    }
                });
            });
        });
    });
}

app.post('/', function(req, res){update_scores(req, res, '')});
app.post('/hof', function(req, res){update_scores(req, res, 'hof')});
app.post('/active', function(req, res){update_scores(req, res, 'active')});
app.post('/retired', function(req, res){update_scores(req, res, 'retired')});

app.get('/rankings', function(req, res){
    Players.find({}).sort('-score').then(function(d){
        res.render('rankings', {players: d});
    });
});

// Static import directories
// app.use('/static', serve(__dirname + '/public'));

// Start server
var port = process.env.PORT || 8080;
app.listen(port, () => console.log('Listening on port '+port));
