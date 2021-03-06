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
        res.render('index', {r: d});
    });
});

update_scores = function(req, res){
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
                    Players.aggregate().sample(2).then(function(d){
                        res.render('index', {r: d});
                    });
                });
            });
        });
    });
}

app.post('/', function(req, res){update_scores(req, res)});

app.get('/rankings', function(req, res){
    Players.find({}).sort('-score').limit(50).then(function(d){
        res.render('rankings', {players: d});
    });
});

// Start server
var port = process.env.PORT || 8080;
app.listen(port, () => console.log('Listening on port '+port));
